"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Heart,
  Phone,
  Mail,
  User,
  AlertCircle,
  Pill,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChildDetails {
  id: string;
  name: string;
  dob: string;
  allergies: string | null;
  specialNeeds: string | null;
  healthInfo: string | null;
  medications: string | null;
  emergencyContact: string | null;
  parents: {
    id: string;
    relationship: string;
    user: {
      name: string;
      email: string;
      phoneNumber: string | null;
    };
  }[];
}

export default function ChildDetailsPage() {
  const params = useParams();
  const [child, setChild] = useState<ChildDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchChildDetails = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("Not authenticated");

        const response = await fetch(`/api/children/${params.id}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch child details");

        const data = await response.json();
        setChild(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChildDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !child) {
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card p-6 space-y-6">
        {child && (
          <>
            <Button
              variant="ghost"
              className="mb-4 -ml-2"
              onClick={() => router.back()}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Parents
            </Button>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{child.name}</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Born: {new Date(child.dob).toLocaleDateString("en-GB")}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical Information</h3>

              {!child.allergies &&
              !child.medications &&
              !child.specialNeeds &&
              !child.healthInfo ? (
                <p className="text-sm text-muted-foreground">
                  No medical information available
                </p>
              ) : (
                <>
                  {child.allergies && (
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 mt-1 text-red-500" />
                      <div>
                        <p className="font-medium">Allergies</p>
                        <p className="text-sm text-muted-foreground">
                          {child.allergies}
                        </p>
                      </div>
                    </div>
                  )}

                  {child.medications && (
                    <div className="flex items-start space-x-2">
                      <Pill className="h-4 w-4 mt-1" />
                      <div>
                        <p className="font-medium">Medications</p>
                        <p className="text-sm text-muted-foreground">
                          {child.medications}
                        </p>
                      </div>
                    </div>
                  )}

                  {child.specialNeeds && (
                    <div className="flex items-start space-x-2">
                      <Heart className="h-4 w-4 mt-1" />
                      <div>
                        <p className="font-medium">Special Needs</p>
                        <p className="text-sm text-muted-foreground">
                          {child.specialNeeds}
                        </p>
                      </div>
                    </div>
                  )}

                  {child.healthInfo && (
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 mt-1" />
                      <div>
                        <p className="font-medium">Health Information</p>
                        <p className="text-sm text-muted-foreground">
                          {child.healthInfo}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Parent Information</h3>
              <div className="space-y-4">
                {child.parents.map((parent) => (
                  <div key={parent.id} className="space-y-2 border-l-2 pl-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{parent.user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({parent.relationship.toLowerCase()})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{parent.user.email}</span>
                    </div>
                    {parent.user.phoneNumber && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{parent.user.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {child.emergencyContact && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <p className="text-sm text-muted-foreground">
                    {child.emergencyContact}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              Track attendance, sleep times, meals, and daily notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              height="700px"
              slotMinTime="07:00:00"
              slotMaxTime="18:00:00"
              allDaySlot={false}
              slotDuration="00:30:00"
              weekends={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              events={[]}
              select={(info: DateSelectArg) => {
                console.log("Selected:", info);
                // We'll handle event creation later
              }}
              eventClick={(info: EventClickArg) => {
                console.log("Event clicked:", info);
                // We'll handle event viewing/editing later
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
