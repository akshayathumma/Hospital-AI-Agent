import { useCallback, useEffect, useState } from "react";

const KEY = "hospital-ai-search-history";
const MAX = 8;

export default function useSearchHistory() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((term) => {
    const t = term.trim();
    if (!t) return;
    setItems((prev) => [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return { items, add, clear };
}