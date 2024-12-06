"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Users, UserCog, Receipt, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

type Tab = {
  title: string;
  icon: any;
  id: string;
  roles: string[];
};

const menuItems: Tab[] = [
  {
    title: "Parents",
    icon: Users,
    id: "parents",
    roles: ["ADMIN", "ASSISTANT"],
  },
  {
    title: "Invoices",
    icon: Receipt,
    id: "invoices",
    roles: ["ADMIN", "PARENT"],
  },
  {
    title: "User Management",
    icon: UserCog,
    id: "users",
    roles: ["ADMIN"],
  },
  {
    title: "Settings",
    icon: Settings,
    id: "settings",
    roles: ["ADMIN", "ASSISTANT", "PARENT"],
  },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="h-full py-4 overflow-y-auto">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Dashboard</h2>
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                activeTab === item.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
