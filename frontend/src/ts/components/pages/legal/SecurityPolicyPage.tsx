// oxlint-disable react/no-unescaped-entities
import { For, JSXElement } from "solid-js";
import { AnimatedSection } from "../../common/AnimatedSection";
import { Fa } from "../../common/Fa";

const sections = [
  {
    icon: "fa-bug",
    title: "Zaiflikni qanday xabar qilish kerak",
    content: (
      <div class="space-y-4 text-base leading-relaxed text-sub">
        <p>TypeUZ xavfsizligi va yaxlitligini juda jiddiy qabul qilamiz. Agar platformamizda zaiflik topgan bo'lsangiz, iltimos, uni imkon qadar tezroq bizga xabar qiling. Sizning hisobotingiz platformamizni xavfsizroq qilishga yordam beradi.</p>
        <p>Zaiflikni xabar qilish uchun quyidagi manzilga yozing:</p>
        <p><a href="mailto:contact@typeuz.uz" class="text-main underline hover:no-underline">contact@typeuz.uz</a></p>
        <p class="mt-4 font-semibold text-text">Iltimos, xabaringizga quyidagi ma'lumotlarni kiriting:</p>
        <ul class="list-inside list-disc space-y-1.5 pl-2">
          <li><strong class="text-text">Zaiflik tavsifi</strong> — qayerda va qanday zaiflik topilgani</li>
          <li><strong class="text-text">Qayta tiklash usuli (Proof of Concept)</strong> — zaiflikni qanday takrorlash mumkin</li>
          <li><strong class="text-text">Ta'sir darajasi</strong> — zaiflik qanday oqibatlarga olib kelishi mumkin</li>
          <li><strong class="text-text">Skrinshotlar yoki video</strong> — zaiflikni ko'rsatuvchi dalillar</li>
          <li><strong class="text-text">Brauzer va qurilma ma'lumotlari</strong> — versiyalar, operatsion tizim</li>
        </ul>
        <p class="mt-4">Barcha hisobotlar maxfiy tarzda ko'rib chiqiladi.</p>
      </div>
    ),
  },
  {
    icon: "fa-list-check",
    title: "Hisobot topshirish qoidalari",
    content: (
      <div class="space-y-4 text-base leading-relaxed text-sub">
        <p class="font-semibold text-text">Zaifliklarni tekshirish va hisobot qilishda quyidagi qoidalarga rioya qiling:</p>
        <ul class="list-inside list-disc space-y-1.5 pl-2">
          <li><strong class="text-text">DoS hujumlaridan saqlaning</strong> — Xizmat ko'rsatishni rad etish (DoS) holatiga olib keladigan faoliyatlar bilan shug'ullanmang.</li>
          <li><strong class="text-text">Boshqa foydalanuvchilar ma'lumotlariga kirmang</strong> — Faqat o'zingizning test hisoblaringizdan foydalaning.</li>
          <li><strong class="text-text">Production muhitida sinov o'tkazmang</strong> — Zaifliklarni ishlab chiqarish muhitida emas, balki nazariy tarzda tasvirlang.</li>
          <li><strong class="text-text">Ma'lumotlarni oshkor qilmang</strong> — Zaiflik bartaraf etilgunga qadar uni boshqalarga oshkor qilmang.</li>
          <li><strong class="text-text">Avtomatlashtirilgan skanerlardan foydalanmang</strong> — Ruxsatsiz avtomatik skanerlash va zaifliklarni qidirish taqiqlanadi.</li>
        </ul>
      </div>
    ),
  },
  {
    icon: "fa-clock",
    title: "Javob berish muddatlari",
    content: (
      <div class="space-y-4 text-base leading-relaxed text-sub">
        <p>Biz barcha hisobotlarni quyidagi muddatlarda ko'rib chiqamiz:</p>
        <ul class="list-inside list-disc space-y-1.5 pl-2">
          <li><strong class="text-text">Dastlabki javob:</strong> 72 soat ichida</li>
          <li><strong class="text-text">Zaiflikni tasdiqlash:</strong> 5 ish kuni ichida</li>
          <li><strong class="text-text">Zaiflikni bartaraf etish:</strong> Zaiflik darajasiga qarab 7-30 kun</li>
        </ul>
        <p class="mt-4">Zaiflik bartaraf etilgandan so'ng, sizning hisobotingiz uchun minnatdorchilik bildiramiz va sizni xavfsizlik bo'yicha maxsus ro'yxatga kiritamiz (agar xohlasangiz).</p>
      </div>
    ),
  },
];

export function SecurityPolicyPage(): JSXElement {
  return (
    <div class="mx-auto mt-16 flex max-w-6xl flex-col gap-16 px-6 pb-24">
      <section class="text-center">
        <div class="mb-4">
          <span class="text-5xl font-extrabold tracking-tight text-text">
            Xavfsizlik <span class="text-main">siyosati</span>
          </span>
        </div>
        <p class="mx-auto max-w-xl text-sm text-sub/70">TypeUZ xavfsizlik siyosati — zaifliklarni qanday hisobot qilish va xavfsizlik masalalari.</p>
      </section>

      <For each={sections}>
        {(section) => (
          <AnimatedSection>
            <section class="rounded-2xl border border-sub/10 bg-bg/50 backdrop-blur-sm p-8">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-main/10 text-lg text-main">
                  <Fa icon={section.icon as never} />
                </div>
                <h2 class="text-2xl font-bold text-text">{section.title}</h2>
              </div>
              <div class="mt-6">{section.content}</div>
            </section>
          </AnimatedSection>
        )}
      </For>

      <AnimatedSection>
        <section class="rounded-2xl border border-main/10 bg-bg/50 backdrop-blur-sm p-8">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-main/10 text-lg text-main">
              <Fa icon="fa-envelope" />
            </div>
            <h2 class="text-2xl font-bold text-text">Biz bilan bog'lanish</h2>
          </div>
          <div class="mt-6 space-y-3 text-base text-sub">
            <p>Savollaringiz bo'lsa, biz bilan bog'laning:</p>
            <p>Email: <a href="mailto:contact@typeuz.uz" class="text-main underline hover:no-underline">contact@typeuz.uz</a></p>
            <p>Telegram: <a href="https://t.me/typeuz" class="text-main underline hover:no-underline">@typeuz</a></p>
            <p>IT o'quv markazi<br />O'zbekiston Respublikasi</p>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
