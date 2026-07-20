// oxlint-disable react/no-unescaped-entities, solid/prefer-show, typescript/no-explicit-any, typescript/strict-boolean-expressions, curly, dot-notation, no-unnecessary-type-assertion, typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call, typescript/no-unsafe-return, typescript/no-unsafe-argument
import { createQuery } from "@tanstack/solid-query";
import { JSXElement, For, Show } from "solid-js";

import Ape from "../../../ape";
import { cn } from "../../../utils/cn";
import { Fa } from "../../common/Fa";
import { AdminLayout } from "./AdminLayout";

function StatCard(props: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}): JSXElement {
  return (
    <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5 transition-all hover:border-main/30">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-2xl font-bold text-text">{props.value}</div>
          <div class="mt-1 text-xs text-sub">{props.label}</div>
        </div>
        <div
          class={cn(
            "grid h-12 w-12 place-items-center rounded-xl",
            props.color,
          )}
        >
          <Fa icon={props.icon as any} class="text-lg text-bg" />
        </div>
      </div>
    </div>
  );
}

function ChartBars(props: {
  data: Array<Record<string, unknown>>;
  labelKey: string;
  valueKey: string;
  color: string;
}): JSXElement {
  const maxVal = () =>
    Math.max(1, ...props.data.map((d) => (d[props.valueKey] as number) ?? 0));
  return (
    <div class="flex items-end gap-0.5" style={{ height: "100px" }}>
      <For each={props.data}>
        {(d) => {
          const val = (d[props.valueKey] as number) ?? 0;
          const h = `${Math.max(3, (val / maxVal()) * 100)}%`;
          const label = ((d[props.labelKey] as string) ?? "").slice(5);
          return (
            <div class="group relative flex flex-1 flex-col items-center">
              <span class="mb-0.5 text-[8px] text-sub opacity-0 group-hover:opacity-100">
                {val}
              </span>
              <div
                class="w-full rounded-sm transition-all"
                style={{ height: h, background: props.color }}
              ></div>
              <span class="mt-0.5 text-[7px] text-sub/40">{label}</span>
            </div>
          );
        }}
      </For>
    </div>
  );
}

export function AdminDashboardPage(): JSXElement {
  const analyticsQuery = createQuery(() => ({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await Ape.admin.getAnalytics();
      return res.status === 200 ? (res.body.data as any) : null;
    },
    refetchInterval: 30_000,
  }));

  const signupsQuery = createQuery(() => ({
    queryKey: ["admin", "signups"],
    queryFn: async () => {
      const res = await Ape.admin.getSignupsByDay();
      return res.status === 200 ? (res.body.data as any) : [];
    },
  }));

  const dauQuery = createQuery(() => ({
    queryKey: ["admin", "dau"],
    queryFn: async () => {
      const res = await Ape.admin.getDau();
      return res.status === 200 ? (res.body.data as any) : [];
    },
  }));

  const retentionQuery = createQuery(() => ({
    queryKey: ["admin", "retention"],
    queryFn: async () => {
      const res = await Ape.admin.getRetention();
      return res.status === 200 ? (res.body.data as any) : null;
    },
  }));

  const activityQuery = createQuery(() => ({
    queryKey: ["admin", "activity"],
    queryFn: async () => {
      const res = await Ape.admin.getActivity();
      if (res.status === 200 && (res.body.data as any)?.data)
        return (res.body.data as any).data as any[];
      return [];
    },
  }));

  return (
    <AdminLayout active="dashboard" title="Dashboard">
      {/* Stats grid */}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Foydalanuvchilar"
          value={(analyticsQuery.data as any)?.totalUsers ?? "..."}
          icon="fa-users"
          color="bg-blue-600"
        />
        <StatCard
          label="Testlar"
          value={(analyticsQuery.data as any)?.totalTestsCompleted ?? "..."}
          icon="fa-keyboard"
          color="bg-green-600"
        />
        <StatCard
          label="Boshlangan"
          value={(analyticsQuery.data as any)?.totalTestsStarted ?? "..."}
          icon="fa-play"
          color="bg-purple-600"
        />
        <StatCard
          label="Soat"
          value={
            analyticsQuery.data
              ? Math.round((analyticsQuery.data as any).totalTimeTyping / 3600)
              : "..."
          }
          icon="fa-clock"
          color="bg-orange-600"
        />
        <StatCard
          label="24h faol"
          value={(analyticsQuery.data as any)?.activeUsersLast24h ?? "..."}
          icon="fa-bolt"
          color="bg-rose-600"
        />
      </div>

      {/* Retention */}
      <div class="mt-6">
        <Show when={retentionQuery.data}>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5 text-center">
              <div class="text-3xl font-bold text-main">
                {(retentionQuery.data as any)?.day1 ?? 0}%
              </div>
              <div class="mt-1 text-xs text-sub">1-kun qaytish</div>
            </div>
            <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5 text-center">
              <div class="text-3xl font-bold text-main">
                {(retentionQuery.data as any)?.day7 ?? 0}%
              </div>
              <div class="mt-1 text-xs text-sub">7-kun qaytish</div>
            </div>
            <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5 text-center">
              <div class="text-3xl font-bold text-main">
                {(retentionQuery.data as any)?.day30 ?? 0}%
              </div>
              <div class="mt-1 text-xs text-sub">30-kun qaytish</div>
            </div>
          </div>
        </Show>
      </div>

      {/* Charts */}
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5">
          <h2 class="mb-4 text-sm font-bold text-text">
            Ro'yxatdan o'tishlar (30 kun)
          </h2>
          <ChartBars
            data={signupsQuery.data ?? []}
            labelKey="date"
            valueKey="count"
            color="var(--main-color)"
          />
        </div>
        <div class="rounded-2xl border border-sub/10 bg-bg/60 p-5">
          <h2 class="mb-4 text-sm font-bold text-text">
            Kunlik faol foydalanuvchilar (30 kun)
          </h2>
          <ChartBars
            data={dauQuery.data ?? []}
            labelKey="date"
            valueKey="count"
            color="var(--main-color)"
          />
        </div>
      </div>

      {/* Activity */}
      <div class="mt-6 rounded-2xl border border-sub/10 bg-bg/60 p-5">
        <h2 class="mb-4 text-sm font-bold text-text">So'nggi faollik</h2>
        <Show
          when={(activityQuery.data ?? []).length > 0}
          fallback={<p class="text-sm text-sub">Ma'lumot yo'q</p>}
        >
          <div class="max-h-48 space-y-1 overflow-y-auto">
            <For each={activityQuery.data}>
              {(p: any) => (
                <div class="flex items-center justify-between rounded-lg bg-sub-alt/30 px-4 py-2 text-xs">
                  <span class="text-text">{p.date}</span>
                  <span class="text-sub">
                    {p.tests} test, {p.users} foydalanuvchi
                  </span>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </AdminLayout>
  );
}
