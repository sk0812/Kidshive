export interface Child {
  id: string;
  name: string;
  dob: string;
  allergies: string;
  specialNeeds: string | null;
  healthInfo: string;
  medications: string;
  emergencyContact: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  relationship: "MOTHER" | "FATHER" | "GUARDIAN";
  children: Child[];
} 