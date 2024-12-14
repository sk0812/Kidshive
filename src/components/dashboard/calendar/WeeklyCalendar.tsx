"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { startOfWeek, addDays, format, addWeeks } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DailyRecordPopup } from "./DailyRecordPopup";

interface DailyRecord {
  checkIn: string | null;
  checkOut: string | null;
}

export function WeeklyCalendar() {
  const [records, setRecords] = useState<Record<string, DailyRecord>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState<{
    date: Date;
  } | null>(null);

  // Generate 4 weeks starting from current week
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const weekStart = startOfWeek(addWeeks(currentDate, i), {
      weekStartsOn: 1,
    });
    return {
      weekBeginning: weekStart,
      days: Array.from({ length: 5 }, (_, j) => addDays(weekStart, j)),
    };
  });

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => addWeeks(prev, -4));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addWeeks(prev, 4));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="w-[200px] align-bottom">
                Week Beginning
              </TableHead>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                (day) => (
                  <TableHead key={day} className="text-center border-l">
                    {day}
                  </TableHead>
                )
              )}
            </TableRow>
            <TableRow>
              {Array.from({ length: 5 }, (_, i) => (
                <TableHead key={i} className="text-center border-l">
                  <div className="flex">
                    <div className="flex-1">In</div>
                    <div className="flex-1 border-l">Out</div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.map((week) => (
              <TableRow key={week.weekBeginning.toISOString()}>
                <TableCell className="font-medium">
                  {format(week.weekBeginning, "dd MMM yyyy")}
                </TableCell>
                {week.days.map((day) => (
                  <TableCell
                    key={day.toISOString()}
                    className="h-[100px] p-0 border-l hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => setSelectedCell({ date: day })}
                  >
                    <div className="flex h-full">
                      <div className="flex-1 p-4">
                        <div className="hidden mb-2">{format(day, "d")}</div>
                        09:00
                      </div>
                      <div className="flex-1 p-4 border-l">16:00</div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DailyRecordPopup
        date={selectedCell?.date ?? null}
        isOpen={selectedCell !== null}
        onClose={() => setSelectedCell(null)}
      />
    </div>
  );
}
