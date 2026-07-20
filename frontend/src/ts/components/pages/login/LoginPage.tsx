import { createSignal, JSXElement, Show } from "solid-js";

import { getLoginPageInputsEnabled } from "../../../states/login";
import { Page } from "../../common/Page";
import { Login } from "./Login";
import { Register } from "./Register";
import { Fa } from "../../common/Fa";
import { devLogin } from "../../../utils/dev-auth";
import { setUserId } from "../../../states/core";
import { isDevEnvironment } from "../../../utils/env";

export function LoginPage(): JSXElement {
  const isSignUpDisabled = (): boolean => false;
  const [devLoginUsername, setDevLoginUsername] = createSignal("");
  const [devLoginFeedback, setDevLoginFeedback] = createSignal("");
  const [devLoggingIn, setDevLoggingIn] = createSignal(false);

  const handleDevLogin = async (): Promise<void> => {
    const username = devLoginUsername().trim();
    if (!username) return;
    setDevLoggingIn(true);
    setDevLoginFeedback("");
    try {
      const auth = await devLogin(username);
      setUserId(auth.uid);
      localStorage.removeItem("typeuz_onboarding_done");
      window.location.href = "/onboarding";
    } catch (e) {
      setDevLoginFeedback((e as Error).message);
    } finally {
      setDevLoggingIn(false);
    }
  };

  return (
    <Page id="login">
      <Show when={!getLoginPageInputsEnabled()}>
        <div class="fixed top-1/2 left-1/2 z-1 -translate-x-1/2 -translate-y-1/2 text-3xl text-main transition-opacity duration-250">
          <Fa icon="fa-circle-notch" fixedWidth spin />
        </div>
      </Show>
      <Show
        when={isSignUpDisabled()}
        fallback={
          <div class="flex h-full flex-col items-center justify-around gap-4 md:flex-row">
            <Register />
            <div class="flex flex-col gap-4">
              <Login />
              <Show when={isDevEnvironment()}>
                <div class="rounded-2xl border border-sub/10 bg-bg/50 p-4">
                  <p class="mb-2 text-sm font-semibold text-sub">Dev Login</p>
                  <div class="flex gap-2">
                    <input
                      type="text"
                      placeholder="Username"
                      value={devLoginUsername()}
                      onInput={(e) => setDevLoginUsername(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleDevLogin();
                      }}
                      class="min-w-0 flex-1 rounded-lg border border-sub/20 bg-bg px-3 py-2 text-sm text-text outline-none transition-colors focus:border-main"
                    />
                    <button
                      type="button"
                      onClick={handleDevLogin}
                      disabled={devLoggingIn()}
                      class="rounded-lg bg-main px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      {devLoggingIn() ? "..." : "Kirish"}
                    </button>
                  </div>
                  <Show when={devLoginFeedback()}>
                    <p class="mt-1 text-xs text-error">{devLoginFeedback()}</p>
                  </Show>
                </div>
              </Show>
            </div>
          </div>
        }
      >
        <div class="grid h-full place-items-center">
          <p>
            Login/Signup is disabled or the server is down/under maintenance.
          </p>
        </div>
      </Show>
    </Page>
  );
}
