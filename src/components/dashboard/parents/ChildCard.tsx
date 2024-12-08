import { Child, Parent } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ParentCard } from "./ParentCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { DeleteButton } from "@/components/ui/DeleteButton";

interface ChildCardProps {
  child: Child;
  parents: Parent[];
  onEdit: () => void;
  onDelete: () => void;
}

export function ChildCard({
  child,
  parents,
  onEdit,
  onDelete,
}: ChildCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");

    const response = await fetch(`/api/children/${child.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete child");
    }

    onDelete();
  };

  return (
    <>
      <Card key={child.id} className="border rounded-lg p-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">{child.name}</h3>
            <p className="text-sm text-muted-foreground">
              Born: {new Date(child.dob).toLocaleDateString("en-GB")}
            </p>
          </div>
          <DeleteButton
            onDelete={handleDelete}
            entityName={child.name}
            entityType="child"
          />
        </div>

        <div className="grid gap-4">
          {parents.map((parent) => (
            <ParentCard
              key={parent.id}
              parent={parent}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>

        <Card
          className="mt-4 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => router.push(`/dashboard/child/${child.id}`)}
        >
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">View Child Details</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </Card>
    </>
  );
}
