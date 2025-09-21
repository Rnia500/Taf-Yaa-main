import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchInput } from "./Input.jsx";
import Text from "./Text.jsx";
import Card from "../layout/containers/Card.jsx";
import Submenu from "./Submenu.jsx";

export default function LanguageMenu({ isOpen, onClose }) {
  const { i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter languages based on search term
  const filteredLanguages = languages.filter(lang => 
    lang.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentLang = i18n.language || "en";

  return (
    <Submenu
      isOpen={isOpen}
      onClose={onClose}
      className="language-menu"
      title="Language"
      showHeader={true}
    >
      <div className="language-menu-search">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search languages..."
          backgroundColor="var(--color-white)"
          color="var(--color-primary-text)"
        />
      </div>
      
      <div className="language-menu-list">
        {filteredLanguages.length > 0 ? (
          filteredLanguages.map((lang) => (
            <Card
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`language-option ${currentLang.startsWith(lang.code) ? 'active' : ''}`}
              padding="0.75rem"
              margin="0"
              backgroundColor={currentLang.startsWith(lang.code) ? "var(--color-primary-light)" : "transparent"}
              borderColor={currentLang.startsWith(lang.code) ? "var(--color-primary)" : "transparent"}
              borderRadius="8px"
              width="100%"
              height="auto"
              fitContent={true}
            >
              <div className="language-option-content">
                <span className="language-flag">{lang.flag}</span>
                <div className="language-text">
                  <Text variant="body2" bold={currentLang.startsWith(lang.code)} className="language-label">
                    {lang.label}
                  </Text>
                  <Text variant="caption" className="language-native">
                    {lang.native}
                  </Text>
                </div>
                {currentLang.startsWith(lang.code) && (
                  <div className="language-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="language-no-results">
            <Text variant="caption" color="secondary-text">
              No languages found
            </Text>
          </div>
        )}
      </div>
    </Submenu>
  );
}

const languages = [
  { 
    code: "en", 
    label: "English", 
    native: "English",
    flag: "🇬🇧" 
  },
  { 
    code: "fr", 
    label: "French", 
    native: "Français",
    flag: "🇫🇷" 
  },
  { 
    code: "es", 
    label: "Spanish", 
    native: "Español",
    flag: "🇪🇸" 
  },
  { 
    code: "ar", 
    label: "Arabic", 
    native: "العربية",
    flag: "🇸🇦" 
  },
  // Add more languages for testing
  { 
    code: "de", 
    label: "German", 
    native: "Deutsch",
    flag: "🇩🇪" 
  },
  { 
    code: "it", 
    label: "Italian", 
    native: "Italiano",
    flag: "🇮🇹" 
  },
  { 
    code: "pt", 
    label: "Portuguese", 
    native: "Português",
    flag: "🇵🇹" 
  },
  { 
    code: "ru", 
    label: "Russian", 
    native: "Русский",
    flag: "🇷🇺" 
  },
  { 
    code: "ja", 
    label: "Japanese", 
    native: "日本語",
    flag: "🇯🇵" 
  },
  { 
    code: "ko", 
    label: "Korean", 
    native: "한국어",
    flag: "🇰🇷" 
  },
  { 
    code: "zh", 
    label: "Chinese", 
    native: "中文",
    flag: "🇨🇳" 
  },
  { 
    code: "hi", 
    label: "Hindi", 
    native: "हिन्दी",
    flag: "🇮🇳" 
  },
];