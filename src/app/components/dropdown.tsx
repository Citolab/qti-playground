import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  name: string;
  items: {
    name: string;
    items: { name: string; href: string; current: boolean }[];
  }[];
  onMenuClick: (name: string) => void;
}

export function Dropdown({ items, name, onMenuClick }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          {name}
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {items.map((group, groupIndex) => (
          <div key={group.name}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            {group.items.map((item) => (
              <DropdownMenuItem
                key={item.name}
                onClick={() => onMenuClick(item.name)}
              >
                {item.name}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
