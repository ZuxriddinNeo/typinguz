import { JSXElement, Show } from "solid-js";

import { getIsScreenshotting } from "../../../states/core";
import { isTestActive as getIsTestActive } from "../../../states/test";
import { cn } from "../../../utils/cn";

export function Footer(): JSXElement {
  return (
    <Show when={!getIsTestActive()}>
      <footer
        class={cn("border-t border-sub/10 px-8 py-12 text-base text-sub", {
          "opacity-0": getIsScreenshotting(),
        })}
      >
        <div class="mx-auto flex max-w-6xl flex-col gap-10 transition-opacity">
          <div class="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div class="flex flex-col gap-3">
              <a
                href="/"
                class="text-lg font-bold text-text hover:text-main"
                router-link
              >
                TypeUZ.uz
              </a>
              <p class="text-sm leading-relaxed text-sub/70">
                O&apos;zbekistonning 1-raqamli yozuv tezligi testi platformasi.
                O&apos;zbek, Ingliz va Rus tillarida tezlikni oshiring, AI
                tahlil orqali natijalaringizni kuzating va reytingda yuksaling.
              </p>
            </div>

            <div class="flex flex-col gap-3">
              <h4 class="text-sm font-semibold tracking-widest text-sub/50 uppercase">
                Sahifalar
              </h4>
              <div class="flex flex-col gap-2">
                <a
                  href="/test"
                  class="text-sm text-sub/70 transition-colors hover:text-text"
                  router-link
                >
                  Test
                </a>
                <a
                  href="/leaderboards"
                  class="text-sm text-sub/70 transition-colors hover:text-text"
                  router-link
                >
                  Reyting
                </a>
                <a
                  href="/about"
                  class="text-sm text-sub/70 transition-colors hover:text-text"
                  router-link
                >
                  Haqida
                </a>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <h4 class="text-sm font-semibold tracking-widest text-sub/50 uppercase">
                Hujjatlar
              </h4>
              <div class="flex flex-col gap-2">
                <a
                  href="/privacy-policy"
                  class="text-sm text-sub/70 transition-colors hover:text-text"
                  router-link
                >
                  Maxfiylik siyosati
                </a>
                <a
                  href="/terms-of-service"
                  class="text-sm text-sub/70 transition-colors hover:text-text"
                  router-link
                >
                  Foydalanish shartlari
                </a>
                <a
                  href="/security-policy"
                  class="text-sm text-sub/70 transition-colors hover:text-text"
                  router-link
                >
                  Xavfsizlik siyosati
                </a>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <h4 class="text-sm font-semibold tracking-widest text-sub/50 uppercase">
                Ijtimoiy
              </h4>
              <div class="flex flex-col gap-2">
                <a
                  href="https://t.me/typeuz"
                  class="flex items-center gap-2 text-sm text-sub/70 transition-colors hover:text-text"
                >
                  <svg
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.127.087.496.122.629.156.61.443 2.165.556 3.303.11 1.194.057 2.235-.444 2.663a1.266 1.266 0 01-.49.243c-.477.116-1.11-.152-1.724-.476-.484-.256-1.801-1.184-2.39-1.445-.174-.078-.25-.223-.006-.397.423-.356 1.025-.985 1.39-1.322.423-.39.125-.594-.222-.39l-1.755 1.12c-.643.402-1.426.584-1.859.4-.43-.182-.914-.436-1.34-.663-.519-.312-.968-.627-.919-1.026.03-.233.3-.472.844-.717.878-.396 1.992-.79 3.042-1.19 1.183-.452 2.484-.858 3.486-1.14 1.915-.538 2.328-.6 2.615-.598zm.002.001z"></path>
                  </svg>
                  Telegram
                </a>
                <a
                  href="https://instagram.com/typeuz"
                  class="flex items-center gap-2 text-sm text-sub/70 transition-colors hover:text-text"
                >
                  <svg
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-2 border-t border-sub/10 pt-6 text-center text-sm text-sub/50">
            <p>&copy; {new Date().getFullYear()} TypeUZ.uz</p>
          </div>
        </div>
      </footer>
    </Show>
  );
}
