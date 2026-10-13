import { profile } from "../data/profile";

export function Footer() {
  return (
    <footer className="no-print">
      <div className="mx-auto max-w-[760px] px-5 sm:px-8">
        <div className="flex flex-col gap-1 border-t border-line py-8 text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p>Built with React, FastAPI, pgvector and Llama 3.3</p>
        </div>
      </div>
    </footer>
  );
}
