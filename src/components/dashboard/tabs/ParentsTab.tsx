"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddUser } from "../AddUser";
import { AddChild } from "../AddChild";
import { Plus, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  allergies: string;
  specialNeeds: string | null;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  children: Child[];
}

interface EditParentFormData {
  name: string;
  email: string;
  phoneNumber: string;
}

export function ParentsTab() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [editFormData, setEditFormData] = useState<EditParentFormData>({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [editSuccess, setEditSuccess] = useState(false);

  const fetchParents = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/parents", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to fetch parents: ${response.status} ${response.statusText}. ${errorData}`
        );
      }

      const data = await response.json();
      setParents(data);
    } catch (error) {
      console.error("Parent fetch error:", error);
      setError(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to fetch parents"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const toggleParentExpanded = (parentId: string) => {
    setExpandedParent(expandedParent === parentId ? null : parentId);
  };

  const handleEditParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccess(false);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/parents/${editingParent?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(editFormData),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Invalid response: ${text}`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update parent");
      }

      setEditSuccess(true);
      setTimeout(() => {
        setEditingParent(null);
        fetchParents();
      }, 1500);
    } catch (error) {
      console.error("Error updating parent:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-4">
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Parent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add New Parent</DialogTitle>
            <AddUser
              defaultRole="PARENT"
              onUserAdded={() => {
                setAddUserOpen(false);
                fetchParents();
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={addChildOpen} onOpenChange={setAddChildOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add New Child</DialogTitle>
            <AddChild
              onChildAdded={() => {
                setAddChildOpen(false);
                fetchParents();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Parents Directory</CardTitle>
            <CardDescription>
              List of all registered parents and their children
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No parents added yet
              </div>
            ) : (
              <div className="grid gap-4">
                {parents.map((parent) => (
                  <div key={parent.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{parent.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {parent.email}
                        </p>
                        {parent.phoneNumber && (
                          <p className="text-sm text-muted-foreground">
                            {parent.phoneNumber}
                          </p>
                        )}
                      </div>
                      <Dialog
                        open={editingParent?.id === parent.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setEditingParent(parent);
                            setEditFormData({
                              name: parent.name,
                              email: parent.email,
                              phoneNumber: parent.phoneNumber || "",
                            });
                          } else {
                            setEditingParent(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Edit Parent Details</DialogTitle>
                          <form
                            onSubmit={handleEditParent}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={editFormData.name}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={editFormData.email}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    email: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phoneNumber">Phone Number</Label>
                              <Input
                                id="phoneNumber"
                                value={editFormData.phoneNumber}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    phoneNumber: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            {editSuccess && (
                              <div className="text-sm text-green-500">
                                Details updated successfully!
                              </div>
                            )}
                            <Button type="submit" className="w-full">
                              Save Changes
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {parent.children.length > 0 && (
                      <div className="grid gap-2">
                        <h4 className="text-sm font-medium">Children</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {parent.children.map((child) => (
                            <Card key={child.id}>
                              <CardContent className="p-3">
                                <p className="font-medium">{child.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Born:{" "}
                                  {new Date(
                                    child.dateOfBirth
                                  ).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
