import { createSignal } from "solid-js";

export type ContentType = "words" | "numbers" | "mixed";

const [getContentType, setContentType] = createSignal<ContentType>("words");

export { getContentType, setContentType };
