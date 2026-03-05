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
    <div className="flex items-center gap-2 mt-1">
      <span
        className={cn(
          "text-sm font-medium",
          mode === "candidate" ? "text-gray-900" : "text-muted-foreground"
        )}
      >
        Candidate Mode
      </span>
      <Switch checked={mode === "scorer"} onCheckedChange={toggleMode} />
      <span
        className={cn(
          "text-sm font-medium",
          mode === "scorer" ? "text-gray-900" : "text-muted-foreground"
        )}
      >
        Review Mode
      </span>
    </div>
  );
};

export default ModeSwitch;
