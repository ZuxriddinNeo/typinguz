import { JSXElement } from "solid-js";

import { AnimatedModal } from "../common/AnimatedModal";

export function SupportModal(): JSXElement {
  return (
    <AnimatedModal id="Support" title="Qo'llab-quvvatlash" modalClass="max-w-xl">
      <div class="flex flex-col items-center gap-4 text-center">
        <p class="text-sub">
          {`Owotype ni qo'llab-quvvatlaganingiz uchun rahmat. Agar sizda taklif
          yoki savol bo'lsa, IT o'quv markazi administratoriga murojaat qiling.`}
        </p>
      </div>
    </AnimatedModal>
  );
}
