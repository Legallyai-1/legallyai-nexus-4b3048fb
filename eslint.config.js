import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Vite output and Gradle state are generated locally. Supabase edge functions
    // run in Deno and should be checked with the Supabase/Deno tooling instead of
    // the browser-oriented React configuration below.
    ignores: ["dist", "android/.gradle", "android/app/.gradle", "supabase/functions"],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // The application currently uses permissive TypeScript settings and has
      // established Supabase response shapes that use `any`. Keep lint useful
      // for runtime and React issues without blocking CI on that legacy debt.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: [
      "src/pages/AppointmentsPage.tsx",
      "src/pages/ClientPortalPage.tsx",
      "src/pages/Index.tsx",
      "src/pages/MessagesPage.tsx",
      "src/pages/NotificationsPage.tsx",
      "src/pages/OnboardingPage.tsx",
      "src/pages/tools/StandaloneToolPages.tsx",
      "src/components/business/PracticeManagement.tsx",
      "src/components/business/TrustAccounting.tsx",
      "src/components/legal/ContractRedlineStudio.tsx",
      "src/lib/contract-review-input.ts",
      "src/lib/seo.ts",
      "supabase/functions/_shared/chat-stream.ts",
      "supabase/functions/legal-chat/index.ts",
    ],
    rules: { "@typescript-eslint/no-explicit-any": "error" },
  },
);
