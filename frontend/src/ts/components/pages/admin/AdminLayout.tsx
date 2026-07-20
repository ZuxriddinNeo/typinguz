// oxlint-disable typescript/no-explicit-any, typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call
import { JSXElement, Show, For } from "solid-js";

import { signOut } from "../../../auth";
import { cn } from "../../../utils/cn";
import { Fa } from "../../common/Fa";

type NavItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
};

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "fa-chart-pie",
    href: "/admin/dashboard",
  },
  {
    id: "users",
    label: "Foydalanuvchilar",
    icon: "fa-users",
    href: "/admin/users",
  },
  {
    id: "content",
    label: "Kontent",
    icon: "fa-pencil-alt",
    href: "/admin/content",
  },
  {
    id: "analytics",
    label: "Analitika",
    icon: "fa-chart-bar",
    href: "/admin/analytics",
  },
  { id: "ai", label: "AI tahlil", icon: "fa-brain", href: "/admin/ai" },
  {
    id: "notifications",
    label: "Bildirishnomalar",
    icon: "fa-bell",
    href: "/admin/notifications",
  },
  { id: "ads", label: "Reklama", icon: "fa-ad", href: "/admin/ads" },
  {
    id: "settings",
    label: "Sozlamalar",
    icon: "fa-cog",
    href: "/admin/settings",
  },
];

export function AdminLayout(props: {
  active: string;
  title: string;
  children: JSXElement;
}): JSXElement {
  return (
    <div class="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside class="bg-bg-alt/50 flex w-64 flex-col border-r border-sub/10">
        <div class="flex items-center gap-3 border-b border-sub/10 px-6 py-5">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-main">
            <Fa icon="fa-shield-alt" class="text-lg text-bg" />
          </div>
          <div>
            <div class="text-sm font-bold text-text">TypeUZ Admin</div>
            <div class="text-[10px] text-sub">Boshqaruv paneli</div>
          </div>
        </div>
        <nav class="flex flex-1 flex-col gap-1 p-4">
          <For each={navItems}>
            {(item) => (
              <a
                href={item.href}
                router-link
                class={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  props.active === item.id
                    ? "bg-main text-bg shadow-sm shadow-main/20"
                    : "text-sub hover:bg-sub-alt hover:text-text",
                )}
              >
                <Fa icon={item.icon as any} class="w-4 text-xs" />
                {item.label}
              </a>
            )}
          </For>
        </nav>
        <div class="border-t border-sub/10 p-4">
          <button
            type="button"
            onClick={() => {
              signOut();
              window.location.href = "/";
            }}
            class="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-sub transition-colors hover:bg-error/20 hover:text-error"
          >
            <Fa icon="fa-sign-out-alt" class="w-4 text-xs" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Main */}
      <div class="flex flex-1 flex-col">
        {/* Topbar */}
        <header class="flex h-16 items-center justify-between border-b border-sub/10 px-8">
          <h1 class="text-lg font-bold text-text">{props.title}</h1>
          <div class="flex items-center gap-3">
            <a
              href="/"
              router-link
              class="rounded-xl bg-sub-alt px-4 py-2 text-xs text-sub transition-colors hover:text-text"
            >
              <Fa icon="fa-arrow-left" class="mr-1.5" />
              Saytga qaytish
            </a>
          </div>
        </header>

        {/* Content */}
        <main class="flex-1 overflow-y-auto p-8">
          <Show
            when={props.children}
            fallback={
              <div class="flex h-64 items-center justify-center text-sub">
                Yuklanmoqda...
              </div>
            }
          >
            {props.children}
          </Show>
        </main>
      </div>
    </div>
  );
}
