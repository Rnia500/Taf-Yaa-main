import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageMenu({ isOpen, onClose }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);

    // RTL support for Arabic
    if (lng === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }

    onClose?.();
  };

  if (!isOpen) return null;

  const currentLang = i18n.language || "en";

  return (
    <div
      style={{
        position: "absolute",
        top: "60px",
        right: "40px",
        background: "var(--color-white)",
        border: "1px solid var(--color-gray)",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        zIndex: 2000,
        minWidth: "160px",
      }}
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          style={{
            ...buttonStyle,
            fontWeight: currentLang.startsWith(lang.code) ? "bold" : "normal",
            background: currentLang.startsWith(lang.code)
              ? "var(--color-light-blue)"
              : "transparent",
          }}
        >
          {lang.flag} {lang.label}
        </button>
      ))}
    </div>
  );
}

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

const buttonStyle = {
  display: "block",
  width: "100%",
  padding: "10px 14px",
  textAlign: "left",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  color: "var(--color-primary-text)",
};