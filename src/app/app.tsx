import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageLayout } from "./layout";
import LoadingIndicator from "./components/loading-indicator";
import LandingPage from "./pages/landing";

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

export function App() {
  // Zustand persist middleware handles state restoration automatically
  return (
    <PageLayout>
      <Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/package" element={<UploadPage />} />
          <Route path="/upload" element={<Navigate to="/package" replace />} />
          <Route path="/convert" element={<ConvertPage />} />
          <Route path="/edit" element={<EditPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/modify" element={<ModifyPackagePage />} />
          <Route path="/ai-convert" element={<AiConvertPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/assessment/:assessmentId" element={<AssessmentPage />} />
          <Route path="/" element={<Navigate to="/landing" />} />
        </Routes>
      </Suspense>
    </PageLayout>
  );
}

export default App;
