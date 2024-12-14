export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HOLIDAY'; 

export type DailyRecord = {
  childId: string;
  date: Date;
  status: AttendanceStatus;
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
}; 