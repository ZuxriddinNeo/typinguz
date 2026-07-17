import { QueryClientProvider } from "@tanstack/solid-query";
import { JSXElement } from "solid-js";
import { render } from "solid-js/web";

import { queryClient } from "../queries";
import { qsa } from "../utils/dom";
import { Theme } from "./core/Theme";
import { Footer } from "./layout/footer/Footer";
import { Header } from "./layout/header/Header";
import { Overlays } from "./layout/overlays/Overlays";
import { Modals } from "./modals/Modals";
import { NotFoundPage } from "./pages/404Page";
import { AboutPage } from "./pages/AboutPage";
import { AccountPage } from "./pages/account/AccountPage";
import { MyProfile } from "./pages/account/MyProfile";
import { LeaderboardPage } from "./pages/leaderboard/LeaderboardPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "./pages/login/AdminLoginPage";
import { LoginPage } from "./pages/login/LoginPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { Keymap } from "./pages/test/Keymap";
import { TestModesNotice } from "./pages/test/modes-notice/TestModesNotice";
import { Monkey } from "./pages/test/Monkey";
import { TestConfig } from "./pages/test/TestConfig";
import { LiveStatsBar } from "./pages/test/LiveStatsBar";
import { CommandlineHotkey } from "./hotkeys/CommandlineHotkey";
import { Popups } from "./popups/Popups";
import { LandingPage } from "./pages/landing/LandingPage";
import { OnboardingPage } from "./pages/onboarding/OnboardingPage";
import { PrivacyPolicyPage } from "./pages/legal/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/legal/TermsOfServicePage";
import { SecurityPolicyPage } from "./pages/legal/SecurityPolicyPage";

const components: Record<string, () => JSXElement> = {
  admindashboardpage: () => <AdminDashboardPage />,
  adminloginpage: () => <AdminLoginPage />,
  landingpage: () => <LandingPage />,
  footer: () => <Footer />,
  aboutpage: () => <AboutPage />,
  accountpage: () => <AccountPage />,
  loginpage: () => <LoginPage />,
  leaderboardpage: () => <LeaderboardPage />,
  profilepage: () => <ProfilePage />,
  myprofile: () => <MyProfile />,
  modals: () => <Modals />,
  popups: () => <Popups />,
  overlays: () => <Overlays />,
  theme: () => <Theme />,
  header: () => <Header />,
  testconfig: () => <TestConfig />,
  livestatsbar: () => <LiveStatsBar />,
  commandlinehotkey: () => <CommandlineHotkey />,
  testmodesnotice: () => <TestModesNotice />,
  notfoundpage: () => <NotFoundPage />,
  keymap: () => <Keymap />,
  monkey: () => <Monkey />,
  onboardingpage: () => <OnboardingPage />,
  privacypolicypage: () => <PrivacyPolicyPage />,
  termsofservicepage: () => <TermsOfServicePage />,
  securitypolicypage: () => <SecurityPolicyPage />,
};

function mountToMountpoint(name: string, component: () => JSXElement): void {
  for (const mountPoint of qsa(name)) {
    render(
      () => (
        <QueryClientProvider client={queryClient}>
          {component()}
        </QueryClientProvider>
      ),
      mountPoint.native,
    );
  }
}

export function mountComponents(): void {
  for (const [query, component] of Object.entries(components)) {
    mountToMountpoint(`mount[data-component=${query}]`, component);
  }
}
