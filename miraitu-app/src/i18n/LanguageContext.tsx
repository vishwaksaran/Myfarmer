'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { translations, LangCode } from './translations';

// Import pre-generated complete translations for instant availability
import generatedTranslations from '../../generated-translations-complete.json';

interface LanguageContextType {
    lang: LangCode;
    setLang: (lang: LangCode) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => { },
    t: (key: string) => translations['en']?.[key] || key,
});

const VALID_LANGS: LangCode[] = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'kn', 'pa', 'bn', 'ml'];

// Languages that have complete pre-generated translations
const LANGS_WITH_PREGENERATED: LangCode[] = ['mr', 'gu', 'te', 'ta', 'kn', 'pa', 'bn', 'ml'];

// Create a merged translations object with pre-generated data
const mergedTranslations: Record<LangCode, Record<string, string>> = { ...translations };
for (const lang of LANGS_WITH_PREGENERATED) {
    mergedTranslations[lang] = {
        ...(translations[lang] || {}),
        ...(generatedTranslations[lang as keyof typeof generatedTranslations] || {}),
    };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<LangCode>('en');

    // Restore saved language from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('miraitu-lang');
        if (saved && VALID_LANGS.includes(saved as LangCode)) {
            setLangState(saved as LangCode);
        }
    }, []);

    const setLang = useCallback((code: LangCode) => {
        setLangState(code);
        if (typeof window !== 'undefined') {
            localStorage.setItem('miraitu-lang', code);
        }
    }, []);

    // Memoize the entire context value so it only changes when lang changes.
    const contextValue = useMemo<LanguageContextType>(() => ({
        lang,
        setLang,
        t: (key: string): string => {
            // Use merged translations (with pre-generated data) if available
            const dict = mergedTranslations[lang] || translations[lang];
            return dict?.[key] || translations['en']?.[key] || key;
        },
    }), [lang, setLang]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
