// oxlint-disable react/no-unescaped-entities, solid/prefer-show, typescript/no-explicit-any, typescript/strict-boolean-expressions, curly, dot-notation, no-unnecessary-type-assertion, typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call, typescript/no-unsafe-return, typescript/no-unsafe-argument, react/button-has-type
import { createForm } from "@tanstack/solid-form";
import { createMutation } from "@tanstack/solid-query";
import { JSXElement, Show, createSignal, For, onMount } from "solid-js";

import Ape from "../../../ape";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../states/notifications";
import { cn } from "../../../utils/cn";
import { Fa } from "../../common/Fa";
import { AdminLayout } from "./AdminLayout";

export function AdminUsersPage(): JSXElement {
  const [users, setUsers] = createSignal<any[]>([]);
  const [total, setTotal] = createSignal(0);
  const [skip, setSkip] = createSignal(0);
  const [searchQ, setSearchQ] = createSignal("");
  const [searchResults, setSearchResults] = createSignal<any[]>([]);
  const [selectedUser, setSelectedUser] = createSignal<any | null>(null);
  const [banResult, setBanResult] = createSignal("");

  const loadUsers = async (s: number) => {
    try {
      const res = await Ape.admin.listUsers({ query: { skip: s, limit: 25 } });
      if (res.status === 200) {
        const d = res.body.data as any;
        setUsers(d?.users ?? []);
        setTotal(d?.total ?? 0);
        setSkip(s);
      }
    } catch {
      /* ignore */
    }
  };

  onMount(() => {
    void loadUsers(0);
  });

  const searchUsers = async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await Ape.admin.searchUsers({ query: { q } });
      if (res.status === 200) setSearchResults((res.body.data as any) ?? []);
    } catch {
      /* ignore */
    }
  };

  const banMutation = createMutation(() => ({
    mutationFn: async (uid: string) => Ape.admin.toggleBan({ body: { uid } }),
    onSuccess: (data: any) => {
      setBanResult(data?.data?.banned ? "Bloklandi" : "Blokdan ochildi");
      showSuccessNotification("Holat o'zgartirildi");
    },
    onError: () => showErrorNotification("Xatolik"),
  }));

  const banForm = createForm(() => ({
    defaultValues: { uid: "" },
    onSubmit: ({ value }) => {
      banMutation.mutate(value.uid);
    },
  }));

  return (
    <AdminLayout active="users" title="Foydalanuvchilar">
      {/* Search */}
      <div class="mb-6 flex gap-3">
        <input
          value={searchQ()}
          onInput={(e) => {
            setSearchQ(e.currentTarget.value);
            void searchUsers(e.currentTarget.value);
          }}
          placeholder="Ism, email yoki UID bo'yicha qidirish..."
          class="flex-1 rounded-xl bg-sub-alt px-4 py-2.5 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
        />
      </div>

      <Show when={searchResults().length > 0}>
        <div class="mb-6 rounded-2xl border border-sub/10 bg-bg/60 p-4">
          <h3 class="mb-3 text-sm font-bold text-text">Qidiruv natijalari</h3>
          <div class="max-h-48 space-y-1 overflow-y-auto">
            <For each={searchResults()}>
              {(u: any) => (
                <div class="flex items-center justify-between rounded-lg bg-sub-alt/30 px-4 py-2 text-xs">
                  <div class="flex items-center gap-3">
                    <div class="grid h-8 w-8 place-items-center rounded-full bg-main/20 text-xs font-bold text-main">
                      {(u.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span class="font-medium text-text">{u.name}</span>
                      <span class="ml-2 text-sub">{u.email}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class={cn(
                        "rounded-full px-2 py-0.5 text-[10px]",
                        u.banned
                          ? "bg-error/20 text-error"
                          : "bg-green-500/20 text-green-400",
                      )}
                    >
                      {u.banned ? "Bloklangan" : "Faol"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      class="rounded-lg bg-main/20 px-2 py-1 text-[10px] text-main hover:bg-main hover:text-bg"
                    >
                      Batafsil
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Table */}
      <div class="rounded-2xl border border-sub/10 bg-bg/60">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-sub/10 text-xs text-sub">
                <th class="p-3 font-medium">Foydalanuvchi</th>
                <th class="p-3 font-medium">Email</th>
                <th class="p-3 font-medium">Holat</th>
                <th class="p-3 font-medium">Testlar</th>
                <th class="p-3 font-medium">WPM</th>
                <th class="p-3 font-medium">Ro'yxatdan o'tgan</th>
                <th class="p-3 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              <For each={users()}>
                {(u: any, _i) => (
                  <tr class="border-b border-sub/5 text-text transition-colors hover:bg-sub-alt/10">
                    <td class="p-3">
                      <div class="flex items-center gap-3">
                        <div class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-main/20 text-xs font-bold text-main">
                          {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <span class="font-medium">{u.name ?? "N/A"}</span>
                      </div>
                    </td>
                    <td class="p-3 text-sub">{u.email ?? "—"}</td>
                    <td class="p-3">
                      <span
                        class={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          u.banned
                            ? "bg-error/15 text-error"
                            : "bg-green-500/15 text-green-400",
                        )}
                      >
                        {u.banned ? "Bloklangan" : "Faol"}
                      </span>
                    </td>
                    <td class="p-3 text-sub">{u.completedTests ?? 0}</td>
                    <td class="p-3 text-sub">
                      {(u as any).pbs
                        ? (Object.values(
                            (u as any).pbs as Record<string, any>,
                          )?.[0]?.wpm ?? "—")
                        : "—"}
                    </td>
                    <td class="p-3 text-sub">
                      {u.addedAt
                        ? new Date(u.addedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td class="p-3">
                      <div class="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          class="rounded-lg bg-main/20 px-2.5 py-1.5 text-[10px] text-main hover:bg-main hover:text-bg"
                        >
                          Batafsil
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void Ape.admin.toggleBan({ body: { uid: u.uid } });
                            void loadUsers(skip());
                          }}
                          class="rounded-lg bg-error/20 px-2.5 py-1.5 text-[10px] text-error hover:bg-error hover:text-bg"
                        >
                          {u.banned ? "Ochish" : "Bloklash"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div class="flex items-center justify-between border-t border-sub/10 px-4 py-3">
          <button
            disabled={skip() === 0}
            onClick={() => void loadUsers(Math.max(0, skip() - 25))}
            class="rounded-lg bg-sub-alt px-3 py-1.5 text-xs text-sub hover:text-text disabled:opacity-40"
          >
            Oldingi
          </button>
          <span class="text-xs text-sub">
            {skip() + 1}–{Math.min(skip() + 25, total())} / {total()}
          </span>
          <button
            disabled={skip() + 25 >= total()}
            onClick={() => void loadUsers(skip() + 25)}
            class="rounded-lg bg-sub-alt px-3 py-1.5 text-xs text-sub hover:text-text disabled:opacity-40"
          >
            Keyingi
          </button>
        </div>
      </div>

      {/* Ban form */}
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5">
          <h2 class="mb-3 text-sm font-bold text-text">
            UID bo'yicha bloklash
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void banForm.handleSubmit();
            }}
            class="flex gap-3"
          >
            <banForm.Field name="uid">
              {(f) => (
                <input
                  value={f().state.value}
                  onInput={(e) => f().handleChange(e.currentTarget.value)}
                  placeholder="Foydalanuvchi UID"
                  class="flex-1 rounded-xl bg-sub-alt px-4 py-2 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                />
              )}
            </banForm.Field>
            <button
              type="submit"
              class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
            >
              Bloklash/ochish
            </button>
          </form>
          <Show when={banResult()}>
            <p class="mt-2 text-xs text-sub">{banResult()}</p>
          </Show>
        </div>

        <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5">
          <h2 class="mb-3 text-sm font-bold text-text">Parolni tiklash</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              try {
                await Ape.admin.sendForgotPasswordEmail({
                  body: { email: fd.get("email") as string },
                });
                showSuccessNotification("Email yuborildi");
              } catch {
                showErrorNotification("Xatolik");
              }
            }}
            class="flex gap-3"
          >
            <input
              name="email"
              type="email"
              placeholder="Foydalanuvchi emaili"
              required
              class="flex-1 rounded-xl bg-sub-alt px-4 py-2 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
            />
            <button
              type="submit"
              class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
            >
              Yuborish
            </button>
          </form>
        </div>
      </div>

      {/* User detail modal */}
      <Show when={selectedUser() !== null}>
        <div
          class="bg-black/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >
          <div
            class="mx-4 w-full max-w-lg rounded-2xl border border-sub/20 bg-bg p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="mb-6 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="grid h-12 w-12 place-items-center rounded-full bg-main/20 text-lg font-bold text-main">
                  {selectedUser()?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <h3 class="text-lg font-bold text-text">
                    {selectedUser()?.name ?? "N/A"}
                  </h3>
                  <p class="text-xs text-sub">{selectedUser()?.email ?? "—"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                class="rounded-lg bg-sub-alt p-2 text-sub hover:text-text"
              >
                <Fa icon="fa-times" />
              </button>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-sub">UID</span>
                <p class="font-medium text-text">
                  {(selectedUser()?.uid ?? "").slice(0, 16)}...
                </p>
              </div>
              <div>
                <span class="text-sub">Holat</span>
                <p class="font-medium text-text">
                  {selectedUser()?.banned ? "Bloklangan" : "Faol"}
                </p>
              </div>
              <div>
                <span class="text-sub">Testlar</span>
                <p class="font-medium text-text">
                  {selectedUser()?.completedTests ?? 0}
                </p>
              </div>
              <div>
                <span class="text-sub">Vaqt</span>
                <p class="font-medium text-text">
                  {Math.round((selectedUser()?.timeTyping ?? 0) / 60)} min
                </p>
              </div>
              <div>
                <span class="text-sub">Ro'yxatdan o'tgan</span>
                <p class="font-medium text-text">
                  {selectedUser()?.addedAt
                    ? new Date(selectedUser().addedAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
            <div class="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  void Ape.admin.toggleBan({
                    body: { uid: selectedUser()?.uid },
                  });
                  showSuccessNotification("Holat o'zgartirildi");
                }}
                class="flex-1 rounded-xl bg-error/20 py-2.5 text-sm font-medium text-error hover:bg-error hover:text-bg"
              >
                {selectedUser()?.banned ? "Blokdan ochish" : "Bloklash"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                class="flex-1 rounded-xl bg-sub-alt py-2.5 text-sm font-medium text-sub hover:text-text"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      </Show>
    </AdminLayout>
  );
}
