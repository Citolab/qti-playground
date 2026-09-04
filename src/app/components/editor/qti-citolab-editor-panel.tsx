import { useEffect, useRef, useState, type ComponentType } from "react";

type EditorProps = {
  editorSessionKey: number;
  sourceXml: string;
  onSourceChange: (nextXml: string) => void;
  /** Where the item lives, so its relative asset paths resolve -- see QtiCitolabEditor's Props. */
  assetBaseHref?: string;
  className?: string;
  /** Mirror the player's own wrapper on this page -- see QtiCitolabEditor's Props. */
  surfaceClassName?: string;
  contentClassName?: string;
  /** Replaces the editor's default frame height -- see QtiCitolabEditor's Props. */
  heightClassName?: string;
  /** Emit the editor's own serialisation once at open -- see QtiCitolabEditor's Props. */
  normalizeOnLoad?: boolean;
};

export function QtiCitolabEditorPanel({
  editorSessionKey,
  sourceXml,
  onSourceChange,
  assetBaseHref,
  className,
  surfaceClassName,
  contentClassName,
  heightClassName = "min-h-[75vh]",
  normalizeOnLoad,
  active,
}: EditorProps & { active: boolean }) {
  const [Editor, setEditor] = useState<ComponentType<EditorProps> | null>(null);
  const loadRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const loadId = ++loadRef.current;
    void import("./qti-citolab-editor").then((mod) => {
      if (loadId === loadRef.current) {
        setEditor(() => mod.QtiCitolabEditor);
      }
    });

    return () => {
      loadRef.current += 1;
      setEditor(null);
    };
  }, [active]);

  if (!active) {
    return <div className={heightClassName} aria-hidden />;
  }

  if (!Editor) {
    // A skeleton rather than a line of text: on the landing hero this placeholder sits above the
    // fold, so it has to hold the editor's shape -- toolbar strip, then body -- instead of
    // collapsing the box and shifting the page when the chunk lands.
    return (
      <div
        className={`flex ${heightClassName} flex-col ${className ?? ""}`}
        role="status"
        aria-label="Loading the QTI editor"
      >
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-7 w-7 animate-pulse rounded bg-gray-100"
            />
          ))}
        </div>
        <div className="min-h-0 flex-1 space-y-3 bg-white p-4">
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-2/5 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <Editor
      editorSessionKey={editorSessionKey}
      sourceXml={sourceXml}
      onSourceChange={onSourceChange}
      assetBaseHref={assetBaseHref}
      className={className}
      surfaceClassName={surfaceClassName}
      contentClassName={contentClassName}
      heightClassName={heightClassName}
      normalizeOnLoad={normalizeOnLoad}
    />
  );
}
