import { useQuery } from "@tanstack/solid-query";
import { For, JSXElement, Show } from "solid-js";
import type { Language } from "@monkeytype/schemas/languages";

import {
  getLeaderboardQueryOptions,
  getRankQueryOptions,
} from "../../../queries/leaderboards";
import { getActivePage, isAuthenticated } from "../../../states/core";
import { SelectField } from "../../ui/form/SelectField";
import {
  getPage,
  getSelection,
  setPage,
  setSelection,
} from "../../../states/leaderboard-selection";
import type { ContentType } from "../../../states/content-type";
import { cn } from "../../../utils/cn";
import AsyncContent from "../../common/AsyncContent";
import { Page } from "../../common/Page";

const pageName = "leaderboards";

const durationOptions = ["15", "30", "60", "120", "custom"] as const;

const languageOptions: { value: Language; label: string }[] = [
  { value: "uzbek", label: "O'zbek" },
  { value: "english", label: "English" },
  { value: "russian", label: "Русский" },
];

const contentTypeOptions: { value: ContentType | ""; label: string }[] = [
  { value: "", label: "Barcha" },
  { value: "words", label: "So'zlar" },
  { value: "numbers", label: "Raqamlar" },
  { value: "mixed", label: "Aralash" },
];

export function LeaderboardPage(): JSXElement {
  const isOpen = () => getActivePage() === pageName;

  const selection = () => getSelection();
  const page = () => getPage();

  const lbQuery = useQuery(() => ({
    ...getLeaderboardQueryOptions({ ...selection(), page: page() }),
    enabled: isOpen(),
  }));

  const rankQuery = useQuery(() => ({
    ...getRankQueryOptions(selection()),
    enabled: isOpen() && isAuthenticated(),
  }));

  const goToPage = (dir: -1 | 1) => {
    const next = page() + dir;
    if (next < 0) return;
    setPage(next);
  };

  const sel = () => selection();

  return (
    <Page id={pageName}>
      <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <div class="flex flex-col gap-4">
          <h1 class="text-2xl font-bold text-text">Reyting</h1>
          <div class="flex flex-wrap items-center gap-3">
            <Show when={sel().type !== "weekly"}>
              <SelectField
                value={sel().mode2}
                onChange={(v) => setSelection({ ...sel(), mode2: v } as never)}
                options={durationOptions.map((d) => ({
                  value: d,
                  label: d === "custom" ? "Maxsus" : `${d} sek`,
                }))}
                class="bg-sub-alt px-3 py-1.5"
              />

              <SelectField
                value={sel().language}
                onChange={(v) => setSelection({ ...sel(), language: v as Language } as never)}
                options={languageOptions}
                class="bg-sub-alt px-3 py-1.5"
              />

              <div class="flex items-center gap-1 rounded-xl bg-sub-alt px-2 py-1.5 text-sm">
                <For each={contentTypeOptions}>
                  {(ct) => (
                    <button
                      type="button"
                      class={cn(
                        "rounded-lg px-2 py-0.5 text-xs transition-colors",
                        ct.value === ""
                          ? sel().numbers === undefined
                            ? "bg-main text-bg"
                            : "text-sub hover:text-text"
                          : ct.value === "words"
                            ? sel().numbers === false
                              ? "bg-main text-bg"
                              : "text-sub hover:text-text"
                            : ct.value === "mixed"
                              ? sel().numbers === true
                                ? "bg-main text-bg"
                                : "text-sub hover:text-text"
                              : ct.value === "numbers"
                                ? sel().numbers === true
                                  ? "bg-main text-bg"
                                  : "text-sub hover:text-text"
                                : "text-sub",
                      )}
                      onClick={() => {
                        if (ct.value === "") {
                          setSelection({ ...sel(), numbers: undefined } as never);
                        } else if (ct.value === "words") {
                          setSelection({ ...sel(), numbers: false } as never);
                        } else {
                          setSelection({ ...sel(), numbers: true } as never);
                        }
                      }}
                    >
                      {ct.label}
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>

        <Show when={rankQuery.data}>
          {(data) => {
            const d = data();
            return (
              <div class="rounded-2xl bg-main/10 px-5 py-3 text-sm">
                <span class="text-sub">Sizning o&apos;rningiz: </span>
                <span class="font-bold text-text">
                  {d.rank}-o&apos;rin (
                  {"wpm" in d ? `${d.wpm} WPM` : "totalXp" in d ? `${d.totalXp} XP` : "—"})
                </span>
              </div>
            );
          }}
        </Show>

        <AsyncContent
          queries={{ lbQuery }}
          errorMessage="Reyting yuklanmadi"
        >
          {({ lbQueryData }) => {
            const entries = () => lbQueryData()?.entries ?? [];
            return (
              <div class="flex flex-col gap-2">
                <For each={entries()}>
                  {(entry, i) => {
                    const e = entry as { name: string; firstName?: string; lastName?: string; wpm?: number; totalXp?: number };
                    const isLb = "wpm" in entry;
                    const fn = e.firstName;
                    const ln = e.lastName;
                    const showName = Boolean(fn ?? ln);
                    const nameDisplay = fn !== undefined && ln !== undefined
                      ? `${fn} ${ln}`
                      : (fn ?? ln ?? "");
                    return (
                      <div
                        class={cn(
                          "flex items-center gap-4 rounded-2xl px-5 py-3 transition-colors",
                          page() * 50 + i() <= 2
                            ? "bg-sub-alt"
                            : "bg-sub-alt/50 hover:bg-sub-alt",
                        )}
                      >
                        <span class="w-8 text-center text-lg font-bold text-sub">
                          {["🥇", "🥈", "🥉"][page() * 50 + i()] ?? `#${page() * 50 + i() + 1}`}
                        </span>
                        <span class="flex flex-1 flex-col">
                          <span class="font-medium text-text">{e.name}</span>
                          <Show when={showName}>
                            <span class="text-xs text-sub/60">{nameDisplay}</span>
                          </Show>
                        </span>
                        <span class="text-sm text-sub">
                          {isLb ? `${e.wpm} WPM` : `${e.totalXp} XP`}
                        </span>
                      </div>
                    );
                  }}
                </For>
              </div>
            );
          }}
        </AsyncContent>

        <div class="flex items-center justify-center gap-4">
          <button
            onClick={() => goToPage(-1)}
            type="button"
            disabled={page() === 0}
            class="rounded-xl bg-sub-alt px-4 py-2 text-sm text-text transition-colors hover:bg-sub disabled:opacity-30"
          >
            Oldingi
          </button>
          <span class="text-sm text-sub">{page() + 1}-sahifa</span>
          <button
            type="button"
            onClick={() => goToPage(1)}
            class="rounded-xl bg-sub-alt px-4 py-2 text-sm text-text transition-colors hover:bg-sub"
          >
            Keyingi
          </button>
        </div>
      </div>
    </Page>
  );
}
