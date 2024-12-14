"use client";

import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Users, UserCog, Receipt, Settings, Baby } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Child } from "@/types";

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
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      if (user?.role !== "PARENT") return;

      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await fetch("/api/parents/me/children", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch children");

        const data = await response.json();
        setChildren(data.children || []);
      } catch (error) {
        console.error("Error fetching children:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user]);

  const filteredMenuItems = menuItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="h-full py-4 overflow-y-auto">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Dashboard</h2>
        <nav className="space-y-1">
          {/* Children section for parents */}
          {user?.role === "PARENT" && children.length > 0 && (
            <>
              <div className="mt-6 mb-2 px-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  My Children
                </h3>
              </div>
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onTabChange(`child-${child.id}`)}
                  className={cn(
                    "w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                    activeTab === `child-${child.id}`
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Baby className="mr-2 h-4 w-4" />
                  {child.name}
                </button>
              ))}
            </>
          )}

          {/* Regular menu items */}
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
