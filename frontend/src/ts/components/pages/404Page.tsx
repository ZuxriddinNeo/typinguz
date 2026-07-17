// oxlint-disable react/no-unescaped-entities
import { Fa } from "../common/Fa";
import { Page } from "../common/Page";

export function NotFoundPage() {
  return (
    <Page id="404">
      <div class="flex h-full items-center justify-center px-6">
        <div class="flex max-w-lg flex-col items-center gap-8 text-center">
          <div class="relative">
            <div class="absolute -inset-8 rounded-full bg-main/5 blur-3xl"></div>
            <div class="relative text-9xl font-extrabold tracking-tight text-main">
              404
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-2xl font-bold text-text">Sahifa topilmadi</p>
            <p class="text-base leading-relaxed text-sub">
              Kechirasiz, qidirayotgan sahifangiz mavjud emas yoki ko'chirilgan.
            </p>
          </div>
          <a
            href="/"
            router-link
            class="inline-flex items-center gap-2 rounded-full bg-main px-8 py-4 text-base font-semibold text-bg transition-all hover:scale-105 hover:shadow-lg hover:shadow-main/25"
          >
            <Fa icon="fa-arrow-left" />
            Bosh sahifaga qaytish
          </a>
        </div>
      </div>
    </Page>
  );
}
