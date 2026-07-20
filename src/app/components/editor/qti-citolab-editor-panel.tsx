import { useEffect, useRef, useState, type ComponentType } from "react";

type EditorProps = {
  editorSessionKey: number;
  sourceXml: string;
  onSourceChange: (nextXml: string) => void;
};

export function QtiCitolabEditorPanel({
  editorSessionKey,
  sourceXml,
  onSourceChange,
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
    return <div className="min-h-[75vh]" aria-hidden />;
  }

  if (!Editor) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center text-sm text-gray-500">
        Loading Citolab editor…
      </div>
    );
  }

  return (
    <Editor
      editorSessionKey={editorSessionKey}
      sourceXml={sourceXml}
      onSourceChange={onSourceChange}
    />
  );
}
