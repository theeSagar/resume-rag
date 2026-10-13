/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production API origin, e.g. https://resume-rag-api.onrender.com. Unset in dev (proxy is used). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
