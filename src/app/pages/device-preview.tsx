import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  availableDevices,
  PLAYER_DEVICES,
  parsePlayerDevice,
  parsePlayerTheme,
  type PlayerDevice,
} from "../qti/session-options";

const DEVICE_ICONS: Record<PlayerDevice, LucideIcon> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

/**
 * The player on a tablet or a phone, shown on a bigger screen.
 *
 * The player is not shrunk in place: it is this same page, loaded into an
 * iframe the size of the device. Its media queries then answer to the frame,
 * so what shows is what the device would show -- the mobile navigation, the
 * stacked columns -- not a desktop layout squeezed narrow. The iframe shares
 * the origin, so it reads the same package cache and store as this page.
 */
export function DevicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [queryParams, setQueryParams] = useSearchParams();
  const device = parsePlayerDevice(queryParams.get("device"));
  const theme = parsePlayerTheme(queryParams.get("theme"));
  const spec = PLAYER_DEVICES.find((d) => d.value === device)!;
  const [devices] = useState(() => availableDevices(window.innerWidth));

  // The frame loads the test straight away; `device` is left off so the page
  // inside renders the player itself instead of another frame.
  const frameSrc = useMemo(() => {
    const params = new URLSearchParams(queryParams);
    params.delete("device");
    params.set("start", "1");
    return `${location.pathname}?${params.toString()}`;
  }, [location.pathname, queryParams]);

  // Scale the device down when the window is shorter or narrower than it.
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const bezel = 28;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(
        Math.min(
          1,
          (height - 16) / (spec.height + bezel),
          (width - 16) / (spec.width + bezel),
        ),
      );
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [spec.height, spec.width]);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const setDevice = (next: PlayerDevice) => {
    // Start from where the frame is now: its options menu may have changed the
    // layout, mode or theme since it loaded. Same origin, so it can be read.
    let params = new URLSearchParams(queryParams);
    try {
      const frameSearch = frameRef.current?.contentWindow?.location.search;
      if (frameSearch) params = new URLSearchParams(frameSearch);
    } catch {
      // A frame that is not ours (yet): fall back to this page's parameters.
    }
    params.set("start", "1");
    if (next === "desktop") params.delete("device");
    else params.set("device", next);
    setQueryParams(params, { replace: true });
  };

  return (
    <div
      data-player-theme={theme}
      className="fixed inset-0 z-50 flex flex-col bg-gray-100"
    >
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/package")}
          title="Back"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div
          role="radiogroup"
          aria-label="Preview on"
          className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-0.5"
        >
          {devices.map((option) => {
            const Icon = DEVICE_ICONS[option.value];
            const active = option.value === device;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setDevice(option.value)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-citolab-700 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-500 hover:text-gray-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
        <span className="hidden w-32 text-right text-xs text-gray-400 sm:block">
          {spec.width} × {spec.height}
        </span>
      </div>

      <div ref={stageRef} className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2">
        <div
          className="shrink-0 rounded-[2.25rem] bg-gray-900 p-3.5 shadow-2xl ring-1 ring-black/10"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          <iframe
            ref={frameRef}
            key={device}
            title={`${spec.label} preview`}
            src={frameSrc}
            width={spec.width}
            height={spec.height}
            className="block rounded-[1.5rem] bg-white"
          />
        </div>
      </div>
    </div>
  );
}

export default DevicePreview;
