import { Parent } from "@/types";
import { Card } from "@/components/ui/CardUI";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { supabase } from "@/lib/supabase";

interface ParentCardProps {
  parent: Parent;
  onEdit: () => void;
  onDelete: () => void;
}

export function ParentCard({ parent, onEdit, onDelete }: ParentCardProps) {
  const handleDelete = async () => {
    try {
      console.log("Starting delete process for parent:", parent.id);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No session or access token found");
        throw new Error("Not authenticated");
      }

      console.log(
        "Auth token (first 10 chars):",
        session.access_token.substring(0, 10) + "..."
      );

      const response = await fetch(`/api/parents/${parent.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response.status);
      const data = await response.json();
      console.log("Delete response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete parent");
      }

      onDelete();
    } catch (error) {
      console.error("Delete error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to delete parent";
      throw new Error(message);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{parent.name}</h4>
          <p className="text-sm text-muted-foreground">{parent.email}</p>
          {parent.phoneNumber && (
            <p className="text-sm text-muted-foreground">
              {parent.phoneNumber}
            </p>
          )}
          <p className="text-sm text-muted-foreground capitalize">
            {parent.relationship.toLowerCase()}
          </p>
        </div>
        <DeleteButton
          onDelete={handleDelete}
          entityName={parent.name}
          entityType="parent"
        />
      </div>
    </Card>
  );
}
