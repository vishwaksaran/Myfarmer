'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLoginPrompt } from '@/context/LoginPromptContext';

/**
 * GlobalLoginInterceptor
 * 
 * Captures click events on interactive elements (buttons, links, etc.)
 * and shows the login prompt if the user is not logged in.
 * 
 * Whitelisted:
 * - Entire auth pages (user-login, user-register, language-selection)
 * - Elements with data-no-auth attribute
 * - Language modal triggers
 * - Theme toggles
 * - Navigation links in the header/bottom nav
 * - Mobile menu toggle
 * - The login prompt itself
 */

// Pages where the interceptor should be completely disabled
const AUTH_PAGES = ['/user-login', '/user-register', '/language-selection', '/admin-login'];

export default function GlobalLoginInterceptor() {
    const { user } = useAuth();
    const { showLoginPrompt, isDismissed } = useLoginPrompt();
    const pathname = usePathname();

    useEffect(() => {
        if (user) return; // User is logged in, no need to intercept

        // Don't intercept if user has clicked "Maybe later"
        if (isDismissed) return;

        // Don't intercept on auth-related pages
        if (AUTH_PAGES.some(page => pathname.startsWith(page))) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Find the closest interactive element (button, link, or element with onClick)
            const interactiveEl = target.closest('button, a, [role="button"], [data-clickable]') as HTMLElement | null;

            if (!interactiveEl) return; // Not clicking an interactive element

            // --- Whitelist checks: allow these elements to work without login ---

            // 1. Elements explicitly marked as no-auth
            if (interactiveEl.hasAttribute('data-no-auth') || target.hasAttribute('data-no-auth')) {
                return;
            }

            // 2. Check if any parent has data-no-auth
            if (interactiveEl.closest('[data-no-auth]')) {
                return;
            }

            // 3. Login prompt overlay itself — never intercept
            if (interactiveEl.closest('[data-login-overlay]')) {
                return;
            }

            // 4. Header navigation items (language, theme, menu toggle, logo, nav links)
            if (interactiveEl.closest('header') || interactiveEl.closest('nav')) {
                return;
            }

            // 5. Bottom navigation
            if (interactiveEl.closest('[data-bottom-nav]')) {
                return;
            }

            // 6. Category tabs (livestock, etc.) — filter tabs should work
            if (interactiveEl.closest('[data-category-tabs]')) {
                return;
            }

            // 7. Footer links
            if (interactiveEl.closest('footer')) {
                return;
            }

            // 8. Allow navigation to auth pages (Login/Register links)
            if (interactiveEl instanceof HTMLAnchorElement) {
                const href = interactiveEl.getAttribute('href');
                if (href && AUTH_PAGES.some(page => href.startsWith(page))) {
                    return;
                }
            }

            // --- Not whitelisted: intercept and show login ---
            e.preventDefault();
            e.stopPropagation();
            showLoginPrompt();
        };

        // Use capture phase to intercept before the actual handler
        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, [user, showLoginPrompt, pathname, isDismissed]);

    return null; // This component renders nothing
}
