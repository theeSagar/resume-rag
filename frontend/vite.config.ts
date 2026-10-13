import type { ServerResponse } from "node:http";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Dev only: the browser talks to :5173, Vite forwards to FastAPI on :8000,
      // so the backend needs no CORS configuration.
      "/api": {
        // 127.0.0.1, not "localhost": Node resolves localhost to IPv6 (::1) first,
        // but uvicorn listens on IPv4 127.0.0.1 by default.
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy) => {
          // Backend not running → answer 502 so the UI shows "Can't reach the assistant".
          proxy.on("error", (_err, _req, res) => {
            const response = res as ServerResponse;
            if (typeof response.writeHead === "function" && !response.headersSent) {
              response.writeHead(502, { "Content-Type": "application/json" });
            }
            response.end?.(JSON.stringify({ detail: "Backend unreachable" }));
          });
        },
      },
    },
  },
});
