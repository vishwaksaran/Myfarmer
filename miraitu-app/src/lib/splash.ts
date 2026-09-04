/**
 * Waiting for the PWA splash.
 *
 * The installed PWA opens on the branded splash, which owns the first few
 * seconds of a launch. Anything that greets the user — the first-run language
 * gate, notably — has to wait it out rather than race it: the splash sits at
 * z-index 999999 and `Z.AUTH` is 1000000, so a greeting that renders early
 * paints straight over the brand moment instead of following it.
 *
 * The signal is the splash's own presence in the DOM, not a timer. A timer here
 * has to guess when hydration happened — the splash starts its countdown from
 * its effect, not from navigation — and a guess that comes in short fires
 * *during* the splash, which is the bug this exists to prevent.
 */

/** The splash's root element, removed by SplashScreen when it is done. */
const SPLASH_SELECTOR = '.miraitu-splash';

/**
 * The name of the splash's fade-out keyframes. Must match SplashScreen's CSS.
 *
 * Worth watching as well as the element's removal, because the two can be far
 * apart: the fade is CSS, timed from paint, while the removal is a JS timer
 * that cannot start until hydration. On a slow phone the splash finishes
 * fading seconds before React gets around to unmounting it, and waiting for
 * the node would leave the user staring at the bare app in between.
 */
const SPLASH_FADE_ANIMATION = 'msFadeOut';

/**
 * The class the head script stamps on <html> before first paint when this load
 * is an installed PWA (or the `?splash` preview). It is the same condition
 * SplashScreen's CSS uses to decide whether to show at all, and unlike the
 * component it is readable immediately — no hydration wait.
 */
const STANDALONE_CLASS = 'pwa-standalone';

/** Will a splash actually play on this load? False in a normal browser tab. */
export function splashWillPlay(): boolean {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains(STANDALONE_CLASS);
}

/**
 * Run `cb` once the splash is gone — synchronously if none will play, or if it
 * has already left. Returns an unsubscribe for effect cleanup.
 */
export function onSplashDone(cb: () => void): () => void {
    if (typeof document === 'undefined') return () => { };

    if (!splashWillPlay() || !document.querySelector(SPLASH_SELECTOR)) {
        cb();
        return () => { };
    }

    const splash = document.querySelector(SPLASH_SELECTOR) as HTMLElement;

    let settled = false;
    const done = () => {
        if (settled) return;
        settled = true;
        cleanup();
        cb();
    };

    // Whichever comes first: the splash finishes fading, or it leaves the DOM.
    const onAnimationEnd = (e: AnimationEvent) => {
        if (e.target === splash && e.animationName === SPLASH_FADE_ANIMATION) done();
    };
    splash.addEventListener('animationend', onAnimationEnd);

    const observer = new MutationObserver(() => {
        if (!document.querySelector(SPLASH_SELECTOR)) done();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function cleanup() {
        splash.removeEventListener('animationend', onAnimationEnd);
        observer.disconnect();
    }

    return cleanup;
}
