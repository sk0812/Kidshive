"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

interface AddChildProps {
  onChildAdded?: () => void;
}

export function AddChild({ onChildAdded }: AddChildProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [parents, setParents] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    allergies: "",
    specialNeeds: "",
    parentId: "",
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
        setParents(data);
      } catch (error) {
        console.error("Error fetching parents:", error);
      }
    };

    fetchParents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to add child");
      }

      setSuccess(true);
      setFormData({
        name: "",
        dob: "",
        allergies: "",
        specialNeeds: "",
        parentId: "",
      });

      onChildAdded?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add child");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Child</CardTitle>
        <CardDescription>Add a child to a parent's account</CardDescription>
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
            <Label htmlFor="specialNeeds">Special Needs</Label>
            <Input
              id="specialNeeds"
              value={formData.specialNeeds}
              onChange={(e) =>
                setFormData({ ...formData, specialNeeds: e.target.value })
              }
              placeholder="Any special needs or requirements (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent</Label>
            <Select
              value={formData.parentId}
              onValueChange={(value) =>
                setFormData({ ...formData, parentId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent" />
              </SelectTrigger>
              <SelectContent>
                {parents.map((parent) => (
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
