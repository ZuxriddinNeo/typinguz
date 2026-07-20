// oxlint-disable react/no-unescaped-entities, solid/prefer-show, typescript/no-explicit-any, typescript/strict-boolean-expressions, curly, dot-notation, no-unnecessary-type-assertion, typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call, typescript/no-unsafe-return, typescript/no-unsafe-argument
import { createForm } from "@tanstack/solid-form";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { JSXElement, Show, For } from "solid-js";

import Ape from "../../../ape";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../states/notifications";
import { Fa } from "../../common/Fa";
import { AdminLayout } from "./AdminLayout";

export function AdminAdsPage(): JSXElement {
  const adQuery = createQuery(() => ({
    queryKey: ["admin", "adConfig"],
    queryFn: async () => {
      const r = await Ape.admin.getAdConfig();
      return r.status === 200 ? (r.body.data as any) : null;
    },
  }));

  const toggleAd = () => {
    const c = adQuery.data;
    if (!c) return;
    void Ape.admin
      .updateAdConfig({ body: { ...c, enabled: !c.enabled } as any })
      .then(() => {
        showSuccessNotification("Reklama holati o'zgartirildi");
        void adQuery.refetch();
      })
      .catch(() => showErrorNotification("Xatolik"));
  };

  const creativeForm = createForm(() => ({
    defaultValues: { imageUrl: "", targetUrl: "" },
    onSubmit: async ({ value }) => {
      try {
        await Ape.admin.addCreative({ body: value as any });
        showSuccessNotification("Kreativ qo'shildi");
        void adQuery.refetch();
      } catch {
        showErrorNotification("Xatolik");
      }
    },
  }));

  const deleteCreative = createMutation(() => ({
    mutationFn: async (id: string) =>
      Ape.admin.deleteCreative({ params: { id } }),
    onSuccess: () => {
      showSuccessNotification("O'chirildi");
      void adQuery.refetch();
    },
    onError: () => showErrorNotification("Xatolik"),
  }));

  return (
    <AdminLayout active="ads" title="Reklama boshqaruvi">
      <div class="grid gap-6 lg:grid-cols-2">
        {/* Status */}
        <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5">
          <h2 class="mb-4 text-sm font-bold text-text">Holat</h2>
          <Show
            when={adQuery.data}
            fallback={<p class="text-xs text-sub">Yuklanmoqda...</p>}
          >
            <div class="space-y-4 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-text">Reklama</span>
                <button
                  type="button"
                  onClick={toggleAd}
                  class={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${(adQuery.data as any)?.enabled ? "bg-green-600 text-white" : "bg-sub-alt text-sub"}`}
                >
                  {(adQuery.data as any)?.enabled ? "Yoqilgan" : "O'chirilgan"}
                </button>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text">Master kalit</span>
                <span
                  class={`rounded-lg px-3 py-1 text-xs font-medium ${(adQuery.data as any)?.masterToggle ? "bg-green-600 text-white" : "bg-sub-alt text-sub"}`}
                >
                  {(adQuery.data as any)?.masterToggle
                    ? "Yoqilgan"
                    : "O'chirilgan"}
                </span>
              </div>
              <div class="text-xs text-sub">
                Slotlar: {(adQuery.data as any)?.slots?.length ?? 0} |
                Kreativlar: {(adQuery.data as any)?.creatives?.length ?? 0}
              </div>
            </div>
          </Show>
        </div>

        {/* Add creative */}
        <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5">
          <h2 class="mb-4 text-sm font-bold text-text">Kreativ qo'shish</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void creativeForm.handleSubmit();
            }}
            class="flex flex-col gap-3"
          >
            <creativeForm.Field name="imageUrl">
              {(f) => (
                <input
                  value={f().state.value}
                  onInput={(e) => f().handleChange(e.currentTarget.value)}
                  placeholder="Rasm URL"
                  class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                />
              )}
            </creativeForm.Field>
            <creativeForm.Field name="targetUrl">
              {(f) => (
                <input
                  value={f().state.value}
                  onInput={(e) => f().handleChange(e.currentTarget.value)}
                  placeholder="Havola URL"
                  class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                />
              )}
            </creativeForm.Field>
            <button
              type="submit"
              class="rounded-xl bg-main px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90"
            >
              Qo'shish
            </button>
          </form>
        </div>
      </div>

      {/* Existing creatives */}
      <div class="mt-6 rounded-2xl border border-sub/10 bg-bg/60 p-5">
        <h2 class="mb-4 text-sm font-bold text-text">Mavjud kreativlar</h2>
        <Show
          when={(adQuery.data as any)?.creatives?.length > 0}
          fallback={<p class="text-xs text-sub">Kreativlar yo'q</p>}
        >
          <div class="space-y-2">
            <For each={(adQuery.data as any)?.creatives ?? []}>
              {(cr: any) => (
                <div class="flex items-center justify-between rounded-lg bg-sub-alt/30 px-4 py-2 text-xs">
                  <div class="flex items-center gap-3">
                    <span class="text-sub">ID: {cr.id.slice(0, 8)}...</span>
                    <span class="max-w-[200px] truncate text-text">
                      {(cr.imageUrl ?? "").slice(0, 40)}...
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteCreative.mutate(cr.id)}
                    class="rounded-lg bg-error/20 px-2.5 py-1.5 text-error hover:bg-error hover:text-bg"
                  >
                    <Fa icon="fa-trash" />
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </AdminLayout>
  );
}
