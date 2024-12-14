"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/CardUI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Parent } from "@/types";

interface AddChildProps {
  onChildAdded?: () => void;
}

export function AddChild({ onChildAdded }: AddChildProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    allergies: "",
  });

  // Fetch parents when component mounts
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await fetch("/api/parents", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch parents");

        const data = await response.json();

        // Make sure we're setting the parents array from the response
        if (data.success && Array.isArray(data.parents)) {
          setParents(data.parents);
        } else {
          console.error("Unexpected parents data format:", data);
          setParents([]);
        }
      } catch (error) {
        console.error("Error fetching parents:", error);
        setParents([]);
      }
    };

    fetchParents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParents.length === 0) {
      setError("Please select at least one parent");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          parentIds: selectedParents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add child");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to add child");
      }

      setSuccess(true);
      setFormData({
        name: "",
        dob: "",
        allergies: "",
      });
      setSelectedParents([]);

      onChildAdded?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add child");
    } finally {
      setLoading(false);
    }
  };

  const removeParent = (parentId: string) => {
    setSelectedParents((prev) => prev.filter((id) => id !== parentId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Child</CardTitle>
        <CardDescription>Add a child to parent accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Child's Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) =>
                setFormData({ ...formData, dob: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
              placeholder="List any allergies (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Parents</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedParents.map((parentId) => {
                const parent = parents.find((p) => p.id === parentId);
                return (
                  <Badge key={parentId} variant="secondary">
                    {parent?.name}
                    <button
                      type="button"
                      onClick={() => removeParent(parentId)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <Select
              onValueChange={(value) => {
                if (!selectedParents.includes(value)) {
                  setSelectedParents((prev) => [...prev, value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(parents) &&
                  parents
                    .filter((parent) => !selectedParents.includes(parent.id))
                    .map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-500">
              Child added successfully!
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Child"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
