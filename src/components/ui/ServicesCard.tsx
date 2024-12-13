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
    <div className="group relative overflow-hidden rounded-lg bg-white p-5 md:p-6 lg:p-8 shadow-md transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
        <div className="rounded-full bg-primary/10 p-2 md:p-3 w-fit">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
      </div>
      <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
