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
import { Plus, Pencil, ChevronRight, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ParentCard } from "../parents/ParentCard";
import { ChildCard } from "../parents/ChildCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Child {
  id: string;
  name: string;
  dob: string;
  allergies: string;
  healthInfo: string;
  medications: string;
  emergencyContact: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  relationship: "MOTHER" | "FATHER" | "GUARDIAN";
  children: Child[];
}

interface EditParentFormData {
  name: string;
  email: string;
  phoneNumber: string;
}

interface EditChildFormData {
  name: string;
  dob: string;
  allergies: string;
  healthInfo: string;
  medications: string;
  emergencyContact: string;
}

function groupParentsByChildren(parents: Parent[]) {
  const groupedParents = new Map<string, Parent[]>();
  const parentsWithNoChildren = new Set(parents);

  // Map children to their parents
  parents.forEach((parent) => {
    parent.children.forEach((child) => {
      const existingGroup = groupedParents.get(child.id) || [];
      groupedParents.set(child.id, [...existingGroup, parent]);
      parentsWithNoChildren.delete(parent);
    });
  });

  return {
    childrenGroups: Array.from(groupedParents.entries()).map(
      ([childId, parents]) => ({
        child: parents[0].children.find((c) => c.id === childId)!,
        parents,
      })
    ),
    parentsWithNoChildren: Array.from(parentsWithNoChildren),
  };
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
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editChildFormData, setEditChildFormData] = useState<EditChildFormData>(
    {
      name: "",
      dob: "",
      allergies: "",
      healthInfo: "",
      medications: "",
      emergencyContact: "",
    }
  );
  const [editChildSuccess, setEditChildSuccess] = useState(false);
  const [deletingParent, setDeletingParent] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

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
          `Failed to fetch data: ${response.status} ${response.statusText}. ${errorData}`
        );
      }

      const data = await response.json();
      setParents(data.parents);
    } catch (error) {
      console.error("Data fetch error:", error);
      setError(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to fetch data"
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

  const handleEditChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditChildSuccess(false);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(`/api/children/${editingChild?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(editChildFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update child");
      }

      setEditChildSuccess(true);
      setTimeout(() => {
        setEditingChild(null);
        fetchParents();
      }, 1500);
    } catch (error) {
      console.error("Error updating child:", error);
    }
  };

  const handleEditSuccess = () => {
    fetchParents();
  };

  const handleChildDeleted = () => {
    fetchParents();
  };

  const handleDeleteParent = async (parentId: string) => {
    try {
      setIsDeleting(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(`/api/parents/${parentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete parent");
      }

      fetchParents(); // Refresh the list
    } catch (error) {
      console.error("Error deleting parent:", error);
    } finally {
      setIsDeleting(false);
      setDeletingParent(null);
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
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Parents Directory</CardTitle>
                <CardDescription>
                  List of all registered parents and their children
                </CardDescription>
              </div>
              <div className="flex space-x-2">
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
            </div>
          </CardHeader>
          <CardContent>
            {parents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No parents added yet
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-4">
                  {groupParentsByChildren(parents).childrenGroups.map(
                    ({ child, parents }) => (
                      <ChildCard
                        key={child.id}
                        child={child}
                        parents={parents}
                        onEdit={handleEditSuccess}
                        onDelete={handleChildDeleted}
                      />
                    )
                  )}
                </div>

                {groupParentsByChildren(parents).parentsWithNoChildren.length >
                  0 && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-4">
                        Parents Without Children
                      </h3>
                      <div className="grid gap-4">
                        {groupParentsByChildren(
                          parents
                        ).parentsWithNoChildren.map((parent) => (
                          <ParentCard
                            key={parent.id}
                            parent={parent}
                            onEdit={handleEditSuccess}
                            onDelete={() => fetchParents()}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={deletingParent !== null}
        onOpenChange={(open) => !open && setDeletingParent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              parent's account from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingParent && handleDeleteParent(deletingParent)
              }
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
