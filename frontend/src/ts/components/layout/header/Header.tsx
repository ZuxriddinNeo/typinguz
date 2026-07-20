import { JSXElement, Show } from "solid-js";

import { getActivePage } from "../../../states/core";
import { Logo } from "./Logo";
import { Nav } from "./Nav";

export function Header(): JSXElement {
  return (
    <Show
      when={
        getActivePage() !== "adminLogin" && getActivePage() !== "adminDashboard"
      }
    >
      <header class="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-sub/10 px-6 py-4">
        <Logo />
        <Nav />
      </header>
    </Show>
  );
}
