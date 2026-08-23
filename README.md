# Chaqiruv xat

Excel (HEMIS) ma'lumotlaridan Word chaqiruv ma'lumotnomasi yaratish — **frontend-only**, brauzerda.

## Ishlatish

```bash
npm install
npm run dev
```

1. Excel yuklang (`hemis_id`, `full_name`, `faculty`, `level`, `group`, `semester`, `specialty_code`)
2. Guruhlar ro‘yxati chiqadi
3. **Shablon yaratish** → **Guruh qo‘shish**
4. Umumiy maydonlarni to‘ldiring (sana, kod, `start_num`, …)
5. **Word yuklab olish** — har shablon = 1 `.docx` (guruhlar ketma-ket, `001`, `002`, …)

Namuna: `public/chaqiruv-namuna.docx`  
Test Excel: `public/sample-students.xlsx`
