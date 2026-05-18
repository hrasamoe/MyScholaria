import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

document.addEventListener("contextmenu", (e) => {
  if ((e.target as HTMLElement).tagName === "IMG") {
    e.preventDefault();
  }
});

const originalFetch = window.fetch;

window.fetch = async function (
  input: RequestInfo | URL,
  init?: RequestInit & { timeout?: number },
) {
  const timeout = init?.timeout || 10000;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await originalFetch(input, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const showSecurityMessage = () => {
  console.log("%c⛔STOP!", "color: red; font-size: 48px; font-weight: bold;");
  console.log(
    "%cThis feature is intended for developers only. Do not paste anything here, as you risk compromising your account and data.",
    "color: red; font-size: 16px;",
  );
  console.log(
    "%cIf someone asked you to paste something here, it is probably a scam attempt.",
    "font-size: 14px; color: orange;",
  );
};

const originalClear = console.clear;
console.clear = function () {
  originalClear();
  showSecurityMessage();
};

showSecurityMessage();

setInterval(() => {
  originalClear();
  showSecurityMessage();
}, 50000);

createRoot(document.getElementById("root")!).render(<App />);
