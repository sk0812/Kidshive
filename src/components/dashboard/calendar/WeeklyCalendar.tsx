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
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  startOfWeek,
  addWeeks,
  isSameMonth,
  addDays,
} from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DailyRecordPopup } from "./DailyRecordPopup";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Attendance {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  notes: string | null;
}

interface WeeklyCalendarProps {
  childId: string;
}

export function WeeklyCalendar({ childId }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [monthlyAttendance, setMonthlyAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getWeeks = (start: Date, end: Date) => {
    const firstWeekStart = startOfWeek(start, { weekStartsOn: 1 });
    const weeks: { weekStart: Date; days: Date[] }[] = [];
    let currentWeekStart = firstWeekStart;

    while (currentWeekStart <= end) {
      const weekDays = Array.from({ length: 7 }, (_, i) =>
        addDays(currentWeekStart, i)
      );

      if (weekDays.some((day) => isSameMonth(day, currentDate))) {
        weeks.push({
          weekStart: currentWeekStart,
          days: weekDays,
        });
      }

      currentWeekStart = addWeeks(currentWeekStart, 1);
    }

    return weeks;
  };

  const weeks = getWeeks(monthStart, monthEnd);

  const fetchMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(
        `/api/children/${childId}/attendance?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch attendance");

      const data = await response.json();
      setMonthlyAttendance(data);
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [childId, currentDate]);

  const getAttendanceForDate = (date: Date) => {
    return monthlyAttendance.find(
      (a) =>
        format(new Date(a.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isSameMonth(date, currentDate)) {
      setSelectedDate(date);
      setIsPopupOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="text-center border-r bg-muted/50 w-[140px] font-bold">
                Week Beginning
              </TableHead>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                (day, index) => (
                  <TableHead
                    key={day}
                    className={cn(
                      "text-center border-b",
                      index < 4 && "border-r",
                      "w-[160px]",
                      "bg-muted/30",
                      "font-bold"
                    )}
                    colSpan={2}
                  >
                    {day}
                  </TableHead>
                )
              )}
            </TableRow>
            <TableRow>
              <TableHead className="border-r bg-muted/50" />
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                (day, dayIndex) => (
                  <React.Fragment key={day}>
                    <TableHead
                      className={cn(
                        "text-center text-xs h-8",
                        "border-r",
                        "w-[80px]",
                        "bg-muted/20",
                        "font-semibold"
                      )}
                    >
                      In
                    </TableHead>
                    <TableHead
                      className={cn(
                        "text-center text-xs h-8",
                        dayIndex < 4 && "border-r",
                        "w-[80px]",
                        "bg-muted/20",
                        "font-semibold"
                      )}
                    >
                      Out
                    </TableHead>
                  </React.Fragment>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.map(({ weekStart, days }, weekIndex) => (
              <TableRow
                key={weekStart.toString()}
                className={weekIndex < weeks.length - 1 ? "border-b" : ""}
              >
                <TableCell className="font-medium text-center border-r bg-muted/50">
                  {format(weekStart, "MMM d")}
                </TableCell>
                {days
                  .filter((date) => date.getDay() !== 0 && date.getDay() !== 6)
                  .map((date, dayIndex) => {
                    const attendance = getAttendanceForDate(date);
                    const isCurrentMonth = isSameMonth(date, currentDate);

                    return (
                      <TableCell
                        key={date.toString()}
                        className={cn(
                          "relative text-center cursor-pointer hover:bg-muted/50 h-12 p-4 align-middle",
                          dayIndex < 4 && "border-r",
                          !isCurrentMonth &&
                            "text-muted-foreground bg-muted/10",
                          "w-[160px]"
                        )}
                        colSpan={2}
                        onClick={() => isCurrentMonth && handleDateClick(date)}
                      >
                        <div className="flex justify-center items-center h-full">
                          <div className="flex-1 text-center">
                            {attendance?.checkIn &&
                              format(new Date(attendance.checkIn), "HH:mm")}
                          </div>
                          <div className="w-px h-full bg-border absolute left-1/2" />
                          <div className="flex-1 text-center">
                            {attendance?.checkOut &&
                              format(new Date(attendance.checkOut), "HH:mm")}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DailyRecordPopup
        childId={childId}
        date={selectedDate}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSave={fetchMonthlyAttendance}
      />
    </div>
  );
}
