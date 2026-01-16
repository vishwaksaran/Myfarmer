/**
 * MiraituLogo - Actual Miraitu logo component using the provided design
 */

interface MiraituLogoProps {
    className?: string;
    size?: number;
}

export default function MiraituLogo({ className = "", size = 40 }: MiraituLogoProps) {
    return (
        <img
            src="/miraitu-logo.png"
            alt="Miraitu Logo"
            width={size}
            height={size}
            className={className}
            style={{ objectFit: 'contain' }}
        />
    );
}
