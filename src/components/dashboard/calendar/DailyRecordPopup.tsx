"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface DailyRecordPopupProps {
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DailyRecordPopup({
  date,
  isOpen,
  onClose,
}: DailyRecordPopupProps) {
  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Daily Record - {format(date, "dd MMMM yyyy")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Check In</h4>
              <p>9:00 AM</p>
            </div>
            <div>
              <h4 className="font-medium">Check Out</h4>
              <p>5:00 PM</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium">Notes</h4>
            <p>Child had a great day today!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
