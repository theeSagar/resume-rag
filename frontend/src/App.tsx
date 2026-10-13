import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { SiteNav } from "./components/layout/SiteNav";
import { useChat } from "./hooks/useChat";
import { useHealth } from "./hooks/useHealth";
import { PreferencesProvider } from "./hooks/usePreferences";
import { ChatPage } from "./pages/ChatPage";
import { HomePage } from "./pages/HomePage";

/** Routes + app-wide state. Chat state lives here so a pending answer survives switching pages. */
export function AppShell() {
  const chat = useChat();
  const health = useHealth();
  const { pathname, hash } = useLocation();

  // A hash (e.g. from the /resume redirect) jumps to that section; other pages start at the top.
  // /chat manages its own position (MessageList scrolls to the latest answer), so it is left alone.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView?.();
      return;
    }
    if (pathname !== "/chat") window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-dvh flex-col">
      {pathname !== "/chat" && <SiteNav />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage chat={chat} health={health} />} />
        <Route path="/resume" element={<Navigate to={{ pathname: "/", hash: "#experience" }} replace />} />
        <Route path="/about" element={<Navigate to={{ pathname: "/", hash: "#about-site" }} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </PreferencesProvider>
  );
}
