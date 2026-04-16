"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { en } from "../locales/en";
import { vi } from "../locales/vi";

type LanguageContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState("vi"); // Default to Vietnamese

  useEffect(() => {
    const savedLocale = localStorage.getItem("bookroom_locale");
    if (savedLocale) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem("bookroom_locale", newLocale);
  };

  const translations: any = locale === "vi" ? vi : en;

  const t = (key: string) => {
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    return {
      locale: "vi",
      setLocale: () => {},
      t: (key: string) => key,
    };
  }
  return context;
};
