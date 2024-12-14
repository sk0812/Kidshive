"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";

interface DailyRecordPopupProps {
  childId: string;
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function DailyRecordPopup({
  childId,
  date,
  isOpen,
  onClose,
  onSave,
}: DailyRecordPopupProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!date || !isOpen) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("Not authenticated");

        const response = await fetch(
          `/api/children/${childId}/attendance?startDate=${date.toISOString()}&endDate=${date.toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch attendance");

        const data = await response.json();
        if (data.length > 0) {
          setCheckIn(
            data[0].checkIn ? format(new Date(data[0].checkIn), "HH:mm") : ""
          );
          setCheckOut(
            data[0].checkOut ? format(new Date(data[0].checkOut), "HH:mm") : ""
          );
          setNotes(data[0].notes || "");
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [childId, date, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const formattedDate = format(date, "yyyy-MM-dd");
      const checkInDateTime = checkIn ? `${formattedDate}T${checkIn}:00` : null;
      const checkOutDateTime = checkOut
        ? `${formattedDate}T${checkOut}:00`
        : null;

      const response = await fetch(`/api/children/${childId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          date: formattedDate,
          checkIn: checkInDateTime,
          checkOut: checkOutDateTime,
          notes,
        }),
      });

      if (!response.ok) throw new Error("Failed to save attendance");

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving attendance:", error);
      setError("Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Daily Record - {format(date, "dd MMMM yyyy")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check In Time</Label>
              <Input
                id="checkIn"
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check Out Time</Label>
              <Input
                id="checkOut"
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about today..."
            />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
