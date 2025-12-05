import { useEffect, useMemo, useState } from "react";
import { useAs2Keywords } from "../hooks/useAs2Keywords";

export default function AutocompleteEditor() {
  const { keywords, loading, error } = useAs2Keywords();

  const [value, setValue] = useState("");
  const [caretPos, setCaretPos] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extract current word before caret
  const currentWord = useMemo(() => {
    const slice = value.slice(0, caretPos);
    const match = slice.match(/([A-Za-z0-9_.]+)$/); // last "word-ish" token
    return match ? match[1] : "";
  }, [value, caretPos]);

  const suggestions = useMemo(() => {
    if (!currentWord || !keywords.length) return [];
    const lower = currentWord.toLowerCase();

    // Starts-with first, then includes
    const startsWith = [];
    const contains = [];

    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      if (kwLower.startsWith(lower)) {
        startsWith.push(kw);
      } else if (kwLower.includes(lower)) {
        contains.push(kw);
      }
    }

    return [...startsWith, ...contains].slice(0, 12);
  }, [currentWord, keywords]);

  useEffect(() => {
    if (suggestions.length > 0) {
      setActiveIndex(0);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions]);

  function handleChange(e) {
    const el = e.target;
    setValue(el.value);
    setCaretPos(el.selectionStart);
  }

  function handleSelectSuggestion(kw) {
    if (!currentWord) return;

    const before = value.slice(0, caretPos);
    const after = value.slice(caretPos);

    const newBefore = before.replace(/([A-Za-z0-9_.]+)$/, kw);
    const newValue = newBefore + after;

    const newCaretPos = newBefore.length;

    setValue(newValue);
    setCaretPos(newCaretPos);
    setShowSuggestions(false);

    // Move actual textarea caret after React updates
    requestAnimationFrame(() => {
      const textarea = document.getElementById("as2-editor");
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCaretPos, newCaretPos);
      }
    });
  }

  function handleKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev === 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      // Accept suggestion
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function handleClickSuggestion(kw) {
    handleSelectSuggestion(kw);
  }

  // Simple styling using Tailwind-style classes (if you have Tailwind);
  // If not, add equivalent CSS.
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <label
        htmlFor="as2-editor"
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        ActionScript Editor (with keyword autocomplete)
      </label>

      <textarea
        id="as2-editor"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => setCaretPos(e.target.selectionStart)}
        onKeyUp={(e) => setCaretPos(e.target.selectionStart)}
        spellCheck={false}
        className="w-full h-64 p-3 border rounded-xl font-mono text-sm focus:outline-none focus:ring focus:ring-indigo-300"
        placeholder={
          loading
            ? "Loading AS2 keywords..."
            : "// Start typing: e.g. 'function', 'Math.', 'MovieClip', etc."
        }
      />

      {error && (
        <p className="mt-2 text-sm text-red-500">
          Could not load keywords: {error.message}
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-auto border bg-white rounded-xl shadow-lg z-20">
          {suggestions.map((kw, index) => (
            <button
              key={kw + index}
              type="button"
              onMouseDown={(e) => {
                // prevent textarea blur
                e.preventDefault();
                handleClickSuggestion(kw);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm font-mono ${
                index === activeIndex
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Hint: Use <kbd>Arrow ↑/↓</kbd> to navigate, <kbd>Enter</kbd> or{" "}
        <kbd>Tab</kbd> to accept, <kbd>Esc</kbd> to close suggestions.
      </p>
    </div>
  );
}
