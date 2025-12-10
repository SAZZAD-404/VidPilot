import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  text: string;
  platform: string;
  className?: string;
}

const PLATFORM_LIMITS: Record<string, number> = {
  instagram: 2200,
  twitter: 280,
  tiktok: 2200,
  linkedin: 3000,
  youtube: 5000,
  facebook: 63206,
};

export const CharacterCounter = ({ text, platform, className }: CharacterCounterProps) => {
  const limit = PLATFORM_LIMITS[platform] || 2200;
  const count = text.length;
  const percentage = (count / limit) * 100;
  
  const getColor = () => {
    if (percentage >= 100) return "text-destructive";
    if (percentage >= 90) return "text-amber-500";
    if (percentage >= 75) return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              percentage >= 100 ? "bg-destructive" :
              percentage >= 90 ? "bg-amber-500" :
              percentage >= 75 ? "bg-accent" :
              "bg-primary"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      <span className={cn("text-sm font-medium tabular-nums", getColor())}>
        {count} / {limit}
      </span>
    </div>
  );
};
