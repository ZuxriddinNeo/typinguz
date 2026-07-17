import { JSXElement } from "solid-js";

import { getIsScreenshotting } from "../../../states/core";
import { getFocus } from "../../../states/test";
import { cn } from "../../../utils/cn";
import { Logo } from "./Logo";
import { Nav } from "./Nav";

export function Header(): JSXElement {
  return (
    <header
      class={cn("mx-auto flex w-full max-w-6xl items-center justify-between border-b border-sub/10 px-6 py-4", {
        "opacity-0": getIsScreenshotting(),
        "border-transparent": getFocus(),
      })}
      data-ui-element="header"
      data-focused={getFocus() ? "" : undefined}
    >
      <Logo />
      <Nav />
    </header>
  );
}
