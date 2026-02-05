'use client';

export default function HeroBanner() {
    return (
        <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-[8px_8px_20px_#d4d9ce,-8px_-8px_20px_#ffffff] mb-6">
            {/* Background Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#8eb857] to-[#5a8a3e]">
                <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEwIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yMyAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative h-full flex items-center justify-between px-6 md:px-10">
                {/* Left Side - Text */}
                <div className="flex-1 z-10">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg mb-2 tracking-tight">
                        All Your Farming &<br />Village Needs in One App
                    </h2>
                </div>

                {/* Right Side - Illustration Placeholder */}
                <div className="hidden md:flex items-center justify-center h-full">
                    <div className="flex gap-2">
                        {/* Tractor Icon */}
                        <div className="text-6xl opacity-90">🚜</div>
                        {/* Animal Icon */}
                        <div className="text-6xl opacity-90">🐄</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
