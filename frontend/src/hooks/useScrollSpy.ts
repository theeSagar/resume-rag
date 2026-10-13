import { useEffect, useState } from "react";

/** Id of the section currently crossing the middle band of the viewport (null if none). */
export function useScrollSpy(ids: string[], rootMargin = "-40% 0px -55% 0px"): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Sections currently in the band, oldest first; the newest wins, none means no highlight.
    const visible: string[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          const at = visible.indexOf(id);
          if (at >= 0) visible.splice(at, 1);
          if (entry.isIntersecting) visible.push(id);
        }
        setActive(visible.at(-1) ?? null);
      },
      { rootMargin },
    );
    for (const id of key.split(",")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key, rootMargin]);

  return active;
}
