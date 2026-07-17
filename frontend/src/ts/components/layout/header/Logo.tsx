import { JSXElement } from "solid-js";

import { restartTestEvent } from "../../../events/test";
import { getActivePage } from "../../../states/core";
import { getFocus } from "../../../states/test";
import { cn } from "../../../utils/cn";

export function Logo(): JSXElement {
  return (
    <a
      href={`${location.origin}/`}
      class="flex items-center gap-2"
      aria-label="TypeUZ Home"
      router-link
      data-ui-element="logo"
      onClick={() => {
        if (getActivePage() === "test") restartTestEvent.dispatch();
      }}
    >
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-main to-main/70 text-sm font-black leading-none tracking-tight text-bg shadow-sm">
        TZ
      </span>
      <span class="text-xl font-extrabold tracking-tight text-text">Type<span class="text-main">UZ</span></span>
      <span
        class={cn(
          "ml-0.5 hidden text-[0.6rem] font-medium tracking-wide text-sub transition-colors duration-125 lg:inline",
          { "text-transparent": getFocus() },
        )}
        data-ui-element="logoSubtext"
      >
        tez yoz
      </span>
    </a>
  );
}
