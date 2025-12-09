import React, { useContext, useMemo, useState, useEffect } from "react";
import { LangContext } from "./lang-context-consts";
import { dictionaries } from "@/lib/langs";

export function LangProvider({
  children,
  defaultLang = "id",
  storageKey = "app_lang",
}) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || defaultLang;
    } catch {
      return defaultLang;
    }
  });

  const t = useMemo(() => {
    const dict = dictionaries[lang] || dictionaries.id;
    return (key, fallback) => {
      const parts = String(key).split(".");
      let cur = dict;
      for (const p of parts) {
        if (cur && typeof cur === "object" && p in cur) cur = cur[p];
        else return fallback ?? key;
      }
      return typeof cur === "string" ? cur : fallback ?? key;
    };
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang: (newLang) => {
        try {
          localStorage.setItem(storageKey, newLang);
        } catch {}
        setLang(newLang);
      },
      t,
    }),
    [lang, t, storageKey]
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
