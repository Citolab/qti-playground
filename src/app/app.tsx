import { Navigate, Route, Routes } from 'react-router-dom';
import { PageLayout } from './layout';
import { ConvertPage } from './pages/convert';
import { PreviewPage } from './pages/preview';
import { UploadPage } from './pages/upload';
import { UseStoreContext } from './store/store-context';
import { useEffect, useState } from 'react';
import { RestoreStateAction } from './store/store';
import { AssessmentPage } from './pages/assessment';
import { ModifyPackagePage } from './pages/modify-package';
import LoadingIndicator from './components/loading-indicator';
import LandingPage from './pages/landing';

export function App() {
  const { store } = UseStoreContext();
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (!restored) {
      store.dispatch(new RestoreStateAction()).then(() => {
        setRestored(true);
      });
    }

  }, [restored, store]);
  return (
    !restored ? <LoadingIndicator /> :
      <PageLayout>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
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
