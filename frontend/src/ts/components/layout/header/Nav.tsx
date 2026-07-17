import {
  createMemo,
  createSignal,
  JSXElement,
  onCleanup,
  Show,
} from "solid-js";
import { setConfig } from "../../../config/setters";
import { getConfig } from "../../../config/store";
import type { ThemeName } from "@monkeytype/schemas/configs";

import { usePendingConnectionsQuery } from "../../../collections/connections";
import { restartTestEvent } from "../../../events/test";
import { createEffectOn } from "../../../hooks/effects";
import { useRefWithUtils } from "../../../hooks/useRefWithUtils";
import {
  prefetchAboutPage,
  prefetchLeaderboardPage,
} from "../../../queries/prefetch";
import { getActivePage } from "../../../states/core";
import {
  getAccountButtonSpinner,
  getAnimatedLevel,
  setAnimatedLevel,
} from "../../../states/header";
import { getSnapshot } from "../../../states/snapshot";
import { getFocus } from "../../../states/test";
import { cn } from "../../../utils/cn";
import { getLevelFromTotalXp } from "../../../utils/levels";
import { Anime } from "../../common/anime";
import { AnimePresence } from "../../common/anime/AnimePresence";
import { Fa } from "../../common/Fa";
import { User } from "../../common/User";
import { AccountMenu } from "./AccountMenu";
import { AccountXpBar } from "./AccountXpBar";

export function Nav(): JSXElement {
  const [getAccountMenuOpen, setAccountMenuOpen] = createSignal(false);
  const isCoarse = () => window.matchMedia("(pointer: coarse)").matches;
  const [accountMenuRef, accountMenuEl] = useRefWithUtils<HTMLDivElement>();

  const pendingConnections = usePendingConnectionsQuery();

  const handleClickOutside = (e: MouseEvent) => {
    const el = accountMenuEl();
    if (getAccountMenuOpen() && el && !el.native.contains(e.target as Node)) {
      setAccountMenuOpen(false);
    }
  };
  document.addEventListener("click", handleClickOutside);
  onCleanup(() => document.removeEventListener("click", handleClickOutside));

  const buttonClass = () =>
    cn("", {
      "opacity-(--nav-focus-opacity)": getFocus(),
    });

  createEffectOn(getSnapshot, (snapshot) => {
    if (snapshot === undefined) {
      setAnimatedLevel(0);
      return;
    }
    setAnimatedLevel(getLevelFromTotalXp(snapshot.xp ?? 0));
  });

  const showFriendsNotificationBubble = createMemo((): boolean => {
    return pendingConnections().length > 0;
  });

  const _showAlertsNotificationBubble = createMemo((): boolean => {
    const snapshot = getSnapshot();
    if (snapshot === undefined) return false;

    return snapshot.inboxUnreadSize > 0;
  });

  const showLoginButton = (): boolean => true;
  const isActive = (page: string) => getActivePage() === page;

  return (
    <nav class="flex items-center gap-1">
      <a
        href="/"
        class={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors", buttonClass(), isActive("landing") ? "bg-main/10 text-main" : "text-sub hover:text-text")}
        router-link
        data-nav-item="home"
      >Bosh</a>
      <a
        href="/test"
        class={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors", buttonClass(), isActive("test") ? "bg-main/10 text-main" : "text-sub hover:text-text")}
        router-link
        data-nav-item="test"
        onClick={() => {
          if (getActivePage() === "test") restartTestEvent.dispatch();
        }}
      >Test</a>
      <a
        href="/leaderboards"
        class={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors", buttonClass(), isActive("leaderboards") ? "bg-main/10 text-main" : "text-sub hover:text-text")}
        router-link
        data-nav-item="leaderboards"
        onMouseEnter={() => prefetchLeaderboardPage()}
      >Reyting</a>
      <a
        href="/about"
        class={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors", buttonClass(), isActive("about") ? "bg-main/10 text-main" : "text-sub hover:text-text")}
        router-link
        data-nav-item="about"
        onMouseEnter={() => prefetchAboutPage()}
      >Haqida</a>


      <button
        type="button"
        onClick={() => {
          const isDark = getConfig.theme === "typeuz";
          setConfig("theme", (isDark ? "typeuz_light" : "typeuz") as ThemeName);
        }}
        class="ml-2 flex h-9 w-9 items-center justify-center rounded-full text-sub transition-all duration-300 hover:bg-sub-alt hover:text-text"
        aria-label="Toggle theme"
      >
        <div class="relative flex h-4 w-4 items-center justify-center">
          <Fa icon={getConfig.theme === "typeuz" ? "fa-sun" : "fa-moon"} class="absolute transition-all duration-300" />
        </div>
      </button>
      <AnimePresence exitBeforeEnter>
        <Show
          when={getSnapshot()}
          fallback={
            <Anime
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, duration: 125 }}
              exit={{ opacity: 0, duration: 125 }}
            >
              <Show when={showLoginButton()}>
                <a
                  href="/login"
                  class="ml-2 rounded-full bg-main px-5 py-2 text-sm font-semibold text-bg transition-all hover:scale-105"
                  router-link
                  data-nav-item="login"
                >Kirish</a>
              </Show>
            </Anime>
          }
        >
          {(snap) => (
            <Anime
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, duration: 125 }}
              exit={{ opacity: 0, duration: 125 }}
            >
              <div class="relative ml-2 flex items-center gap-2">
                <div ref={accountMenuRef} class="relative">
                  <a
                    href="/account"
                    class="flex items-center gap-2 rounded-full border border-sub-alt px-3 py-1.5 text-sm text-text transition-colors hover:border-sub"
                    router-link
                    data-nav-item="account"
                    onClick={(e) => {
                      if (isCoarse()) {
                        e.preventDefault();
                        setAccountMenuOpen((prev) => !prev);
                      }
                    }}
                  >
                    <User
                      user={snap()}
                      showAvatar={true}
                      iconsOnly={true}
                      hideNameOnSmallScreens={true}
                      level={getAnimatedLevel()}
                      showSpinner={getAccountButtonSpinner()}
                      showNotificationBubble={showFriendsNotificationBubble()}
                      fontClass="text-em-xs"
                    />
                  </a>
                  <AccountMenu
                    showFriendsNotificationBubble={showFriendsNotificationBubble()}
                  />
                </div>
                <AccountXpBar />
              </div>
            </Anime>
          )}
        </Show>
      </AnimePresence>
    </nav>
  );
}
