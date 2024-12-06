"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SignIn from "@/components/Authentication/SignIn";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { ParentsTab } from "../../components/dashboard/tabs/ParentsTab";
import { UsersTab } from "../../components/dashboard/tabs/UsersTab";
import { InvoicesTab } from "../../components/dashboard/tabs/InvoicesTab";
import { SettingsTab } from "../../components/dashboard/tabs/SettingsTab";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("parents");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SignIn />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "parents":
        return <ParentsTab />;
      case "invoices":
        return <InvoicesTab />;
      case "users":
        return <UsersTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - always visible on desktop */}
      <div className="w-64 flex-shrink-0 border-r border-border">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{renderTabContent()}</main>
      </div>
    </div>
  );
}
