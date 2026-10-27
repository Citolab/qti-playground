import { BookOpenText, MonitorPlay } from "lucide-react";
import { AssessmentLayoutMode } from "../qti/layout-mode";

/** The icon each layout is recognised by, here and on the intro screen. */
export const LayoutModeIcon = ({
  mode,
  className,
}: {
  mode: AssessmentLayoutMode;
  className?: string;
}) => {
  const Icon = mode === "vertical" ? BookOpenText : MonitorPlay;
  return <Icon className={className} />;
};
