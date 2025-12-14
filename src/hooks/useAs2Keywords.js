import { useEffect, useState } from "react";

export function useAs2Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadKeywords() {
      try {
        setLoading(true);
        const basePath = `${import.meta?.env?.BASE_URL ?? "/"}`.replace(
          /\/?$/,
          "/"
        );
        const res = await fetch(`${basePath}as2-keywords.xml`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();

        // Parse XML in browser
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "application/xml");
        const parserError = doc.querySelector("parsererror");
        if (parserError) {
          throw new Error("Failed to parse AS2 keyword XML");
        }

        const keywordNodes = doc.getElementsByTagName("keyword");
        const keywordSet = new Set();

        for (let i = 0; i < keywordNodes.length; i++) {
          const raw = keywordNodes[i].getAttribute("name");
          if (!raw) continue;

          // Normalize: remove double quotes if present, trim whitespace
          const cleaned = raw.replace(/""/g, '"').trim();

          if (cleaned) {
            keywordSet.add(cleaned);
          }
        }

        const list = Array.from(keywordSet).sort((a, b) => a.localeCompare(b));

        if (!cancelled) {
          setKeywords(list);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load AS2 keywords:", err);
        if (!cancelled) {
          setKeywords([]);
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadKeywords();
    return () => {
      cancelled = true;
    };
  }, []);

  return { keywords, loading, error };
}
