"use client"
import { Routes, Route } from "react-router-dom"
import type React from "react"

import { I18nProvider } from "@lingui/react"
import { i18n } from "@lingui/core"
import { useEffect, useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/Sidebar"
import { ThemeProvider } from "@/components/ThemeProvider"
import { NavigationMenuBar } from "./components/NavigationMenu"
import Inbox from "./components/Inbox"
import SignUpForm from "./modules/auth/signUp"
import SignInForm from "./modules/auth/signIn"
import UserTable from "./components/user/UserTable"
import Settings from "./routes/settings"
import Account from "./components/Account"
import { Calendar1 } from "./components/Calendar"
import { Toaster } from "./components/ui/sonner"
import KanbanBoard from "./components/kanban/KanbanBoard"
import OrgChart from "./components/OrganisationChart"
import { InvoiceForm } from "./components/InvoiceForm"
import { PushManager } from "./components/PushManager"
import TicketingSystem from "./components/TicketManagement"
import ProfilePage from "./components/ProfilePage"
import ForgotPasswordForm from "./modules/auth/forgotPassword"
import CitiesPage from "./components/Cities"
import { OpenAPI } from "@/api/core/OpenAPI"
import { CustomOpenAPIConfig } from "@/api/custom/OpenAPIConfig"
import SopPage from "./components/Sop"
import { AvatarProvider } from "@/stores/AvatarStore"
import ResetPasswordPage from "./modules/auth/resetPassword"
import FallbackRoot from "./ResetFallback"
import UserManagementPage from "./components/user/UsersList"
import FormTemplatesPage from "./components/form/FormTemplates"
import FormBuilder from "./components/form/form-builder"
import FormPreviewPage from "./components/form/FormPreviewPage1"
import { useLocation } from "react-router-dom"

const localeMessages = {
  en: () => import("@/locales/en/messages.js"),
  hi: () => import("@/locales/hi/messages.js"),
  de: () => import("@/locales/de/messages.js"),
}

// Layout component for pages with sidebar
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <NavigationMenuBar />
          <SidebarTrigger />
          <PushManager />
          <div className="p-4">{children}</div>
        </main>
        <Toaster richColors position="top-center" />
      </div>
    </SidebarProvider>
  )
}

// Layout component for full-screen pages (like form preview)
const FullScreenLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      {children}
      <Toaster richColors position="top-center" />
    </div>
  )
}

// Component to determine which layout to use
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()

  // Define routes that should use full-screen layout
  const fullScreenRoutes = ["/form-preview"]

  const isFullScreen = fullScreenRoutes.some((route) => location.pathname.startsWith(route))

  if (isFullScreen) {
    return <FullScreenLayout>{children}</FullScreenLayout>
  }

  return <MainLayout>{children}</MainLayout>
}

export default function App() {
  const [isLocaleReady, setIsLocaleReady] = useState(false)

  useEffect(() => {
    const loadPreferredLocale = async () => {
      const savedLang = localStorage.getItem("lang") || "en"
      setIsLocaleReady(false)
      try {
        const module = await localeMessages[savedLang]()
        const messages = module.messages || module.default
        i18n.load(savedLang, messages)
        i18n.activate(savedLang)
      } catch (error) {
        console.error(`Failed to load locale ${savedLang}:`, error)
        const fallback = await localeMessages["en"]()
        i18n.load("en", fallback.messages || fallback.default)
        i18n.activate("en")
      } finally {
        // Setup OpenAPI config after language loads
        OpenAPI.BASE = CustomOpenAPIConfig.BASE
        OpenAPI.VERSION = CustomOpenAPIConfig.VERSION
        OpenAPI.TOKEN = CustomOpenAPIConfig.TOKEN
        OpenAPI.WITH_CREDENTIALS = CustomOpenAPIConfig.WITH_CREDENTIALS
        OpenAPI.CREDENTIALS = CustomOpenAPIConfig.CREDENTIALS
        setIsLocaleReady(true)
      }
    }

    loadPreferredLocale()
  }, [])

  if (!isLocaleReady) {
    return <div>Loading translations...</div>
  }

  return (
    <AvatarProvider>
      <I18nProvider i18n={i18n}>
        <ThemeProvider>
          <LayoutWrapper>
            <Routes>
              <Route path="/" element={<FallbackRoot />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/signin" element={<SignInForm />} />
              <Route path="/data" element={<UserTable />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/account" element={<Account />} />
              <Route path="/calendar" element={<Calendar1 />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/chart" element={<OrgChart />} />
              <Route path="/billing" element={<InvoiceForm />} />
              <Route path="/queries" element={<TicketingSystem />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/event" element={<FormTemplatesPage />} />
              <Route path="/formbuilder/:id" element={<FormBuilder />} />
              <Route path="/formbuilder/new" element={<FormBuilder />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/cities" element={<CitiesPage />} />
              <Route path="/sop-list" element={<SopPage />} />
              <Route path="/user" element={<UserManagementPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Full-screen routes */}
              <Route path="/form-preview/:id" element={<FormPreviewPage />} />
            </Routes>
          </LayoutWrapper>
        </ThemeProvider>
      </I18nProvider>
    </AvatarProvider>
  )
}
