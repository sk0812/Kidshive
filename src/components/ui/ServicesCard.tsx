import { LucideIcon } from "lucide-react";

interface ServicesCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function ServicesCard({
  title,
  description,
  icon: Icon,
  className,
}: ServicesCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </div>
  );
}