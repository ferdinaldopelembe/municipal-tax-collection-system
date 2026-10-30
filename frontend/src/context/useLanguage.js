import { useContext } from "react";
import LanguageContext from "./languageContext";

export default function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage deve ser usado dentro de LanguageProvider");
  }
  return context;
}
