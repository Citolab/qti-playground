import { Navigate, Route, Routes } from "react-router-dom";
import { PageLayout } from "./layout";
import { ConvertPage } from "./pages/convert";
import { PreviewPage } from "./pages/preview";
import { UploadPage } from "./pages/upload";
import { AssessmentPage } from "./pages/assessment";
import { ModifyPackagePage } from "./pages/modify-package";
import LandingPage from "./pages/landing";

export function App() {
  // Zustand persist middleware handles state restoration automatically
  return (
    <PageLayout>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/package" element={<UploadPage />} />
        <Route path="/upload" element={<Navigate to="/package" replace />} />
        <Route path="/convert" element={<ConvertPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/modify" element={<ModifyPackagePage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/assessment/:assessmentId" element={<AssessmentPage />} />
        <Route path="/" element={<Navigate to="/landing" />} />
      </Routes>
    </PageLayout>
  );
}

export default App;
