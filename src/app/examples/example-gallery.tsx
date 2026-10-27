import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { EXAMPLE_PACKAGES } from "./catalog";
import { ExampleCard, ExampleRow } from "./example-card";
import { useOpenExample } from "./use-open-example";

export function ExampleGallery({
  variant = "cards",
  className,
}: {
  /** `compact` cards for the landing page, `rows` for a narrow column. */
  variant?: "cards" | "compact" | "rows";
  className?: string;
}) {
  const { openExample, loadingId, error } = useOpenExample();

  return (
    <div className={className}>
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div
        className={cn(
          "grid",
          variant === "rows" ? "gap-3" : "gap-6 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {EXAMPLE_PACKAGES.map((example) => {
          const props = {
            example,
            loading: loadingId === example.id,
            disabled: loadingId !== null,
            onOpen: (target: "play" | "browse") =>
              void openExample(example.id, target),
          };
          return variant === "rows" ? (
            <ExampleRow key={example.id} {...props} />
          ) : (
            <ExampleCard
              key={example.id}
              {...props}
              compact={variant === "compact"}
            />
          );
        })}
      </div>
    </div>
  );
}
