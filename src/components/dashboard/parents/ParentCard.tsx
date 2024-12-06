import { Parent } from "@/types";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditParentDialog from "./EditParentDialog";

interface ParentCardProps {
  parent: Parent;
  onEdit: () => void;
}

export function ParentCard({ parent, onEdit }: ParentCardProps) {
  return (
    <div className="flex justify-between items-start border-l-2 pl-3">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{parent.name}</h4>
          <span className="text-sm text-muted-foreground">
            (
            {parent.relationship
              ? parent.relationship.charAt(0).toUpperCase() +
                parent.relationship.slice(1).toLowerCase()
              : "Unknown"}
            )
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Email: {parent.email}</p>
        {parent.phoneNumber && (
          <p className="text-sm text-muted-foreground">
            Phone Number: {parent.phoneNumber}
          </p>
        )}
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
        </DialogTrigger>
        <EditParentDialog parent={parent} onEdit={onEdit} />
      </Dialog>
    </div>
  );
}
