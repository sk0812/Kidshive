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
import { Plus, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [meals, setMeals] = useState({
    SNACKS: { food: "", quantity: "" },
    LUNCH: { food: "", quantity: "" },
    TEA: { food: "", quantity: "" },
  });
  const [nap, setNap] = useState({ startTime: "", finishTime: "" });
  const [nappyChanges, setNappyChanges] = useState([{ time: "", notes: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!date || !isOpen) return;

      // Reset form state when opening popup
      setCheckIn("");
      setCheckOut("");
      setNotes("");
      setMeals({
        SNACKS: { food: "", quantity: "" },
        LUNCH: { food: "", quantity: "" },
        TEA: { food: "", quantity: "" },
      });
      setNap({ startTime: "", finishTime: "" });
      setNappyChanges([{ time: "", notes: "" }]);

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
          const attendance = data[0];
          setCheckIn(
            attendance.checkIn
              ? format(new Date(attendance.checkIn), "HH:mm")
              : ""
          );
          setCheckOut(
            attendance.checkOut
              ? format(new Date(attendance.checkOut), "HH:mm")
              : ""
          );
          setNotes(attendance.notes || "");

          // Set meals from database
          const mealsData = attendance.meals?.reduce(
            (acc: any, meal: any) => {
              acc[meal.type] = { food: meal.food, quantity: meal.quantity };
              return acc;
            },
            {
              SNACKS: { food: "", quantity: "" },
              LUNCH: { food: "", quantity: "" },
              TEA: { food: "", quantity: "" },
            }
          );
          setMeals(mealsData);

          // Set nap times - Fixed to use naps instead of nap
          if (attendance.naps?.[0]) {
            setNap({
              startTime: format(
                new Date(attendance.naps[0].startTime),
                "HH:mm"
              ),
              finishTime: format(
                new Date(attendance.naps[0].finishTime),
                "HH:mm"
              ),
            });
          } else {
            setNap({ startTime: "", finishTime: "" });
          }

          // Set nappy changes
          if (attendance.nappyChanges?.length > 0) {
            setNappyChanges(
              attendance.nappyChanges.map((change: any) => ({
                time: format(new Date(change.time), "HH:mm"),
                notes: change.notes || "",
              }))
            );
          } else {
            setNappyChanges([{ time: "", notes: "" }]);
          }
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
          meals: Object.fromEntries(
            Object.entries(meals).filter(
              ([_, meal]) => meal.food || meal.quantity
            )
          ),
          nap: nap.startTime || nap.finishTime ? nap : null,
          nappyChanges: nappyChanges.filter(
            (change) => change.time || change.notes
          ),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save attendance");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving attendance:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Daily Record - {format(date, "dd MMMM yyyy")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attendance Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Attendance</h3>
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
          </div>

          {/* Meals Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Meals</h3>
            {Object.entries(meals).map(([type, meal]) => (
              <div key={type} className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${type.toLowerCase()}-food`}>{type}</Label>
                  <Input
                    id={`${type.toLowerCase()}-food`}
                    value={meal.food}
                    onChange={(e) =>
                      setMeals({
                        ...meals,
                        [type]: { ...meal, food: e.target.value },
                      })
                    }
                    placeholder="Enter food eaten"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${type.toLowerCase()}-quantity`}>
                    Quantity
                  </Label>
                  <Select
                    value={meal.quantity}
                    onValueChange={(value) =>
                      setMeals({
                        ...meals,
                        [type]: { ...meal, quantity: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GOOD">Good</SelectItem>
                      <SelectItem value="AVERAGE">Average</SelectItem>
                      <SelectItem value="BELOW_AVERAGE">
                        Below Average
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {/* Nap Times Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Nap Times</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="napStart">Start Time</Label>
                <Input
                  id="napStart"
                  type="time"
                  value={nap.startTime}
                  onChange={(e) =>
                    setNap({ ...nap, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="napFinish">Finish Time</Label>
                <Input
                  id="napFinish"
                  type="time"
                  value={nap.finishTime}
                  onChange={(e) =>
                    setNap({ ...nap, finishTime: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Nappy Changes Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Nappy Changes</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setNappyChanges([...nappyChanges, { time: "", notes: "" }])
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Change
              </Button>
            </div>
            {nappyChanges.map((change, index) => (
              <div key={index} className="grid grid-cols-[1fr,2fr,auto] gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`nappy-time-${index}`}>Time</Label>
                  <Input
                    id={`nappy-time-${index}`}
                    type="time"
                    value={change.time || ""}
                    onChange={(e) => {
                      const newChanges = [...nappyChanges];
                      newChanges[index].time = e.target.value;
                      setNappyChanges(newChanges);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`nappy-notes-${index}`}>Notes</Label>
                  <Input
                    id={`nappy-notes-${index}`}
                    value={change.notes || ""}
                    onChange={(e) => {
                      const newChanges = [...nappyChanges];
                      newChanges[index].notes = e.target.value;
                      setNappyChanges(newChanges);
                    }}
                  />
                </div>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-end"
                    onClick={() => {
                      const newChanges = nappyChanges.filter(
                        (_, i) => i !== index
                      );
                      setNappyChanges(newChanges);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
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
