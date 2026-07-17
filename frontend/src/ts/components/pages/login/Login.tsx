import { createForm } from "@tanstack/solid-form";
import { JSXElement } from "solid-js";

import {
  AuthResult,
  getAuthMethodDisplay,
  signIn,
  signInWithProvider,
} from "../../../auth";
import {
  disableLoginPageInputs,
  enableLoginPageInputs,
  getLoginPageInputsEnabled,
} from "../../../states/login";
import { showModal } from "../../../states/modals";
import {
  showErrorNotification,
  showNoticeNotification,
} from "../../../states/notifications";
import { showRegisterCaptchaModal } from "../../modals/RegisterCaptchaModal";
import { Button } from "../../common/Button";
import { H3 } from "../../common/Headers";
import { Separator } from "../../common/Separator";
import { Checkbox } from "../../ui/form/Checkbox";
import { InputField } from "../../ui/form/InputField";
import { SubmitButton } from "../../ui/form/SubmitButton";
import { allFieldsMandatory } from "../../ui/form/utils";

export function Login(): JSXElement {
  const trySignIn = async (
    auth: () => Promise<AuthResult>,
    label?: string,
  ): Promise<void> => {
    disableLoginPageInputs();
    try {
      const data = await auth();
      if (!data.success) {
        showErrorNotification(
          `Kirish muvaffaqiyatsiz${label !== undefined ? ` (${label})` : ""}: ${data.message}`,
        );
      }
    } finally {
      enableLoginPageInputs();
    }
  };

  const form = createForm(() => ({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    onSubmit: async ({ value }) => {
      disableLoginPageInputs();
      const captchaToken = await showRegisterCaptchaModal();
      if (captchaToken === undefined || captchaToken === "") {
        showErrorNotification("Captcha ni tasdiqlang");
        enableLoginPageInputs();
        return;
      }
      await trySignIn(async () =>
        signIn(value.email, value.password, value.rememberMe, captchaToken),
      );
    },
    onSubmitInvalid: () => {
      showNoticeNotification("Iltimos, barcha maydonlarni to'ldiring");
    },
    validators: {
      onChange: allFieldsMandatory(),
    },
  }));

  return (
    <div class="grid w-full grid-cols-1 justify-center gap-4 sm:w-96">
      <H3
        text="tizimga kirish"
        fa={{ icon: "fa-sign-in-alt" }}
        class="p-0"
      />
      <div class="grid grid-cols-2 gap-4">
        <Button
          fa={{ icon: "fa-google", variant: "brand" }}
          onClick={() =>
            void trySignIn(
              async () =>
                signInWithProvider("google", {
                  rememberMe: form.getFieldValue("rememberMe"),
                }),
              getAuthMethodDisplay("google"),
            )
          }
          disabled={!getLoginPageInputsEnabled()}
        />
        <Button
          fa={{ icon: "fa-github", variant: "brand" }}
          onClick={() =>
            void trySignIn(
              async () =>
                signInWithProvider("github", {
                  rememberMe: form.getFieldValue("rememberMe"),
                }),
              getAuthMethodDisplay("github"),
            )
          }
          disabled={!getLoginPageInputsEnabled()}
        />
      </div>
      <form
        class="grid w-full gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <Separator text="yoki" />
        <form.Field
          name="email"
          children={(field) => (
            <InputField
              field={field}
              placeholder="email yoki username"
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
        <form.Field
          name="rememberMe"
          children={(field) => (
            <Checkbox
              field={field}
              disabled={!getLoginPageInputsEnabled()}
              label="eslab qolish"
            />
          )}
        />

        <SubmitButton
          form={form}
          fa={{ icon: "fa-sign-in-alt" }}
          text="kirish"
          disabled={!getLoginPageInputsEnabled()}
        />
      </form>

      <Button
        text="parolni unutdingizmi?"
        variant="text"
        class="text justify-end text-sm"
        onClick={() => showModal("ForgotPassword")}
        disabled={!getLoginPageInputsEnabled()}
      />
      <p class="text-center text-sm text-sub">
        Tizimga kirish orqali siz{" "}
        <a href="/privacy-policy" class="text-main underline hover:no-underline">
          Maxfiylik siyosati
        </a>{" "}
        va{" "}
        <a href="/terms-of-service" class="text-main underline hover:no-underline">
          Foydalanish shartlari
        </a>
        {" "}hamda{" "}
        <a href="/security-policy" class="text-main underline hover:no-underline">
          Xavfsizlik siyosati
        </a>
        {" "}ni qabul qilasiz.
      </p>
    </div>
  );
}
