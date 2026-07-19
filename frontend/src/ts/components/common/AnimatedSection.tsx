import { JSXElement, onCleanup } from "solid-js";

export function AnimatedSection(props: {
  children: JSXElement;
  class?: string;
  animationClass?: string;
}): JSXElement {
  let el: HTMLDivElement | undefined;
  onCleanup(() => {
    if (el) el.classList.remove("in-view");
  });

  return (
    <div
      ref={(node) => {
        el = node;
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
              }
            }
          },
          { threshold: 0.1 },
        );
        observer.observe(node);
        onCleanup(() => observer.disconnect());
      }}
      class={`${props.animationClass ?? "scroll-fade"} ${props.class ?? ""}`}
    >
      {props.children}
    </div>
  );
}
