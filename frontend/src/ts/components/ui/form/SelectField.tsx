// oxlint-disable typescript/no-non-null-assertion
import { Accessor, For, JSXElement, Show } from "solid-js";
import type { AnyFieldApi } from "@tanstack/solid-form";
import { cn } from "../../../utils/cn";
import { Fa } from "../../common/Fa";
import { FieldIndicator } from "./FieldIndicator";

export type SelectOption = {
  value: string;
  label: string;
};

export function SelectField(props: {
  field?: Accessor<AnyFieldApi>;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  class?: string;
  label?: string;
}): JSXElement {
  return (
    <div class="flex flex-col gap-1.5">
      <Show when={props.label}>
        <label class="text-xs font-medium text-sub">{props.label}</label>
      </Show>
      <div class="relative">
        <select
          value={props.field ? String(props.field().state.value) : props.value}
          onChange={(e) => {
            if (props.field) {
              props.field().handleChange(e.currentTarget.value);
            } else {
              props.onChange?.(e.currentTarget.value);
            }
          }}
          disabled={props.disabled}
          class={cn(
            "w-full appearance-none rounded-xl border border-sub-alt bg-bg px-3 py-2 pr-8 text-sm text-text outline-none transition-colors hover:border-sub focus:border-main",
            props.class,
          )}
        >
          <Show when={props.placeholder}>
            <option value="">{props.placeholder}</option>
          </Show>
          <For each={props.options}>
            {(opt) => <option value={opt.value}>{opt.label}</option>}
          </For>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-sub">
          <Fa icon="fa-chevron-down" class="h-3.5 w-3.5" />
        </div>
      </div>
      <Show when={props.field && props.field().options.validators}>
        <FieldIndicator field={props.field!()} />
      </Show>
    </div>
  );
}
