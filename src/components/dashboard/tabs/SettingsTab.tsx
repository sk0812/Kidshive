"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export function SettingsTab() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Name</label>
            <p className="mt-1">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <p className="mt-1">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
