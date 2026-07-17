<div align="center">

# ⌨️ TypeUZ

**O'zbekistonning 1-raqamli yozuv tezligi platformasi**

O'zbek, ingliz va rus tillarida yozuv tezligingizni sinang, statistikangizni kuzating, reytingda raqobatlashing va sun'iy intellekt yordamida haftalik tahlil oling.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-blue?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-cache-red?logo=redis)](https://redis.io/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#license)

[Demo](https://typeuz.uz) · [Xatolik xabar qilish](../../issues) · [So'rov yuborish](../../issues)

</div>

---

## 📖 Mundarija

- [Xususiyatlar](#-xususiyatlar)
- [Texnologiyalar](#-texnologiyalar)
- [Loyihani ishga tushirish](#-loyihani-ishga-tushirish)
- [Muhit o'zgaruvchilari](#-muhit-ozgaruvchilari)
- [Loyiha tuzilishi](#-loyiha-tuzilishi)
- [Skriptlar](#-skriptlar)
- [Hissa qo'shish](#-hissa-qoshish)
- [Litsenziya](#-litsenziya)

---

## ✨ Xususiyatlar

- ⚡️ **Real vaqtli yozuv testi** — WPM, aniqlik va konsistentlik real vaqtda hisoblanadi
- 🌐 **3 tilda kontent** — o'zbek, ingliz va rus tillarida matn va raqam rejimlari
- 🏆 **Reyting tizimi** — til, rejim va davomiylik bo'yicha filtrlanadigan global reyting
- 👤 **Shaxsiy profil** — test tarixi, statistika va shaxsiy rekordlar
- 🤖 **Haftalik AI tahlil** — yozuv odatlaringiz sun'iy intellekt tomonidan tahlil qilinadi va shaxsiy tavsiyalar beriladi
- 🔐 **Ko'p usulli autentifikatsiya** — email, Google va GitHub orqali kirish, CAPTCHA himoyasi bilan
- 🆔 **Username tizimi** — noyob foydalanuvchi nomi, 14 kunlik faolsizlikdan keyin avtomatik ozod qilinadi
- 🎨 **Dark / Light rejim** — to'liq temalashtirilgan interfeys
- 🛠️ **Admin panel** — analitika, kontent boshqaruvi va bildirishnomalar uchun to'liq boshqaruv paneli
- 🚀 **SEO va tezlikka optimallashtirilgan** — SSR/SSG, to'liq structured data va yuqori Core Web Vitals

## 🧱 Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes / Route Handlers |
| Ma'lumotlar bazasi | PostgreSQL |
| Kesh | Redis |
| Autentifikatsiya | NextAuth.js (Email, Google, GitHub) |
| Holat boshqaruvi | TanStack Query |

## 🚀 Loyihani ishga tushirish

### Talablar

- Node.js 18+
- PostgreSQL instansi
- Redis instansi

### O'rnatish

```bash
# Repozitoriyani klonlash
git clone https://github.com/<username>/typeuz.git
cd typeuz

# Bog'liqliklarni o'rnatish
npm install

# Muhit o'zgaruvchilarini sozlash
cp .env.example .env.local

# Ma'lumotlar bazasi migratsiyalarini bajarish
npm run db:migrate

# Loyihani ishga tushirish
npm run dev
```

Loyiha [http://localhost:3000](http://localhost:3000) manzilida ochiladi.

## 🔑 Muhit o'zgaruvchilari

`.env.local` faylida quyidagi o'zgaruvchilarni sozlang:

```env
DATABASE_URL=
REDIS_URL=

NEXTAUTH_URL=
NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

CAPTCHA_SITE_KEY=
CAPTCHA_SECRET_KEY=

AI_ANALYSIS_API_KEY=
```

## 📁 Loyiha tuzilishi

```
typeuz/
├── app/                  # Next.js App Router sahifalari
│   ├── (public)/         # Landing, test, reyting, haqida
│   ├── (auth)/           # Login, ro'yxatdan o'tish, onboarding
│   ├── profile/          # Foydalanuvchi profili
│   ├── admin-dashboard/  # Admin panel
│   └── api/              # API route handlerlari
├── components/           # Qayta ishlatiladigan UI komponentlari
├── lib/                  # Yordamchi funksiyalar, DB/Redis klientlari
├── hooks/                # Custom React hooklar
├── public/                # Statik fayllar (rasmlar, favicon)
└── prisma/ yoki db/       # Ma'lumotlar bazasi sxemasi va migratsiyalar
```

## 📜 Skriptlar

| Buyruq | Tavsif |
|---|---|
| `npm run dev` | Development serverini ishga tushiradi |
| `npm run build` | Production uchun build qiladi |
| `npm run start` | Production serverini ishga tushiradi |
| `npm run lint` | Lint tekshiruvini bajaradi |
| `npm run db:migrate` | Ma'lumotlar bazasi migratsiyalarini bajaradi |

## 🤝 Hissa qo'shish

Hissa qo'shishni xohlaysizmi? Xush kelibsiz!

1. Repozitoriyani fork qiling
2. Yangi branch yarating (`git checkout -b feature/yangi-xususiyat`)
3. O'zgarishlaringizni commit qiling (`git commit -m "Yangi xususiyat qo'shildi"`)
4. Branchni push qiling (`git push origin feature/yangi-xususiyat`)
5. Pull Request oching

## 📄 Litsenziya

Ushbu loyiha [MIT litsenziyasi](LICENSE) ostida tarqatiladi.

---

<div align="center">

Ishlab chiqildi ❤️ bilan — **TypeUZ jamoasi**

</div>
