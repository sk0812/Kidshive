"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/CardUI";
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
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { WeeklyCalendar } from "@/components/dashboard/calendar/WeeklyCalendar";
import { useAuth } from "@/contexts/AuthContext";

interface ChildDetails {
  id: string;
  name: string;
  dob: string;
  allergies: string | null;
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
  const [activeTab, setActiveTab] = useState("calendar");
  const [editingChild, setEditingChild] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    dob: "",
    allergies: "",
    healthInfo: "",
    medications: "",
    emergencyContact: "",
  });
  const { user } = useAuth();

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

  useEffect(() => {
    fetchChildDetails();
  }, [params.id]);

  const handleEditChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccess(false);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(`/api/children/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update child");
      }

      setEditSuccess(true);
      setTimeout(() => {
        setEditingChild(false);
        // Refetch child details
        fetchChildDetails();
      }, 1500);
    } catch (error) {
      console.error("Error updating child:", error);
    }
  };

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
              Back to Dashboard
            </Button>

            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{child.name}</h2>
                {user?.role !== "PARENT" && (
                  <Dialog
                    open={editingChild}
                    onOpenChange={(open) => {
                      if (open) {
                        setEditFormData({
                          name: child.name,
                          dob: new Date(child.dob).toISOString().split("T")[0],
                          allergies: child.allergies || "",
                          healthInfo: child.healthInfo || "",
                          medications: child.medications || "",
                          emergencyContact: child.emergencyContact || "",
                        });
                      }
                      setEditingChild(open);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Child
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Edit Child Details</DialogTitle>
                      <form onSubmit={handleEditChild} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={editFormData.name}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            id="dob"
                            name="dob"
                            type="date"
                            value={editFormData.dob}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                dob: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="allergies">Allergies</Label>
                          <Input
                            id="allergies"
                            name="allergies"
                            value={editFormData.allergies}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                allergies: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="healthInfo">Health Information</Label>
                          <Input
                            id="healthInfo"
                            name="healthInfo"
                            value={editFormData.healthInfo}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                healthInfo: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="medications">Medications</Label>
                          <Input
                            id="medications"
                            name="medications"
                            value={editFormData.medications}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                medications: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">
                            Emergency Contact
                          </Label>
                          <Input
                            id="emergencyContact"
                            name="emergencyContact"
                            value={editFormData.emergencyContact}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                emergencyContact: e.target.value,
                              })
                            }
                          />
                        </div>
                        {editSuccess && (
                          <div className="text-sm text-green-500">
                            Child details updated successfully!
                          </div>
                        )}
                        <Button type="submit" className="w-full">
                          Save Changes
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Born: {new Date(child.dob).toLocaleDateString("en-GB")}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                variant={activeTab === "calendar" ? "default" : "outline"}
                onClick={() => setActiveTab("calendar")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={activeTab === "consent-forms" ? "default" : "outline"}
                onClick={() => setActiveTab("consent-forms")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Consent Forms
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical Information</h3>

              {!child.allergies && !child.medications && !child.healthInfo ? (
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
        {activeTab === "calendar" && (
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                View and manage child's schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyCalendar
                childId={params.id as string}
                readOnly={user?.role === "PARENT"}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "consent-forms" && (
          <Card>
            <CardHeader>
              <CardTitle>Consent Forms</CardTitle>
              <CardDescription>
                This is where the consent forms content will go.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[700px] flex items-center justify-center text-muted-foreground">
                Consent forms content coming soon...
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
