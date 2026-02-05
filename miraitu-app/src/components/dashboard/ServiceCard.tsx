interface ServiceCardProps {
    icon: string;
    title: string;
    onClick?: () => void;
}

export default function ServiceCard({ icon, title, onClick }: ServiceCardProps) {
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-[#fbfaf9] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d4d9ce,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
            {/* Icon Container */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] group-hover:from-primary/15 group-hover:to-primary/10 transition-colors">
                <span className="text-4xl">{icon}</span>
            </div>

            {/* Title */}
            <span className="text-sm font-bold text-primary-dark text-center leading-tight">
                {title}
            </span>
        </button>
    );
}
