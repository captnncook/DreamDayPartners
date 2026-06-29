"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations, type Lang, type T } from "@/lib/i18n";

type LangCtx = { lang: Lang; t: T; toggle: () => void };

const Ctx = createContext<LangCtx>({ lang: "nl", t: translations.nl, toggle: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("nl");

  useEffect(() => {
    const saved = localStorage.getItem("ddp_lang") as Lang | null;
    if (saved === "nl" || saved === "en") {
      setLang(saved);
      document.cookie = `ddp_lang=${saved}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  function toggle() {
    const next: Lang = lang === "nl" ? "en" : "nl";
    setLang(next);
    localStorage.setItem("ddp_lang", next);
    document.cookie = `ddp_lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return <Ctx.Provider value={{ lang, t: translations[lang], toggle }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
