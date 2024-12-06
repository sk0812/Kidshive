import { Parent } from "@/types";
import { useState } from "react";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditParentDialogProps {
  parent: Parent;
  onEdit: () => void;
}

export default function EditParentDialog({
  parent,
  onEdit,
}: EditParentDialogProps) {
  const [formData, setFormData] = useState({
    name: parent.name,
    email: parent.email,
    phoneNumber: parent.phoneNumber || "",
    relationship: parent.relationship,
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      let response;
      try {
        response = await fetch(`/api/parents/${parent.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(formData),
        });
      } catch (fetchError) {
        throw new Error("Network error occurred");
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Failed to parse server response");
      }

      if (!response.ok || !data.success) {
        throw new Error(data?.error || "Failed to update parent");
      }

      setSuccess(true);
      setTimeout(() => {
        onEdit();
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update parent"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogTitle>Edit Parent Details</DialogTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
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
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
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
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                phoneNumber: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Select
            value={formData.relationship}
            onValueChange={(value: "MOTHER" | "FATHER" | "GUARDIAN") =>
              setFormData({ ...formData, relationship: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MOTHER">Mother</SelectItem>
              <SelectItem value="FATHER">Father</SelectItem>
              <SelectItem value="GUARDIAN">Guardian</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
        )}
        {success && (
          <div className="text-sm text-green-500">
            Details updated successfully!
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </DialogContent>
  );
}
