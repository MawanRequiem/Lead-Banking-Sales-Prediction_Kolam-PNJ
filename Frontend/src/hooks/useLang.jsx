import { useContext } from "react";
import { LangContext } from "@/contexts/lang-context-consts";

export function useLang() {
  return useContext(LangContext);
}
