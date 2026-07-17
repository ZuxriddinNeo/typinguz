import { JSXElement } from "solid-js";

import { AnimatedModal } from "../common/AnimatedModal";

export function ContactModal(): JSXElement {
  return (
    <AnimatedModal id="Contact" modalClass="max-w-xl" title="Aloqa">
      <div class="flex flex-col gap-4 text-sub">
        <p>
          {`Savol, taklif yoki muammo bo'lsa, IT o'quv markazi
          administratoriga murojaat qiling.`}
        </p>
      </div>
    </AnimatedModal>
  );
}
