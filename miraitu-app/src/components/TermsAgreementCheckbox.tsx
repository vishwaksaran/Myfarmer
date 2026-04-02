'use client';

import Link from 'next/link';

export default function TermsAgreementCheckbox({
    checked,
    onChange,
    className,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}) {
    return (
        <label className={`flex items-start gap-3 cursor-pointer select-none ${className || ''}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[var(--miraitu-primary-green)] rounded"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                I agree to the{' '}
                <Link href="/home/terms-of-service" className="text-primary underline hover:text-primary-dark">
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/home/privacy-policy" className="text-primary underline hover:text-primary-dark">
                    Privacy Policy
                </Link>
            </span>
        </label>
    );
}
