import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type AssessmentMode = "candidate" | "scorer";

interface ModeSwitchProps {
  initialMode?: AssessmentMode;
  onCheck?: (mode: AssessmentMode) => void;
}

const ModeSwitch: React.FC<ModeSwitchProps> = ({
  initialMode = "candidate",
  onCheck,
}) => {
  const [mode, setMode] = useState<AssessmentMode>(initialMode);

  const toggleMode = () => {
    const newMode: AssessmentMode =
      mode === "candidate" ? "scorer" : "candidate";
    setMode(newMode);
    if (onCheck) {
      onCheck(newMode);
    }
  };

  useEffect(() => {
    if (onCheck) {
      onCheck(initialMode);
    }
  }, []);

  return (
    <div className="mt-1 flex shrink-0 items-center gap-2 whitespace-nowrap">
      <span
        className={cn(
          "text-sm font-medium",
          mode === "candidate" ? "text-gray-900" : "text-muted-foreground"
        )}
      >
        Candidate<span className="hidden sm:inline"> Mode</span>
      </span>
      <Switch checked={mode === "scorer"} onCheckedChange={toggleMode} />
      <span
        className={cn(
          "text-sm font-medium",
          mode === "scorer" ? "text-gray-900" : "text-muted-foreground"
        )}
      >
        Review<span className="hidden sm:inline"> Mode</span>
      </span>
    </div>
  );
};

export default ModeSwitch;
