// oxlint-disable react/no-unknown-property
// oxlint-disable react/no-unescaped-entities
import { JSXElement } from "solid-js";
import type { FaSolidIcon } from "../../../types/font-awesome";

import { Fa } from "../../common/Fa";

function FeatureCard(props: {
  icon: FaSolidIcon;
  title: string;
  desc: string;
}): JSXElement {
  return (
    <div class="flex flex-col items-center gap-5 rounded-2xl border border-sub/10 bg-bg/50 p-12 text-center backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:border-main/20 hover:shadow-lg hover:shadow-main/5">
      <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-main/10 text-3xl text-main">
        <Fa icon={props.icon} />
      </div>
      <h3 class="text-xl font-semibold text-text">{props.title}</h3>
      <p class="max-w-xs text-base leading-relaxed text-sub">{props.desc}</p>
    </div>
  );
}

function StatsCard(props: {
  value: string;
  label: string;
}): JSXElement {
  return (
    <div class="flex flex-col items-center gap-1">
      <span class="text-3xl font-bold text-main">{props.value}</span>
      <span class="text-sm text-sub">{props.label}</span>
    </div>
  );
}

function StepCard(props: {
  step: string;
  icon: FaSolidIcon;
  title: string;
  desc: string;
}): JSXElement {
  return (
    <div class="flex flex-col items-center gap-4 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full border border-main/20 bg-main/5 text-sm font-bold text-main">
        {props.step}
      </div>
      <div class="text-2xl text-main">
        <Fa icon={props.icon} />
      </div>
      <h3 class="text-lg font-semibold text-text">{props.title}</h3>
      <p class="max-w-xs text-base leading-relaxed text-sub">{props.desc}</p>
    </div>
  );
}

export function LandingPage(): JSXElement {
  return (
    <main class="flex flex-col items-center">
      {/* Hero */}
      <section class="relative flex min-h-[85vh] w-full flex-col items-center justify-center overflow-hidden px-6">
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-main/5 to-transparent"></div>
        <div class="flex max-w-6xl flex-col items-center gap-8 text-center">
          <div class="mb-2 flex items-center justify-center">
            <div class="relative">
              <div class="absolute -inset-3 rounded-2xl bg-gradient-to-b from-main/15 via-main/5 to-transparent blur-xl"></div>
              <svg class="relative h-auto w-full max-w-[420px]" viewBox="0 0 420 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="16" width="380" height="128" rx="12" stroke="url(#l-grad)" stroke-width="1.5" fill="none" opacity="0.4"></rect>
                <defs>
                  <linearGradient id="l-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ff5a1f"></stop>
                    <stop offset="100%" stop-color="#ff5a1f" stop-opacity="0.3"></stop>
                  </linearGradient>
                </defs>
                <text x="210" y="106" text-anchor="middle" fill="#ff5a1f" font-size="52" font-weight="900" font-family="system-ui,sans-serif" letter-spacing="2">TypeUZ</text>
                <rect x="158" y="12" width="104" height="4" rx="2" fill="#ff5a1f" opacity="0.3"></rect>
                <rect x="158" y="144" width="104" height="4" rx="2" fill="#ff5a1f" opacity="0.3"></rect>
                <text x="210" y="140" text-anchor="middle" fill="#ff5a1f" font-size="10" font-weight="500" font-family="system-ui,sans-serif" opacity="0.5" letter-spacing="4">TEZ YOZ</text>
              </svg>
            </div>
          </div>
          <div class="inline-flex items-center gap-2 rounded-full border border-main/20 bg-transparent px-4 py-1.5 text-xs font-medium tracking-wide text-main/80">
            Yozuv tezligi testi
          </div>
          <h1 class="text-7xl font-extrabold tracking-tight text-text sm:text-8xl lg:text-9xl">
            Tez yozishni
            <br />
            <span class="text-main">o&apos;rganing</span>
          </h1>
          <p class="max-w-2xl text-lg leading-relaxed text-sub">
            O&apos;z yozuv tezligingizni sinab ko&apos;ring, reytingda yuksaling
            va do&apos;stlaringiz bilan bellashing. O&apos;zbek, ingliz va rus
            tillarida yozuv tezligi testi.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <a
              href="/test"
              class="inline-flex items-center gap-2 rounded-full bg-main px-10 py-4 text-base font-semibold text-bg transition-all hover:scale-105 hover:shadow-lg hover:shadow-main/25"
              router-link
            >
              Testni boshlash
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
            <a
              href="/leaderboards"
              class="inline-flex items-center gap-2 rounded-full border border-sub/20 bg-transparent px-10 py-4 text-base font-semibold text-sub transition-all hover:border-main/50 hover:text-main"
              router-link
            >
              Reytingni ko&apos;rish
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section class="flex w-full max-w-6xl flex-col items-center gap-12 px-6 pb-24">
        <div class="flex flex-col items-center gap-2 text-center">
          <h2 class="text-3xl font-bold text-text">Qanday ishlaydi?</h2>
          <p class="max-w-md text-base text-sub">Uch qadamda boshlang</p>
        </div>
        <div class="grid w-full grid-cols-1 gap-10 sm:grid-cols-3">
          <StepCard
            step="1"
            icon="fa-cog"
            title="Sozlamalarni tanlang"
            desc="Vaqt, til va kontent turini o'zingizga moslab oling"
          />
          <StepCard
            step="2"
            icon="fa-keyboard"
            title="Yozishni boshlang"
            desc="Berilgan matnni iloji boricha tez va aniq yozing"
          />
          <StepCard
            step="3"
            icon="fa-chart-line"
            title="Natijalarni ko'ring"
            desc="WPM, aniqlik va reytingdagi o'rningizni bilib oling"
          />
        </div>
      </section>

      {/* Features */}
      <section class="flex w-full max-w-6xl flex-col items-center gap-12 px-6 pb-24">
        <div class="flex flex-col items-center gap-2 text-center">
          <h2 class="text-3xl font-bold text-text">Nega TypeUZ?</h2>
          <p class="max-w-md text-base text-sub">
            Bepul, tez va samarali yozuv tezligi testi
          </p>
        </div>
        <div class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="fa-tachometer-alt"
            title="Tezlikni o'lchash"
            desc="WPM, aniqlik va vaqtni real vaqtda kuzating"
          />
          <FeatureCard
            icon="fa-chart-bar"
            title="Statistika"
            desc="Barcha natijalaringizni saqlang va tahlil qiling"
          />
          <FeatureCard
            icon="fa-trophy"
            title="Reyting"
            desc="Boshqa foydalanuvchilar bilan bellashing"
          />
          <FeatureCard
            icon="fa-language"
            title="3 tilda"
            desc="O'zbek, ingliz va rus tillarini qo'llab-quvvatlaydi"
          />
          <FeatureCard
            icon="fa-clock"
            title="Mos vaqt"
            desc="10 soniyadan 30 daqiqagacha bo'lgan testlar"
          />
          <FeatureCard
            icon="fa-bolt"
            title="Real vaqt"
            desc="Jonli WPM va aniqlik ko'rsatkichlari"
          />
          <FeatureCard
            icon="fa-robot"
            title="AI tahlil"
            desc="Haftalik yozish tezligingiz haqida batafsil AI tahlilini oling"
          />
        </div>
      </section>

      {/* Stats */}
      <section class="flex w-full flex-col items-center gap-12 bg-main/5 px-6 py-20">
        <div class="flex flex-col items-center gap-2 text-center">
          <h2 class="text-3xl font-bold text-text">Platforma raqamlarda</h2>
          <p class="max-w-md text-base text-sub">
            TypeUZ jamoasi bilan birga o'sib bormoqda
          </p>
        </div>
        <div class="grid grid-cols-2 gap-12 sm:grid-cols-4">
          <StatsCard value="12,000+" label="Foydalanuvchilar" />
          <StatsCard value="85,000+" label="Testlar bajarilgan" />
          <StatsCard value="45 WPM" label="O'rtacha tezlik" />
          <StatsCard value="3 ta" label="Tillar" />
        </div>
      </section>

      {/* FAQ */}
      <section class="flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-24">
        <h2 class="text-3xl font-bold text-text">Ko'p beriladigan savollar</h2>
        <div class="flex w-full flex-col gap-4">
          <details class="group rounded-2xl border border-sub/10 bg-bg/50 p-5 transition-colors hover:border-main/20">
            <summary class="flex cursor-pointer items-center justify-between font-medium text-text">
              TypeUZ bepulmi?
              <span class="text-sub transition-transform group-open:rotate-180">
                <Fa icon="fa-chevron-down" />
              </span>
            </summary>
            <p class="mt-3 text-base leading-relaxed text-sub">
              Ha, TypeUZ butunlay bepul. Ro'yxatdan o'tish va barcha
              funksiyalardan foydalanish uchun hech qanday to'lov talab
              qilinmaydi.
            </p>
          </details>
          <details class="group rounded-2xl border border-sub/10 bg-bg/50 p-5 transition-colors hover:border-main/20">
            <summary class="flex cursor-pointer items-center justify-between font-medium text-text">
              Natijalarim qayerda saqlanadi?
              <span class="text-sub transition-transform group-open:rotate-180">
                <Fa icon="fa-chevron-down" />
              </span>
            </summary>
            <p class="mt-3 text-base leading-relaxed text-sub">
              Ro'yxatdan o'tgan foydalanuvchilarning barcha natijalari
              profilingizda saqlanadi va istalgan vaqtda ko'rish mumkin.
            </p>
          </details>
          <details class="group rounded-2xl border border-sub/10 bg-bg/50 p-5 transition-colors hover:border-main/20">
            <summary class="flex cursor-pointer items-center justify-between font-medium text-text">
              Qanday tillar mavjud?
              <span class="text-sub transition-transform group-open:rotate-180">
                <Fa icon="fa-chevron-down" />
              </span>
            </summary>
            <p class="mt-3 text-base leading-relaxed text-sub">
              Hozirda o'zbek, ingliz va rus tillarida test topshirish mumkin.
              Tez orada yana yangi tillar qo'shiladi.
            </p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section class="flex w-full flex-col items-center px-6 pb-24 pt-8 text-center">
        <div class="max-w-4xl">
          <p class="mb-4 text-5xl font-bold text-text">Bugun boshlang</p>
          <p class="mb-8 text-base leading-relaxed text-sub">
            Ro'yxatdan o'ting va natijalaringizni kuzatishni,
            reytingda yuksalishni boshlang
          </p>
          <a
            href="/login"
            class="inline-flex items-center gap-2 rounded-full bg-main px-10 py-4 text-base font-semibold text-bg transition-all hover:scale-105 hover:shadow-lg hover:shadow-main/25"
            router-link
          >
            Ro'yxatdan o'tish
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
