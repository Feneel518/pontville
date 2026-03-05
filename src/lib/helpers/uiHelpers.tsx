import { Badge } from "@/components/ui/badge";
import { Music, Sparkles, Ticket, Utensils } from "lucide-react";

type EventType =
  | "LIVE_MUSIC"
  | "TRIVIA"
  | "SPECIAL"
  | "SPORTS"
  | "FOOD"
  | "OTHER";

export function typeBadge(type: any) {
  switch (type) {
    case "LIVE_MUSIC":
      return (
        <Badge className="gap-1">
          <Music className="h-3.5 w-3.5" /> Live Music
        </Badge>
      );
    case "TRIVIA":
      return (
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3.5 w-3.5" /> Trivia
        </Badge>
      );
    case "SPECIAL":
      return (
        <Badge variant="outline" className="gap-1">
          <Ticket className="h-3.5 w-3.5" /> Special
        </Badge>
      );
    case "SPORTS":
      return <Badge variant="secondary">Sports</Badge>;
    case "FOOD":
      return (
        <Badge variant="secondary">
          <Utensils className="h-3.5 w-3.5" /> Food
        </Badge>
      );
    default:
      return <Badge variant="outline">Event</Badge>;
  }
}
