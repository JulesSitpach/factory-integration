import { ReactNode } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { usePathname } from "next/navigation";
import { getTranslation } from "../../../lib/i18n";

interface DashboardLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: DashboardLayoutProps) {
  const { t } = await getTranslation(locale, "common");
  return {
    title: `${t("common.appName")} - ${t("common.navigation.dashboard")}`,
  };
}

export default function DashboardLayout({
  children,
  params: { locale },
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavigation locale={locale} />
      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="bg-white shadow-inner">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            {locale === "es" ? "© 2025 Integración de Fábrica. Todos los derechos reservados." : "© 2025 Factory Integration. All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}

function DashboardNavigation({ locale }: { locale: string }) {
  const pathname = usePathname();
  
  // Client component for translations
  return (
    <ClientNav locale={locale} pathname={pathname} />
  );
}

"use client";

import { useTranslation } from "next-i18next";

function ClientNav({ locale, pathname }: { locale: string; pathname: string }) {
  const { t } = useTranslation("common");
  
  const navigation = [
    { name: t("navigation.dashboard"), href: `/${locale}/dashboard`, current: pathname === `/${locale}/dashboard` },
    { name: t("navigation.calculator"), href: `/${locale}/dashboard/calculator`, current: pathname.includes(`/${locale}/dashboard/calculator`) },
  ];
  
  const userNavigation = [
    { name: t("navigation.profile"), href: `/${locale}/dashboard/profile` },
    { name: t("navigation.settings"), href: `/${locale}/dashboard/settings` },
    { name: t("auth.signOut"), href: `/api/auth/signout` },
  ];
  
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={`/${locale}`}>
                <span className="text-xl font-bold text-indigo-600">{t("common.appName")}</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 font-medium">U</span>
                  </div>
                </button>
              </div>
              {/* Dropdown menu, show/hide based on menu state */}
              {/* Dropdown menu content would go here */}
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu icon */}
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                item.current
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
              )}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-800 font-medium">U</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">User</div>
              <div className="text-sm font-medium text-gray-500">user@example.com</div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {userNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
