import { createContext } from "react";

export const LangContext = createContext({
  lang: "id",
  setLang: () => {},
  t: (key) => key,
});
