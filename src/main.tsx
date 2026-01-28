import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import * as ReactDOM from "react-dom/client";
import "@citolab/qti-components";
import "./app/dep-tools-register";

import App from "./app/app";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
