import { Mail, MapPin, Phone } from "lucide-react";

export function ContactInfo() {
  return (
    <div className="bg-white rounded-lg p-8 shadow-sm space-y-6">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">Address</h3>
            <p className="text-muted-foreground">Northwood, London, HA6 </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Phone className="w-6 h-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">Phone</h3>
            <p className="text-muted-foreground">+44 752 670 5639</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Mail className="w-6 h-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">Email</h3>
            <p className="text-muted-foreground">contact@kidshive.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
