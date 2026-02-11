'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<LangCode>('en');

    const setLang = useCallback((code: LangCode) => {
        setLangState(code);
        if (typeof window !== 'undefined') {
            localStorage.setItem('miraitu-lang', code);
        }
    }, []);

    const t = useCallback((key: string): string => {
        return translations[lang]?.[key] || translations['en']?.[key] || key;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
