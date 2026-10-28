import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { PageLayout } from "./layout";
import LoadingIndicator from "./components/loading-indicator";
import LandingPage from "./pages/landing";
import { DEFAULT_PLAYER_DEVICE, parsePlayerDevice } from "./qti/session-options";

// Every page except the landing page is loaded on demand. Each one drags in a
// vendor payload that only it needs -- @citolab/qti-convert-local-ai + exceljs +
// pdfjs for the AI converter, @citolab/qti-convert-export + docx + pdf-lib for
// the package modifier, prosekit/prosemirror for the editor -- and bundling them
// into the entry chunk made every visitor download all of it before the landing
// page could paint. The landing page stays static because it is the default
// route: lazy-loading it would only add a round trip.
const UploadPage = lazy(() =>
  import("./pages/upload").then((m) => ({ default: m.UploadPage })),
);
const ConvertPage = lazy(() =>
  import("./pages/convert").then((m) => ({ default: m.ConvertPage })),
);
const EditPage = lazy(() =>
  import("./pages/edit").then((m) => ({ default: m.EditPage })),
);
const PreviewPage = lazy(() =>
  import("./pages/preview").then((m) => ({ default: m.PreviewPage })),
);
const ModifyPackagePage = lazy(() =>
  import("./pages/modify-package").then((m) => ({
    default: m.ModifyPackagePage,
  })),
);
const AiConvertPage = lazy(() =>
  import("./pages/ai-convert").then((m) => ({ default: m.AiConvertPage })),
);
const AssessmentPage = lazy(() =>
  import("./pages/assessment").then((m) => ({ default: m.AssessmentPage })),
);
const ToolsPage = lazy(() =>
  import("./pages/tools").then((m) => ({ default: m.ToolsPage })),
);
const DevicePreview = lazy(() =>
  import("./pages/device-preview").then((m) => ({ default: m.DevicePreview })),
);

/**
 * A tablet or phone preview frames this same route in an iframe (see
 * pages/device-preview.tsx); the page inside the frame is the player itself.
 */
function AssessmentRoute() {
  const [params] = useSearchParams();
  const framed =
    parsePlayerDevice(params.get("device")) !== DEFAULT_PLAYER_DEVICE &&
    window.self === window.top;
  return framed ? <DevicePreview /> : <AssessmentPage />;
}

export function App() {
  // Zustand persist middleware handles state restoration automatically
  return (
    <PageLayout>
      <Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/examples" element={<Navigate to="/assessment-player" replace />} />
          <Route path="/assessment-player" element={<UploadPage />} />
          <Route path="/package" element={<Navigate to="/assessment-player" replace />} />
          <Route path="/player" element={<Navigate to="/assessment-player" replace />} />
          <Route path="/upload" element={<Navigate to="/assessment-player" replace />} />
          <Route path="/convert" element={<ConvertPage />} />
          <Route path="/edit" element={<EditPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/modify" element={<ModifyPackagePage />} />
          <Route path="/ai-convert" element={<AiConvertPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/assessment" element={<AssessmentRoute />} />
          <Route path="/assessment/:assessmentId" element={<AssessmentRoute />} />
          <Route path="/" element={<Navigate to="/landing" />} />
        </Routes>
      </Suspense>
    </PageLayout>
  );
}

export default App;
