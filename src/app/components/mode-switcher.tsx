import React, { useState, useEffect } from "react";

/**
 * Type for the assessment mode
 */
type AssessmentMode = "candidate" | "scorer";

/**
 * Props interface for the ModeSwitch component
 */
interface ModeSwitchProps {
  /** Initial mode state */
  initialMode?: AssessmentMode;
  /** Callback function that receives current mode when it changes */
  onCheck?: (mode: AssessmentMode) => void;
}

/**
 * ModeSwitch component that toggles between candidate and review modes
 */
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

  // Call onCheck with initial mode on mount
  useEffect(() => {
    if (onCheck) {
      onCheck(initialMode);
    }
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 mt-1">
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium ${mode === "candidate" ? "text-gray-900" : "text-gray-500"}`}
        >
          Candidate Mode
        </span>

        <button
          onClick={toggleMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            mode === "scorer" ? "bg-[#00A748]" : "bg-gray-200"
          } focus:ring-[#00A748]`}
          role="switch"
          aria-checked={mode === "scorer"}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              mode === "scorer" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>

        <span
          className={`text-sm font-medium ${mode === "scorer" ? "text-gray-900" : "text-gray-500"}`}
        >
          Review Mode
        </span>
      </div>
    </div>
  );
};

export default ModeSwitch;
