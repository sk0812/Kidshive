"use client";

import React from "react";
import { AddUser } from "@/components/dashboard/AddUser";

export function UsersTab() {
  const handleUserAdded = () => {
    console.log("User added successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <AddUser defaultRole="USER" onUserAdded={handleUserAdded} />
        {/* Add your user list here */}
        <div className="mt-6">
          <p>User list goes here</p>
        </div>
      </div>
    </div>
  );
}
