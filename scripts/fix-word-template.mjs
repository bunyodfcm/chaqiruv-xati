import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, relative } from 'node:path'
import { tmpdir } from 'node:os'
import PizZip from 'pizzip'

const root = process.cwd()
const srcDocx = join(root, 'public', 'chaqiruv-namuna.docx')
const workDir = join(tmpdir(), 'fix-chaqiruv-docx')

rmSync(workDir, { recursive: true, force: true })
mkdirSync(workDir, { recursive: true })
execSync(`unzip -o "${srcDocx}" -d "${workDir}"`, { stdio: 'inherit' })

const docPath = join(workDir, 'word', 'document.xml')
let xml = readFileSync(docPath, 'utf8')

function decodeXml(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
}

function encodeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Merge placeholders that Word split across multiple w:t runs within a paragraph. */
function fixParagraph(para) {
  const texts = [...para.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map((m) =>
    decodeXml(m[1]),
  )
  const plain = texts.join('')
  if (!/\{[^{}]+\}/.test(plain)) return para

  const tags = [...plain.matchAll(/\{[^{}]+\}/g)].map((m) => m[0])
  const needsFix = tags.some((tag) => !texts.some((t) => t.includes(tag)))
  if (!needsFix) return para

  const open = para.match(/^<w:p[^>]*>/)?.[0] ?? '<w:p>'
  const props = para.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0] ?? ''
  const drawings = [
    ...para.matchAll(
      /<w:r\b[^>]*>[\s\S]*?<w:drawing>[\s\S]*?<\/w:drawing>[\s\S]*?<\/w:r>/g,
    ),
  ].map((m) => m[0])
  const firstRPr =
    para.match(/<w:r\b[^>]*>[\s\S]*?(<w:rPr>[\s\S]*?<\/w:rPr>)/)?.[1] ?? ''

  const textRun = `<w:r>${firstRPr}<w:t xml:space="preserve">${encodeXml(plain)}</w:t></w:r>`
  return `${open}${props}${drawings.join('')}${textRun}</w:p>`
}

xml = xml.replace(/<w:p[\s>][\s\S]*?<\/w:p>/g, fixParagraph)

const contiguous = [...xml.matchAll(/\{[^{}<>]+\}/g)].map((m) => m[0])
console.log('Tags after merge:', [...new Set(contiguous)])

const tableMatch = xml.match(/<w:tbl>[\s\S]*?<\/w:tbl>/)
if (!tableMatch) throw new Error('Table not found in template')

const table = tableMatch[0]
const rows = [...table.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)].map((m) => m[0])
if (rows.length < 2) throw new Error('Expected header + data rows')

const headerRow = rows[0]
const sampleDataRow = rows[1]

function setRowCells(rowXml, values) {
  let i = 0
  return rowXml.replace(/<w:tc\b[\s\S]*?<\/w:tc>/g, (cell) => {
    if (i >= values.length) return cell
    const value = values[i++]
    let first = true
    return cell.replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g, () => {
      if (first) {
        first = false
        return `<w:t xml:space="preserve">${encodeXml(value)}</w:t>`
      }
      return `<w:t></w:t>`
    })
  })
}

const loopRow = setRowCells(sampleDataRow, [
  '{#students}{index}',
  '{hemis_id}',
  '{student_name}{/students}',
])

const tblStart = table.match(/^<w:tbl>[\s\S]*?(?=<w:tr\b)/)?.[0]
if (!tblStart) throw new Error('Could not parse table start')

const rebuiltTable = `${tblStart}${headerRow}${loopRow}</w:tbl>`
xml = xml.replace(table, rebuiltTable)

const bodyMatch = xml.match(/<w:body>([\s\S]*)<\/w:body>/)
if (!bodyMatch) throw new Error('Body not found')

const bodyInner = bodyMatch[1]
const sectPrMatch = bodyInner.match(/<w:sectPr[\s\S]*<\/w:sectPr>\s*$/)
const sectPr = sectPrMatch?.[0] ?? ''
const content = sectPr ? bodyInner.slice(0, -sectPr.length) : bodyInner

const pageBreak = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`
const wrapped = [
  `<w:p><w:r><w:t>{#letters}</w:t></w:r></w:p>`,
  content,
  `<w:p><w:r><w:t>{^last}</w:t></w:r></w:p>`,
  pageBreak,
  `<w:p><w:r><w:t>{/last}</w:t></w:r></w:p>`,
  `<w:p><w:r><w:t>{/letters}</w:t></w:r></w:p>`,
  sectPr,
].join('')

xml = xml.replace(/<w:body>[\s\S]*<\/w:body>/, `<w:body>${wrapped}</w:body>`)
writeFileSync(docPath, xml)

function collectFiles(dir, base = dir) {
  const entries = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      entries.push(...collectFiles(full, base))
    } else {
      entries.push({
        path: relative(base, full).replace(/\\/g, '/'),
        data: readFileSync(full),
      })
    }
  }
  return entries
}

const zip = new PizZip()
for (const file of collectFiles(workDir)) {
  zip.file(file.path, file.data)
}

const outDocx = join(root, 'public', 'chaqiruv-namuna.docx')
writeFileSync(outDocx, zip.generate({ type: 'nodebuffer' }))

const check = readFileSync(docPath, 'utf8')
console.log(
  'Final tags:',
  [
    ...new Set(
      [...check.matchAll(/\{[/#^]?[^{}<>]+\}/g)].map((m) => m[0]),
    ),
  ],
)
console.log('Has students loop:', check.includes('{#students}'))
console.log('Has letters loop:', check.includes('{#letters}'))
console.log('Done:', outDocx)
