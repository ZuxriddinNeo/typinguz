// oxlint-disable react/no-unescaped-entities, solid/prefer-show, typescript/no-explicit-any, typescript/strict-boolean-expressions, curly
import { createForm } from "@tanstack/solid-form";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { JSXElement, Show, createSignal, For, createEffect } from "solid-js";
import { envConfig } from "virtual:env-config";

import type { FaSolidIcon } from "../../../types/font-awesome";

import Ape from "../../../ape";
import { signOut } from "../../../auth";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../states/notifications";
import { cn } from "../../../utils/cn";
import { getStoredToken } from "../../../utils/custom-auth";
import { Fa } from "../../common/Fa";
import { Page } from "../../common/Page";

// --- Utils ---
function Card(props: { title: string; children: JSXElement }): JSXElement {
  return (
    <div class="rounded-2xl border border-sub/10 bg-bg/50 p-6 backdrop-blur-sm">
      <h2 class="mb-4 text-lg font-bold text-text">{props.title}</h2>
      {props.children}
    </div>
  );
}

function Input(props: {
  value: string;
  onInput: (v: string) => void;
  placeholder?: string;
  type?: string;
  class?: string;
}): JSXElement {
  return (
    <input
      value={props.value}
      onInput={(e) => props.onInput(e.currentTarget.value)}
      placeholder={props.placeholder}
      type={props.type ?? "text"}
      class={cn(
        "w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main",
        props.class,
      )}
    />
  );
}

type TabDef = { id: string; label: string; icon: FaSolidIcon | string };

type AdConfig = {
  enabled: boolean;
  masterToggle: boolean;
  slots: Array<{
    slotId: string;
    creativeId?: string;
    imageUrl?: string;
    targetUrl?: string;
    enabled: boolean;
  }>;
  creatives: Array<{
    id: string;
    name?: string;
    imageUrl?: string;
    targetUrl?: string;
    enabled?: boolean;
  }>;
};

type AiAnalysis = {
  avgWpm: number;
  avgAccuracy: number;
  totalTests: number;
  bestWpm: number;
  trend: string;
  recommendation: string;
};

// --- Main Component ---
export function AdminDashboardPage(): JSXElement {
  const [activeTab, setActiveTab] = createSignal<string>("dashboard");
  const [banResult, setBanResult] = createSignal<string>("");
  const [searchResults, setSearchResults] = createSignal<
    Array<{ uid: string; name: string; email: string; banned?: boolean }>
  >([]);
  const [notificationResult, setNotificationResult] = createSignal<string>("");
  const [sendAll, setSendAll] = createSignal(false);
  const [pwdResult, setPwdResult] = createSignal("");
  const [pwdState, setPwdState] = createSignal<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [aiResult, setAiResult] = createSignal<Record<string, unknown> | null>(
    null,
  );
  const [aiLoading, setAiLoading] = createSignal(false);

  // --- Content editor state ---
  const [heroTitle, setHeroTitle] = createSignal("");
  const [heroSubtitle, setHeroSubtitle] = createSignal("");
  const [heroDesc, setHeroDesc] = createSignal("");
  const [features, setFeatures] = createSignal<
    Array<{ icon: string; title: string; description: string }>
  >([]);
  const [aboutCards, setAboutCards] = createSignal<
    Array<{ icon: string; title: string; description: string }>
  >([]);
  const [footerBrand, setFooterBrand] = createSignal("");
  const [footerTagline, setFooterTagline] = createSignal("");
  const [footerTelegram, setFooterTelegram] = createSignal("");

  // --- Theme editor state ---
  const [accentColor, setAccentColor] = createSignal("#ff5a1f");
  const [isDark, setIsDark] = createSignal(true);

  const tabs: TabDef[] = [
    { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
    { id: "users", label: "Foydalanuvchilar", icon: "fa-users" },
    { id: "content", label: "Kontent", icon: "fa-pencil-alt" },
    { id: "appearance", label: "Ko'rinish", icon: "fa-palette" },
    { id: "ai", label: "AI tahlil", icon: "fa-brain" },
    { id: "settings", label: "Sozlamalar", icon: "fa-cog" },
  ];

  const hideTabs = new Set<string>([]);

  // --- Analytics queries ---
  const analyticsQuery = createQuery(() => ({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await Ape.admin.getAnalytics();
      if (res.status === 200) return res.body.data;
      return null;
    },
    refetchInterval: 60_000,
  }));

  const signupsQuery = createQuery(() => ({
    queryKey: ["admin", "signups"],
    queryFn: async () => {
      const res = await Ape.admin.getSignupsByDay();
      if (res.status === 200) return res.body.data;
      return [];
    },
    refetchInterval: 60_000,
  }));

  const loginsDayQuery = createQuery(() => ({
    queryKey: ["admin", "loginsDay"],
    queryFn: async () => {
      const res = await Ape.admin.getLoginsByDay();
      if (res.status === 200) return res.body.data;
      return [];
    },
    refetchInterval: 60_000,
  }));

  const loginsWeekQuery = createQuery(() => ({
    queryKey: ["admin", "loginsWeek"],
    queryFn: async () => {
      const res = await Ape.admin.getLoginsByWeek();
      if (res.status === 200) return res.body.data;
      return [];
    },
    refetchInterval: 60_000,
  }));

  const activityQuery = createQuery(() => ({
    queryKey: ["admin", "activity"],
    queryFn: async () => {
      const res = await Ape.admin.getActivity();
      if (res.status === 200 && res.body.data !== null)
        return res.body.data.data;
      return [];
    },
    refetchInterval: 60_000,
  }));

  // --- Content query ---
  const contentQuery = createQuery(() => ({
    queryKey: ["admin", "content"],
    queryFn: async () => {
      const res = await Ape.admin.getSiteContent();
      if (res.status === 200) return res.body.data;
      return null;
    },
  }));

  createEffect(() => {
    const c = contentQuery.data;
    if (c !== undefined && c !== null) {
      const d = c as {
        hero?: { title?: string; subtitle?: string; description?: string };
        features?: Array<{ icon: string; title: string; description: string }>;
        aboutCards?: Array<{
          icon: string;
          title: string;
          description: string;
        }>;
        footer?: { brandName?: string; tagline?: string; telegram?: string };
      };
      if (d.hero) {
        setHeroTitle(d.hero.title ?? "");
        setHeroSubtitle(d.hero.subtitle ?? "");
        setHeroDesc(d.hero.description ?? "");
      }
      if (d.features) setFeatures(d.features);
      if (d.aboutCards) setAboutCards(d.aboutCards);
      if (d.footer) {
        setFooterBrand(d.footer.brandName ?? "");
        setFooterTagline(d.footer.tagline ?? "");
        setFooterTelegram(d.footer.telegram ?? "");
      }
    }
  });

  // --- Theme query ---
  const themeQuery = createQuery(() => ({
    queryKey: ["admin", "theme"],
    queryFn: async () => {
      const res = await Ape.admin.getThemeSettings();
      if (res.status === 200) return res.body.data;
      return null;
    },
  }));

  createEffect(() => {
    const t = themeQuery.data;
    if (t !== undefined && t !== null) {
      const d = t as { accentColor?: string; isDark?: boolean };
      if (d.accentColor) setAccentColor(d.accentColor);
      if (d.isDark !== undefined) setIsDark(d.isDark);
    }
  });

  // --- Ad config ---
  const adConfigQuery = createQuery(() => ({
    queryKey: ["admin", "adConfig"],
    queryFn: async () => {
      const res = await Ape.admin.getAdConfig();
      if (res.status === 200) return res.body.data;
      return null;
    },
  }));

  // --- Ban ---
  const banMutation = createMutation(() => ({
    mutationFn: async (uid: string) => Ape.admin.toggleBan({ body: { uid } }),
    onSuccess: (data) => {
      const d = data as { data?: { banned: boolean } };
      if (d.data)
        setBanResult(
          `Foydalanuvchi ${d.data.banned ? "bloklandi" : "blokdan ochildi"}`,
        );
    },
    onError: () => showErrorNotification("Bloklashda xatolik"),
  }));

  const banForm = createForm(() => ({
    defaultValues: { uid: "" },
    onSubmit: ({ value }) => {
      banMutation.mutate(value.uid);
    },
  }));

  // --- Email ---
  const emailForm = createForm(() => ({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      try {
        await Ape.admin.sendForgotPasswordEmail({
          body: { email: value.email },
        });
        showSuccessNotification("Parolni tiklash emaili yuborildi");
      } catch {
        showErrorNotification("Email yuborishda xatolik");
      }
    },
  }));

  // --- Search ---
  const searchForm = createForm(() => ({
    defaultValues: { q: "" },
    onSubmit: async ({ value }) => {
      try {
        const res = await Ape.admin.searchUsers({ query: { q: value.q } });
        if (res.status === 200)
          setSearchResults(
            res.body.data as Array<{
              uid: string;
              name: string;
              email: string;
              banned?: boolean;
            }>,
          );
      } catch {
        showErrorNotification("Qidirishda xatolik");
      }
    },
  }));

  // --- Notification ---
  const notificationForm = createForm(() => ({
    defaultValues: { uid: "", subject: "", body: "" },
    onSubmit: async ({ value }) => {
      try {
        const uid = sendAll() ? "*" : value.uid;
        await Ape.admin.sendNotification({
          body: { uid, subject: value.subject, body: value.body },
        });
        setNotificationResult(
          sendAll()
            ? "Barcha foydalanuvchilarga yuborildi"
            : "Bildirishnoma yuborildi",
        );
        showSuccessNotification("Bildirishnoma yuborildi");
      } catch {
        showErrorNotification("Bildirishnoma yuborishda xatolik");
      }
    },
  }));

  // --- Creative ---
  const creativeForm = createForm(() => ({
    defaultValues: { imageUrl: "", targetUrl: "" },
    onSubmit: async ({ value }) => {
      try {
        await Ape.admin.addCreative({ body: value });
        showSuccessNotification("Reklama kreativi qo'shildi");
        void adConfigQuery.refetch();
      } catch {
        showErrorNotification("Kreativ qo'shishda xatolik");
      }
    },
  }));

  const deleteCreativeMutation = createMutation(() => ({
    mutationFn: async (id: string) =>
      Ape.admin.deleteCreative({ params: { id } }),
    onSuccess: () => {
      showSuccessNotification("Kreativ o'chirildi");
      void adConfigQuery.refetch();
    },
    onError: () => showErrorNotification("Kreativni o'chirishda xatolik"),
  }));

  // --- AI test ---
  const runAiAnalysis = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await Ape.users.getWeeklyAnalysis();
      if (res.status === 200) setAiResult(res.body.data);
      else showErrorNotification("AI tahlil xatosi");
    } catch {
      showErrorNotification("AI server xatosi");
    } finally {
      setAiLoading(false);
    }
  };

  // --- Save content ---
  const saveContent = async () => {
    try {
      const body = {
        hero: {
          title: heroTitle(),
          subtitle: heroSubtitle(),
          description: heroDesc(),
        },
        features: features(),
        aboutCards: aboutCards(),
        footer: {
          brandName: footerBrand(),
          tagline: footerTagline(),
          telegram: footerTelegram(),
        },
      };
      await Ape.admin.updateSiteContent({ body });
      showSuccessNotification("Kontent saqlandi");
    } catch {
      showErrorNotification("Kontentni saqlashda xatolik");
    }
  };

  // --- Save theme ---
  const saveTheme = async () => {
    try {
      await Ape.admin.updateThemeSettings({
        body: { accentColor: accentColor(), isDark: isDark() },
      });
      document.documentElement.style.setProperty("--main-color", accentColor());
      document.documentElement.style.setProperty(
        "--caret-color",
        accentColor(),
      );
      showSuccessNotification("Rang saqlandi");
    } catch {
      showErrorNotification("Rangni saqlashda xatolik");
    }
  };

  // --- Ad toggle ---
  const adToggle = () => {
    const c = adConfigQuery.data as AdConfig | null | undefined;
    if (!c) return;
    const updated: AdConfig = { ...c, enabled: !c.enabled };
    void Ape.admin
      .updateAdConfig({ body: updated as never })
      .then(() => {
        showSuccessNotification(
          `Reklama ${updated.enabled ? "yoqildi" : "o'chirilgan"}`,
        );
        void adConfigQuery.refetch();
      })
      .catch(() =>
        showErrorNotification("Reklama sozlamalarini o'zgartirishda xatolik"),
      );
  };

  // --- Change password ---
  const changePassword = async (e: Event) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const cp = fd.get("currentPassword") as string;
    const np = fd.get("newPassword") as string;
    const cf = fd.get("confirmPassword") as string;
    if (np !== cf) {
      setPwdResult("Yangi parollar mos emas");
      setPwdState("error");
      return;
    }
    if (np.length < 8) {
      setPwdResult("Kamida 8 belgi");
      setPwdState("error");
      return;
    }
    setPwdState("loading");
    try {
      const token = getStoredToken();
      const res = await fetch(
        `${envConfig.backendUrl}/auth/admin/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword: cp, newPassword: np }),
        },
      );
      const json = (await res.json()) as { message: string };
      if (res.ok) {
        setPwdResult("Parol o'zgartirildi");
        setPwdState("success");
        form.reset();
      } else {
        setPwdResult(`Xatolik: ${json.message}`);
        setPwdState("error");
      }
    } catch {
      setPwdResult("Server xatosi");
      setPwdState("error");
    }
  };

  // --- Add/remove content items ---
  const addFeature = () =>
    setFeatures([
      ...features(),
      { icon: "fa-star", title: "", description: "" },
    ]);
  const removeFeature = (i: number) =>
    setFeatures(features().filter((_, idx) => idx !== i));
  const updateFeature = (
    i: number,
    field: "icon" | "title" | "description",
    v: string,
  ) => {
    const copy = [...features()] as Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    copy[i] = { ...copy[i], [field]: v } as {
      icon: string;
      title: string;
      description: string;
    };
    setFeatures(copy);
  };
  const addAboutCard = () =>
    setAboutCards([
      ...aboutCards(),
      { icon: "fa-star", title: "", description: "" },
    ]);
  const removeAboutCard = (i: number) =>
    setAboutCards(aboutCards().filter((_, idx) => idx !== i));
  const updateAboutCard = (
    i: number,
    field: "icon" | "title" | "description",
    v: string,
  ) => {
    const copy = [...aboutCards()] as Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    copy[i] = { ...copy[i], [field]: v } as {
      icon: string;
      title: string;
      description: string;
    };
    setAboutCards(copy);
  };

  return (
    <Page id="adminDashboard">
      <div class="flex gap-6 px-4 py-8">
        {/* Sidebar */}
        <div class="flex w-56 shrink-0 flex-col gap-4">
          <div class="flex items-center gap-2 px-2">
            <Fa icon="fa-shield-alt" class="text-xl text-main" />
            <span class="text-lg font-bold text-text">Admin</span>
          </div>
          <nav class="flex flex-col gap-1 rounded-2xl border border-sub/10 bg-bg/30 p-2">
            <For each={tabs.filter((t) => !hideTabs.has(t.id))}>
              {(tab) => (
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  class={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    activeTab() === tab.id
                      ? "bg-main text-bg shadow-sm"
                      : "text-sub hover:bg-sub-alt hover:text-text",
                  )}
                >
                  <Fa icon={tab.icon as FaSolidIcon} class="w-4 text-xs" />
                  {tab.label}
                </button>
              )}
            </For>
          </nav>
          <button
            type="button"
            onClick={() => {
              signOut();
              window.location.href = "/";
            }}
            class="mt-auto rounded-xl bg-sub-alt px-3 py-2.5 text-sm text-sub transition-colors hover:bg-error hover:text-bg"
          >
            <Fa icon="fa-sign-out-alt" class="mr-2" />
            Chiqish
          </button>
        </div>

        {/* Main */}
        <div class="flex min-w-0 flex-1 flex-col gap-6">
          {/* ===== TAB: Dashboard ===== */}
          <Show when={activeTab() === "dashboard"}>
            <div class="grid gap-4 sm:grid-cols-5">
              <div class="rounded-2xl border border-sub/10 bg-bg/50 p-4 text-center">
                <div class="text-2xl font-bold text-text">
                  {analyticsQuery.data?.totalUsers ?? "..."}
                </div>
                <div class="text-xs text-sub">Foydalanuvchilar</div>
              </div>
              <div class="rounded-2xl border border-sub/10 bg-bg/50 p-4 text-center">
                <div class="text-2xl font-bold text-text">
                  {analyticsQuery.data?.totalTestsCompleted ?? "..."}
                </div>
                <div class="text-xs text-sub">Testlar</div>
              </div>
              <div class="rounded-2xl border border-sub/10 bg-bg/50 p-4 text-center">
                <div class="text-2xl font-bold text-text">
                  {analyticsQuery.data?.totalTestsStarted ?? "..."}
                </div>
                <div class="text-xs text-sub">Boshlangan</div>
              </div>
              <div class="rounded-2xl border border-sub/10 bg-bg/50 p-4 text-center">
                <div class="text-2xl font-bold text-text">
                  {analyticsQuery.data
                    ? Math.round(analyticsQuery.data.totalTimeTyping / 3600)
                    : "..."}
                </div>
                <div class="text-xs text-sub">Soat</div>
              </div>
              <div class="rounded-2xl border border-sub/10 bg-bg/50 p-4 text-center">
                <div class="text-2xl font-bold text-text">
                  {analyticsQuery.data?.activeUsersLast24h ?? "..."}
                </div>
                <div class="text-xs text-sub">24h faol</div>
              </div>
            </div>

            {/* Charts */}
            <div class="grid gap-6 lg:grid-cols-2">
              <Card title="Ro'yxatdan o'tishlar (30 kun)">
                <ChartBars
                  data={signupsQuery.data ?? []}
                  labelKey="date"
                  valueKey="count"
                  color="var(--main-color)"
                />
              </Card>
              <Card title="Kirishlar (30 kun)">
                <ChartBars
                  data={loginsDayQuery.data ?? []}
                  labelKey="date"
                  valueKey="count"
                  color="var(--main-color)"
                />
              </Card>
              <Card title="Kirishlar haftalik (12 hafta)">
                <ChartBars
                  data={loginsWeekQuery.data ?? []}
                  labelKey="week"
                  valueKey="count"
                  color="var(--main-color)"
                />
              </Card>
              <Card title="Faollik (7 kun)">
                <Show
                  when={(activityQuery.data ?? []).length > 0}
                  fallback={<p class="text-sm text-sub">Ma'lumot yo'q</p>}
                >
                  <div class="max-h-60 space-y-1 overflow-y-auto">
                    <For each={activityQuery.data}>
                      {(p) => (
                        <div class="flex items-center justify-between rounded-lg bg-sub-alt/30 px-3 py-1.5 text-xs">
                          <span class="text-text">{p.date}</span>
                          <span class="text-sub">
                            {p.tests} test, {p.users} foydalanuvchi
                          </span>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </Card>
            </div>
          </Show>

          {/* ===== TAB: Users ===== */}
          <Show when={activeTab() === "users"}>
            <div class="grid gap-6 lg:grid-cols-2">
              <Card title="Bloklash">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void banForm.handleSubmit();
                  }}
                  class="flex flex-col gap-3"
                >
                  <banForm.Field name="uid">
                    {(f) => (
                      <input
                        value={f().state.value}
                        onInput={(e) => f().handleChange(e.currentTarget.value)}
                        placeholder="Foydalanuvchi UID"
                        class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                      />
                    )}
                  </banForm.Field>
                  <button
                    type="submit"
                    class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
                  >
                    Bloklash/ochish
                  </button>
                </form>
                <Show when={banResult()}>
                  <p class="mt-2 text-sm text-sub">{banResult()}</p>
                </Show>
              </Card>

              <Card title="Parolni tiklash">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void emailForm.handleSubmit();
                  }}
                  class="flex flex-col gap-3"
                >
                  <emailForm.Field name="email">
                    {(f) => (
                      <input
                        value={f().state.value}
                        onInput={(e) => f().handleChange(e.currentTarget.value)}
                        placeholder="Foydalanuvchi emaili"
                        class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                      />
                    )}
                  </emailForm.Field>
                  <button
                    type="submit"
                    class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
                  >
                    Tiklash emaili yuborish
                  </button>
                </form>
              </Card>

              <Card title="Qidirish">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void searchForm.handleSubmit();
                  }}
                  class="flex flex-col gap-3"
                >
                  <searchForm.Field name="q">
                    {(f) => (
                      <input
                        value={f().state.value}
                        onInput={(e) => f().handleChange(e.currentTarget.value)}
                        placeholder="Ism, email yoki UID"
                        class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                      />
                    )}
                  </searchForm.Field>
                  <button
                    type="submit"
                    class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
                  >
                    Qidirish
                  </button>
                </form>
                <Show when={searchResults().length > 0}>
                  <div class="mt-3 max-h-48 space-y-1 overflow-y-auto">
                    <For each={searchResults()}>
                      {(u) => (
                        <div class="rounded-lg bg-sub-alt/50 p-2 text-xs text-text">
                          <span class="font-medium">{u.name}</span> — {u.email}
                          <span class="ml-2 text-sub">
                            ({u.uid.slice(0, 8)}...)
                          </span>
                          <Show when={u.banned}>
                            <span class="ml-2 text-error">[bloklangan]</span>
                          </Show>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </Card>

              <Card title="Bildirishnoma yuborish">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void notificationForm.handleSubmit();
                  }}
                  class="flex flex-col gap-3"
                >
                  <div class="flex items-center gap-3">
                    <label class="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sendAll()}
                        onChange={(e) => setSendAll(e.currentTarget.checked)}
                        class="h-4 w-4 accent-main"
                      />
                      <span class="text-sm text-text">Barchaga yuborish</span>
                    </label>
                  </div>
                  <Show
                    when={!sendAll()}
                    fallback={
                      <div class="rounded-lg bg-main/10 p-3 text-xs text-sub">
                        Barcha ro'yxatdan o'tgan foydalanuvchilarga xabar ketadi
                      </div>
                    }
                  >
                    <notificationForm.Field name="uid">
                      {(f) => (
                        <input
                          value={f().state.value}
                          onInput={(e) =>
                            f().handleChange(e.currentTarget.value)
                          }
                          placeholder="Foydalanuvchi UID"
                          class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                        />
                      )}
                    </notificationForm.Field>
                  </Show>
                  <notificationForm.Field name="subject">
                    {(f) => (
                      <input
                        value={f().state.value}
                        onInput={(e) => f().handleChange(e.currentTarget.value)}
                        placeholder="Mavzu"
                        class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                      />
                    )}
                  </notificationForm.Field>
                  <notificationForm.Field name="body">
                    {(f) => (
                      <textarea
                        value={f().state.value}
                        onInput={(e) => f().handleChange(e.currentTarget.value)}
                        placeholder="Matn"
                        rows={3}
                        class="w-full resize-none rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                      ></textarea>
                    )}
                  </notificationForm.Field>
                  <button
                    type="submit"
                    class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
                  >
                    {sendAll() ? "Barchaga yuborish" : "Yuborish"}
                  </button>
                </form>
                <Show when={notificationResult()}>
                  <p class="mt-2 text-sm text-sub">{notificationResult()}</p>
                </Show>
              </Card>
            </div>
          </Show>

          {/* ===== TAB: Content ===== */}
          <Show when={activeTab() === "content"}>
            <Card title="Bosh sahifa — Hero">
              <div class="flex flex-col gap-3">
                <Input
                  value={heroTitle()}
                  onInput={setHeroTitle}
                  placeholder="Sarlavha (TypeUZ)"
                />
                <Input
                  value={heroSubtitle()}
                  onInput={setHeroSubtitle}
                  placeholder="Kichik sarlavha"
                />
                <Input
                  value={heroDesc()}
                  onInput={setHeroDesc}
                  placeholder="Ta'rif"
                />
              </div>
            </Card>

            <Card title="Features">
              <div class="flex flex-col gap-4">
                <For each={features()}>
                  {(f, i) => (
                    <div class="flex items-start gap-2 rounded-lg bg-sub-alt/30 p-3">
                      <div class="flex flex-1 flex-col gap-2">
                        <Input
                          value={f.icon}
                          onInput={(v) => updateFeature(i(), "icon", v)}
                          placeholder="Icon (fa-star)"
                        />
                        <Input
                          value={f.title}
                          onInput={(v) => updateFeature(i(), "title", v)}
                          placeholder="Sarlavha"
                        />
                        <Input
                          value={f.description}
                          onInput={(v) => updateFeature(i(), "description", v)}
                          placeholder="Ta'rif"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(i())}
                        class="mt-1 rounded-lg bg-error/20 p-2 text-error hover:bg-error hover:text-bg"
                      >
                        <Fa icon="fa-times" />
                      </button>
                    </div>
                  )}
                </For>
                <button
                  type="button"
                  onClick={addFeature}
                  class="self-start rounded-xl bg-sub-alt px-4 py-2 text-sm text-sub hover:text-text"
                >
                  <Fa icon="fa-plus" class="mr-1" /> Feature qo'shish
                </button>
              </div>
            </Card>

            <Card title="About kardlari">
              <div class="flex flex-col gap-4">
                <For each={aboutCards()}>
                  {(c, i) => (
                    <div class="flex items-start gap-2 rounded-lg bg-sub-alt/30 p-3">
                      <div class="flex flex-1 flex-col gap-2">
                        <Input
                          value={c.icon}
                          onInput={(v) => updateAboutCard(i(), "icon", v)}
                          placeholder="Icon (fa-language)"
                        />
                        <Input
                          value={c.title}
                          onInput={(v) => updateAboutCard(i(), "title", v)}
                          placeholder="Sarlavha"
                        />
                        <Input
                          value={c.description}
                          onInput={(v) =>
                            updateAboutCard(i(), "description", v)
                          }
                          placeholder="Ta'rif"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAboutCard(i())}
                        class="mt-1 rounded-lg bg-error/20 p-2 text-error hover:bg-error hover:text-bg"
                      >
                        <Fa icon="fa-times" />
                      </button>
                    </div>
                  )}
                </For>
                <button
                  type="button"
                  onClick={addAboutCard}
                  class="self-start rounded-xl bg-sub-alt px-4 py-2 text-sm text-sub hover:text-text"
                >
                  <Fa icon="fa-plus" class="mr-1" /> About kard qo'shish
                </button>
              </div>
            </Card>

            <Card title="Footer">
              <div class="flex flex-col gap-3">
                <Input
                  value={footerBrand()}
                  onInput={setFooterBrand}
                  placeholder="Brand nomi"
                />
                <Input
                  value={footerTagline()}
                  onInput={setFooterTagline}
                  placeholder="Shior"
                />
                <Input
                  value={footerTelegram()}
                  onInput={setFooterTelegram}
                  placeholder="Telegram link"
                />
              </div>
            </Card>

            <div class="flex justify-end">
              <button
                type="button"
                onClick={saveContent}
                class="rounded-xl bg-main px-6 py-3 text-sm font-bold text-bg hover:opacity-90"
              >
                <Fa icon="fa-save" class="mr-2" />
                Kontentni saqlash
              </button>
            </div>
          </Show>

          {/* ===== TAB: Appearance ===== */}
          <Show when={activeTab() === "appearance"}>
            <Card title="Akkent rangi">
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-4">
                  <input
                    type="color"
                    value={accentColor()}
                    onInput={(e) => setAccentColor(e.currentTarget.value)}
                    class="h-12 w-24 cursor-pointer rounded-xl border-0 bg-transparent"
                  />
                  <div class="flex flex-col">
                    <span class="text-sm text-text">
                      Hozirgi: {accentColor()}
                    </span>
                    <span class="text-xs text-sub">
                      Asosiy to'q sariq rang (#ff5a1f)
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-text">Tema:</span>
                  <button
                    type="button"
                    onClick={() => setIsDark(true)}
                    class={cn(
                      "rounded-xl px-4 py-2 text-sm transition-colors",
                      isDark() ? "bg-main text-bg" : "bg-sub-alt text-sub",
                    )}
                  >
                    Qorong'i
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDark(false)}
                    class={cn(
                      "rounded-xl px-4 py-2 text-sm transition-colors",
                      !isDark() ? "bg-main text-bg" : "bg-sub-alt text-sub",
                    )}
                  >
                    Yorug'
                  </button>
                </div>
                <button
                  type="button"
                  onClick={saveTheme}
                  class="self-start rounded-xl bg-main px-6 py-3 text-sm font-bold text-bg hover:opacity-90"
                >
                  <Fa icon="fa-save" class="mr-2" />
                  Rangni saqlash
                </button>
              </div>
            </Card>
          </Show>

          {/* ===== TAB: Ads ===== */}
          <Show when={activeTab() === "ads"}>
            <div class="grid gap-6 lg:grid-cols-2">
              <Card title="Reklama sozlamalari">
                <Show
                  when={adConfigQuery.data}
                  fallback={<p class="text-sm text-sub">Yuklanmoqda...</p>}
                >
                  <div class="space-y-3 text-sm">
                    <div class="flex items-center justify-between">
                      <span class="text-text">Reklama yoqilgan</span>
                      <button
                        type="button"
                        onClick={adToggle}
                        class={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                          (adConfigQuery.data as AdConfig | undefined)?.enabled
                            ? "bg-green-600 text-white"
                            : "bg-sub-alt text-sub"
                        }`}
                      >
                        {(adConfigQuery.data as AdConfig | undefined)?.enabled
                          ? "Yoqilgan"
                          : "O'chirilgan"}
                      </button>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-text">Master kalit</span>
                      <span
                        class={`rounded-lg px-3 py-1 text-xs font-medium ${
                          (adConfigQuery.data as AdConfig | undefined)
                            ?.masterToggle
                            ? "bg-green-600 text-white"
                            : "bg-sub-alt text-sub"
                        }`}
                      >
                        {(adConfigQuery.data as AdConfig | undefined)
                          ?.masterToggle
                          ? "Yoqilgan"
                          : "O'chirilgan"}
                      </span>
                    </div>
                    <p class="text-xs text-sub">
                      Slotlar:{" "}
                      {(adConfigQuery.data as AdConfig | undefined)?.slots
                        .length ?? 0}{" "}
                      | Kreativlar:{" "}
                      {(adConfigQuery.data as AdConfig | undefined)?.creatives
                        .length ?? 0}
                    </p>
                    <Show
                      when={
                        ((adConfigQuery.data as AdConfig | undefined)?.creatives
                          .length ?? 0) > 0
                      }
                    >
                      <div class="mt-2 max-h-32 space-y-1 overflow-y-auto">
                        <For
                          each={
                            (adConfigQuery.data as AdConfig | undefined)
                              ?.creatives ?? []
                          }
                        >
                          {(cr) => (
                            <div class="flex items-center justify-between rounded-lg bg-sub-alt/30 px-3 py-1.5 text-xs">
                              <span class="truncate text-text">
                                {(cr.imageUrl ?? cr.id).slice(0, 40)}...
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  deleteCreativeMutation.mutate(cr.id)
                                }
                                class="ml-2 text-error hover:underline"
                              >
                                <Fa icon="fa-trash" />
                              </button>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </Show>
              </Card>

              <Card title="Kreativ qo'shish">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void creativeForm.handleSubmit();
                  }}
                  class="flex flex-col gap-3"
                >
                  <creativeForm.Field name="imageUrl">
                    {(f) => (
                      <input
                        value={f().state.value}
                        onInput={(e) => f().handleChange(e.currentTarget.value)}
                        placeholder="Rasm URL"
                        class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                      />
                    )}
                  </creativeForm.Field>
                  <creativeForm.Field name="targetUrl">
                    {(f) => (
                      <input
                        value={f().state.value}
                        onInput={(e) => f().handleChange(e.currentTarget.value)}
                        placeholder="Havola URL"
                        class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                      />
                    )}
                  </creativeForm.Field>
                  <button
                    type="submit"
                    class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
                  >
                    Qo'shish
                  </button>
                </form>
              </Card>
            </div>
          </Show>

          {/* ===== TAB: AI ===== */}
          <Show when={activeTab() === "ai"}>
            <Card title="AI Weekly Analysis — Test">
              <p class="mb-4 text-sm text-sub">
                Bu tugma haqiqiy foydalanuvchi ma'lumotlaridan so'nggi 7 kunlik
                tahlilni chaqiradi. Cheklov yo'q — istalgan vaqtda bosishingiz
                mumkin.
              </p>
              <button
                type="button"
                onClick={runAiAnalysis}
                disabled={aiLoading()}
                class="rounded-xl bg-main px-6 py-3 text-sm font-bold text-bg hover:opacity-90 disabled:opacity-50"
              >
                {aiLoading() ? (
                  "Yuklanmoqda..."
                ) : (
                  <>
                    <Fa icon="fa-brain" class="mr-2" />
                    Tahlilni ishga tushirish
                  </>
                )}
              </button>

              <Show when={aiResult() !== null}>
                <div class="mt-6 rounded-2xl border border-sub/10 bg-bg/50 p-6">
                  <h3 class="mb-4 text-base font-bold text-text">Natija</h3>
                  <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <span class="text-xs text-sub">O'rtacha WPM</span>
                      <div class="text-2xl font-bold text-text">
                        {(aiResult() as unknown as AiAnalysis | undefined)
                          ?.avgWpm ?? "—"}
                      </div>
                    </div>
                    <div>
                      <span class="text-xs text-sub">Aniqlik</span>
                      <div class="text-2xl font-bold text-text">
                        {(aiResult() as unknown as AiAnalysis | undefined)
                          ?.avgAccuracy ?? "—"}
                        %
                      </div>
                    </div>
                    <div>
                      <span class="text-xs text-sub">Testlar</span>
                      <div class="text-2xl font-bold text-text">
                        {(aiResult() as unknown as AiAnalysis | undefined)
                          ?.totalTests ?? "—"}
                      </div>
                    </div>
                    <div>
                      <span class="text-xs text-sub">Eng yaxshi WPM</span>
                      <div class="text-2xl font-bold text-text">
                        {(aiResult() as unknown as AiAnalysis | undefined)
                          ?.bestWpm ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 flex items-center gap-2 text-xs">
                    <span class="text-sub">Trend:</span>
                    <span
                      class={
                        (aiResult() as unknown as AiAnalysis | undefined)
                          ?.trend === "improving"
                          ? "text-green-400"
                          : (aiResult() as unknown as AiAnalysis | undefined)
                                ?.trend === "declining"
                            ? "text-red-400"
                            : "text-sub"
                      }
                    >
                      {(aiResult() as unknown as AiAnalysis | undefined)
                        ?.trend ?? "—"}
                    </span>
                  </div>
                  <Show
                    when={
                      (aiResult() as unknown as AiAnalysis | undefined)
                        ?.recommendation
                    }
                  >
                    <div class="mt-3 rounded-lg bg-sub-alt/30 p-3 text-xs text-sub">
                      <span class="font-semibold text-text">Tavsiya: </span>
                      {
                        (aiResult() as unknown as AiAnalysis | undefined)
                          ?.recommendation
                      }
                    </div>
                  </Show>
                </div>
              </Show>
            </Card>
          </Show>

          {/* ===== TAB: Settings ===== */}
          <Show when={activeTab() === "settings"}>
            <div class="grid gap-6 lg:grid-cols-2">
              <Card title="Parolni o'zgartirish">
                <form onSubmit={changePassword} class="flex flex-col gap-3">
                  <input
                    name="currentPassword"
                    type="password"
                    placeholder="Joriy parol"
                    autocomplete="current-password"
                    required
                    minLength={1}
                    class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                  />
                  <input
                    name="newPassword"
                    type="password"
                    placeholder="Yangi parol (8+ belgi)"
                    autocomplete="new-password"
                    required
                    minLength={8}
                    class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Yangi parolni takrorlang"
                    autocomplete="new-password"
                    required
                    minLength={8}
                    class="w-full rounded-xl bg-sub-alt p-3 text-sm text-text ring-1 ring-sub/20 outline-none focus:ring-main"
                  />
                  <button
                    type="submit"
                    disabled={pwdState() === "loading"}
                    class="rounded-xl bg-main px-4 py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
                  >
                    {pwdState() === "loading"
                      ? "Yuborilmoqda..."
                      : "Parolni o'zgartirish"}
                  </button>
                  <Show when={pwdResult()}>
                    <p
                      class={`mt-1 text-sm ${pwdState() === "success" ? "text-green-500" : "text-error"}`}
                    >
                      {pwdResult()}
                    </p>
                  </Show>
                </form>
              </Card>

              <Card title="Ma'lumot">
                <div class="space-y-2 text-sm text-sub">
                  <p>Admin endpointlari himoyalangan. So'rovlar cheklangan.</p>
                  <p class="text-xs text-sub/60">Dev login: admin / 12345</p>
                </div>
              </Card>
            </div>
          </Show>
        </div>
      </div>
    </Page>
  );
}

// --- Simple CSS Bar Chart ---
function ChartBars(props: {
  data: Array<Record<string, unknown>>;
  labelKey: string;
  valueKey: string;
  color: string;
}): JSXElement {
  const maxVal = () =>
    Math.max(1, ...props.data.map((d) => (d[props.valueKey] as number) ?? 0));

  return (
    <Show
      when={props.data.length > 0}
      fallback={<p class="text-sm text-sub">Ma'lumot yo'q</p>}
    >
      <div class="flex items-end gap-1" style={{ height: "120px" }}>
        <For each={props.data}>
          {(d) => {
            const val = (d[props.valueKey] as number) ?? 0;
            const h = `${Math.max(4, (val / maxVal()) * 100)}%`;
            const label = ((d[props.labelKey] as string) ?? "").slice(5);
            return (
              <div class="flex flex-1 flex-col items-center gap-1">
                <span class="text-[9px] text-sub">{val}</span>
                <div
                  class="w-full rounded transition-all duration-300"
                  style={{ height: h, background: props.color }}
                ></div>
                <span class="w-full truncate text-center text-[8px] text-sub/60">
                  {label}
                </span>
              </div>
            );
          }}
        </For>
      </div>
    </Show>
  );
}
