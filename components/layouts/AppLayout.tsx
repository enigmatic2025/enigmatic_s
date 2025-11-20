import React from "react";
import { Logo } from "@/components/ui/Logo";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-white">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <Logo size="md" variant="light" />
          <span className="text-xl font-bold">Enigmatic</span>
        </div>
        <nav className="p-6 space-y-4">
          <a
            href="/app/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Dashboard
          </a>
          <a
            href="/app/profile"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Profile
          </a>
          <a
            href="/app/settings"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Settings
          </a>
          <a
            href="/logout"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 text-red-400"
          >
            Logout
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
          <div className="text-gray-600">User Profile</div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
