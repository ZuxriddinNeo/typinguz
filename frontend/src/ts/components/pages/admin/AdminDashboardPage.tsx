import { createForm } from "@tanstack/solid-form";
import { createMutation } from "@tanstack/solid-query";
import { JSXElement, Show, createSignal } from "solid-js";
import Ape from "../../../ape";
import { signOut } from "../../../auth";
import { showErrorNotification, showSuccessNotification } from "../../../states/notifications";
import { Page } from "../../common/Page";
import { Fa } from "../../common/Fa";

function Card(props: { title: string; children: JSXElement }): JSXElement {
  return (
    <div class="rounded-2xl border border-sub/10 bg-bg/50 p-6 backdrop-blur-sm">
      <h2 class="mb-4 text-lg font-bold text-text">{props.title}</h2>
      {props.children}
    </div>
  );
}

export function AdminDashboardPage(): JSXElement {
  const [banResult, setBanResult] = createSignal<string>("");

  const banMutation = createMutation(() => ({
    mutationFn: async (uid: string) => Ape.admin.toggleBan({ body: { uid } }),
    onSuccess: (data) => {
      const d = data as { data?: { banned: boolean } };
      if (d.data) setBanResult(`Foydalanuvchi ${d.data.banned ? "bloklandi" : "blokdan ochildi"}`);
    },
    onError: () => showErrorNotification("Bloklashda xatolik"),
  }));

  const banForm = createForm(() => ({
    defaultValues: { uid: "" },
    onSubmit: ({ value }) => { banMutation.mutate(value.uid); },
  }));

  const emailForm = createForm(() => ({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      try {
        await Ape.admin.sendForgotPasswordEmail({ body: { email: value.email } });
        showSuccessNotification("Parolni tiklash emaili yuborildi");
      } catch { showErrorNotification("Email yuborishda xatolik"); }
    },
  }));

  return (
    <Page id="adminDashboard">
      <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-text">
            <Fa icon="fa-shield-alt" class="mr-2 text-main" />
            Admin panel
          </h1>
          <button
            type="button"
            onClick={() => { signOut(); window.location.href = "/"; }}
            class="rounded-xl bg-sub-alt px-4 py-2 text-sm text-text transition-colors hover:bg-error hover:text-bg"
          >
            <Fa icon="fa-sign-out-alt" class="mr-1" />
            Chiqish
          </button>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <Card title="Foydalanuvchini bloklash">
            <form onSubmit={(e) => { e.preventDefault(); void banForm.handleSubmit(); }} class="flex flex-col gap-3">
              <banForm.Field name="uid" children={(f) => (
                <input
                  value={f().state.value}
                  onInput={(e) => f().handleChange(e.currentTarget.value)}
                  placeholder="Foydalanuvchi ID (uid)"
                  class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text outline-none ring-1 ring-sub/20 focus:ring-main"
                />
              )} />
              <button
                type="submit"
                class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg transition-colors hover:opacity-90"
              >
                Bloklash/ochish
              </button>
            </form>
            <Show when={banResult()}>
              <p class="mt-2 text-sm text-sub">{banResult()}</p>
            </Show>
          </Card>

          <Card title="Parolni tiklash">
            <form onSubmit={(e) => { e.preventDefault(); void emailForm.handleSubmit(); }} class="flex flex-col gap-3">
              <emailForm.Field name="email" children={(f) => (
                <input
                  value={f().state.value}
                  onInput={(e) => f().handleChange(e.currentTarget.value)}
                  placeholder="Foydalanuvchi emaili"
                  class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text outline-none ring-1 ring-sub/20 focus:ring-main"
                />
              )} />
              <button
                type="submit"
                class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg transition-colors hover:opacity-90"
              >
                Parolni tiklash
              </button>
            </form>
          </Card>

          <Card title="Ma'lumot">
            <div class="space-y-2 text-sm text-sub">
              <p>Admin endpointlari sozlamalarda yoqilgan bo&apos;lishi kerak.</p>
              <p class="text-xs text-sub/60">So&apos;rovlar 5 soniyada 1 marta cheklangan.</p>
            </div>
          </Card>

          <Card title="Asosiy sahifaga qaytish">
            <a
              href="/"
              router-link
              class="inline-flex items-center gap-2 rounded-xl bg-sub-alt px-4 py-2 text-sm text-text transition-colors hover:bg-main hover:text-bg"
            >
              <Fa icon="fa-arrow-left" />
              Bosh sahifa
            </a>
          </Card>
        </div>
      </div>
    </Page>
  );
}
