import { cookies } from "next/headers";
import { translations, type Lang, type T } from "./i18n";

export async function getServerLang(): Promise<{ lang: Lang; t: T }> {
  const cookieStore = await cookies();
  const saved = cookieStore.get("ddp_lang")?.value as Lang | undefined;
  const lang: Lang = saved === "nl" || saved === "en" ? saved : "nl";
  return { lang, t: translations[lang] };
}
