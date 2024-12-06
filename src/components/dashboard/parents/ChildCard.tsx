import { Child, Parent } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ParentCard } from "./ParentCard";

interface ChildCardProps {
  child: Child;
  parents: Parent[];
  onEdit: () => void;
}

export function ChildCard({ child, parents, onEdit }: ChildCardProps) {
  const router = useRouter();

  return (
    <Card key={child.id} className="border rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">{child.name}</h3>
        <p className="text-sm text-muted-foreground">
          Born: {new Date(child.dob).toLocaleDateString("en-GB")}
        </p>
      </div>

      <div className="grid gap-4">
        {parents.map((parent) => (
          <ParentCard key={parent.id} parent={parent} onEdit={onEdit} />
        ))}
      </div>

      <Card
        className="mt-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => router.push(`/dashboard/child/${child.id}`)}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">View Child Details</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Card>
  );
}
