"use client";

import React from "react";
import { AddUser } from "../AddUser";

export function UsersTab() {
  return (
    <div className="space-y-6">
      <div className="max-w-4xl">
        <div className="bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <AddUser />
          {/* Add your user list here */}
          <div className="mt-6">
            <p>User list goes here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
