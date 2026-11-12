import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import PizZip from 'pizzip'

const root = process.cwd()
const srcDocx = join(root, 'public', 'davomat-namuna.docx')

const zip = new PizZip(readFileSync(srcDocx))
const docPath = 'word/document.xml'
let xml = zip.file(docPath).asText()

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

xml = xml.replace(
  /Iqtisodiyot fakulteti\s*/g,
  '{fakultet}',
)

xml = xml.replace(
  /o‘quv yili kuzgi semestrida uzrli sabablarsiz 30 soat/g,
  'o‘quv yili {semestr} semestrida uzrli sabablarsiz {ogohlantirish_soati} soat',
)
xml = xml.replace(
  /o'quv yili kuzgi semestrida uzrli sabablarsiz 30 soat/g,
  "o'quv yili {semestr} semestrida uzrli sabablarsiz {ogohlantirish_soati} soat",
)

const tableMatch = xml.match(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/)
if (!tableMatch) throw new Error('Table not found in template')

const table = tableMatch[0]
const rows = [...table.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)].map((m) => m[0])
if (rows.length < 3) throw new Error('Expected header + data + total rows')

const headerRow = rows[0]
const sampleDataRow = rows[1]
const totalRow = rows[2]

function setRowCells(rowXml, values) {
  let i = 0
  return rowXml.replace(/<w:tc\b[\s\S]*?<\/w:tc>/g, (cell) => {
    if (i >= values.length) return cell
    const value = values[i++]
    if (!value) return cell
    if (/<w:t[\s>]/.test(cell)) {
      let first = true
      return cell.replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g, () => {
        if (first) {
          first = false
          return `<w:t xml:space="preserve">${encodeXml(value)}</w:t>`
        }
        return `<w:t></w:t>`
      })
    }
    return cell.replace(
      /<\/w:p>/,
      `<w:r><w:t xml:space="preserve">${encodeXml(value)}</w:t></w:r></w:p>`,
    )
  })
}

const loopRow = setRowCells(sampleDataRow, [
  '{#talabalar}{index}',
  '{student_name}',
  '{hemis_id}',
  '{group}',
  '{kurs}',
  '{soat}{/talabalar}',
  '',
])

const tblStart = table.match(/^<w:tbl[\s>][\s\S]*?(?=<w:tr\b)/)?.[0]
if (!tblStart) throw new Error('Could not parse table start')

const rebuiltTable = `${tblStart}${headerRow}${loopRow}${totalRow}</w:tbl>`
xml = xml.replace(table, rebuiltTable)

const bodyMatch = xml.match(/<w:body>([\s\S]*)<\/w:body>/)
if (!bodyMatch) throw new Error('Body not found')

const bodyInner = bodyMatch[1]
const lastSect = bodyInner.lastIndexOf('<w:sectPr')
if (lastSect < 0) throw new Error('Body sectPr not found')
const sectPr = bodyInner.slice(lastSect)
const content = bodyInner.slice(0, lastSect)

const annexParaRe =
  /<w:p[\s>][\s\S]*?\{bildirgi_chiqqan_sana\}[\s\S]*?<\/w:p>/
const annexMatch = annexParaRe.exec(content)
if (!annexMatch) throw new Error('Annex start paragraph not found')

const bildirgi = content.slice(0, annexMatch.index)
const annex = content.slice(annexMatch.index)

const ilovaHeadingRe =
  /(<w:p[\s>][\s\S]*?bildirgisiga ilova[\s\S]*?<\/w:p>)/
if (!ilovaHeadingRe.test(annex)) {
  throw new Error('Ilova heading not found')
}

const tutorPara = `<w:p><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">Tyutor: {tyutor_ismi}</w:t></w:r></w:p>`
const annexWithTutor = annex.replace(ilovaHeadingRe, `$1${tutorPara}`)

const pageBreak = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`
const wrapped = [
  bildirgi,
  `<w:p><w:r><w:t>{#ilovalar}</w:t></w:r></w:p>`,
  pageBreak,
  annexWithTutor,
  `<w:p><w:r><w:t>{/ilovalar}</w:t></w:r></w:p>`,
  sectPr,
].join('')

xml = xml.replace(/<w:body>[\s\S]*<\/w:body>/, `<w:body>${wrapped}</w:body>`)

zip.file(docPath, xml)
const outBuffer = zip.generate({ type: 'nodebuffer' })
const outDocx = join(root, 'public', 'davomat-namuna.docx')
const tmpDocx = join(root, 'public', 'davomat-namuna.next.docx')
writeFileSync(tmpDocx, outBuffer)
try {
  writeFileSync(outDocx, outBuffer)
} catch (err) {
  console.warn('Could not overwrite davomat-namuna.docx (locked). Using davomat-namuna.next.docx')
  console.warn(String(err))
}

const check = xml
console.log(
  'Final tags:',
  [
    ...new Set(
      [...check.matchAll(/\{[/#^]?[^{}<>]+\}/g)].map((m) => m[0]),
    ),
  ],
)
console.log('Has talabalar loop:', check.includes('{#talabalar}'))
console.log('Has ilovalar loop:', check.includes('{#ilovalar}'))
console.log('Has tyutor_ismi:', check.includes('{tyutor_ismi}'))
console.log('Has fakultet:', check.includes('{fakultet}'))
console.log('Done:', outDocx)
