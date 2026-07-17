import { createForm } from "@tanstack/solid-form";
import { JSXElement } from "solid-js";

import { signIn } from "../../../auth";
import { signOut } from "../../../firebase";
import Ape from "../../../ape";
import {
  disableLoginPageInputs,
  enableLoginPageInputs,
  getLoginPageInputsEnabled,
} from "../../../states/login";
import {
  showErrorNotification,
  showNoticeNotification,
} from "../../../states/notifications";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";
import { InputField } from "../../ui/form/InputField";
import { SubmitButton } from "../../ui/form/SubmitButton";
import { allFieldsMandatory } from "../../ui/form/utils";
import { cn } from "../../../utils/cn";

export function AdminLogin(): JSXElement {
  const handleAdminSignIn = async (
    email: string,
    password: string,
    rememberMe: boolean,
  ): Promise<void> => {
    disableLoginPageInputs();
    try {
      const result = await signIn(email, password, rememberMe);
      if (!result.success) {
        showErrorNotification(
          `Admin kirish muvaffaqiyatsiz: ${result.message}`,
        );
        return;
      }
      const resp = await Ape.admin.test();
      if (resp.status !== 200) {
        await signOut();
        showErrorNotification("Bu sahifa faqat adminlar uchun");
        return;
      }
      window.location.href = "/admin/dashboard";
      return;
    } catch {
      await signOut();
      showErrorNotification("Admin tekshiruvi muvaffaqiyatsiz");
    } finally {
      enableLoginPageInputs();
    }
  };

  const form = createForm(() => ({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await handleAdminSignIn(value.email, value.password, true);
    },
    onSubmitInvalid: () => {
      showNoticeNotification("Iltimos, barcha maydonlarni to'ldiring");
    },
    validators: {
      onChange: allFieldsMandatory(),
    },
  }));

  return (
    <div
      class={cn(
        "mx-auto grid w-full max-w-md gap-6",
        "rounded-2xl border-2 border-main/20 bg-bg/60 p-8",
        "shadow-[0_0_30px_-5px] shadow-main/10",
      )}
    >
      <div class="grid place-items-center gap-3 text-center">
        <div
          class={cn(
            "grid h-16 w-16 place-items-center rounded-full",
            "bg-gradient-to-br from-main to-main/60",
          )}
        >
          <Fa icon="fa-shield-alt" size={1.5} class="text-bg" />
        </div>
        <div>
          <h2 class="text-xl font-bold tracking-wider text-text">
            Admin panel
          </h2>
          <p class="mt-1 text-sm text-sub">Faqat adminlar uchun</p>
        </div>
      </div>

      <form
        class="grid w-full gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          children={(field) => (
            <InputField
              field={field}
              placeholder="email"
              autocomplete="current-email"
              disabled={!getLoginPageInputsEnabled()}
            />
          )}
        />
        <form.Field
          name="password"
          children={(field) => (
            <InputField
              field={field}
              placeholder="parol"
              type="password"
              autocomplete="current-password"
              disabled={!getLoginPageInputsEnabled()}
            />
          )}
        />

        <SubmitButton
          form={form}
          fa={{ icon: "fa-shield-alt" }}
          text="admin panelga kirish"
          disabled={!getLoginPageInputsEnabled()}
          class="bg-main text-bg hover:opacity-90"
        />
      </form>

      <div class="text-center">
        <Button
          href="/"
          router-link
          class="text-xs text-sub underline-offset-2 hover:text-main hover:underline"
        >
          <Fa icon="fa-arrow-left" class="mr-1" />
          asosiy sahifaga qaytish
        </Button>
      </div>
    </div>
  );
}
