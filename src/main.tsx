import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import "@citolab/qti-components/qti-components";
import "@citolab/qti-components/qti-test/core";
import "@citolab/qti-components/qti-test/components/test-navigation";
import "@citolab/qti-components/qti-test/components/test-container";
import "@citolab/qti-components/qti-test/components/test-next";
import "@citolab/qti-components/qti-test/components/test-prev";
import "@citolab/qti-components/qti-test/components/test-show-correct-response";
import "@citolab/qti-components/qti-test/components/test-end-attempt";
import "@citolab/qti-components/qti-test/components/test-paging-buttons-stamp";
import "@citolab/qti-components/qti-test/components/test-item-link";
import "@citolab/qti-components/qti-test/components/test-view";
import "@citolab/qti-components/qti-test/components/test-print-item-variables";
import "@citolab/qti-components/qti-test/components/test-print-context";

import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
