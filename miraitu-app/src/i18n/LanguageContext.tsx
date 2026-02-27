'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { translations, LangCode } from './translations';

interface LanguageContextType {
    lang: LangCode;
    setLang: (lang: LangCode) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => { },
    t: (key: string) => key,
});

const VALID_LANGS: LangCode[] = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'kn', 'pa', 'bn', 'ml'];

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
    // The t function is recreated only when lang changes, ensuring all
    // consumers get fresh translations without stale closure issues.
    const contextValue = useMemo<LanguageContextType>(() => ({
        lang,
        setLang,
        t: (key: string): string => {
            return translations[lang]?.[key] || translations['en']?.[key] || key;
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
