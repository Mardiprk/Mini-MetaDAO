'use client';

interface PriceBarProps {
    yesPrice: number;
    noPrice: number;
}

export default function PriceBar({ yesPrice, noPrice }: PriceBarProps) {
    const yesPercent = yesPrice * 100;

    return (
        <div className="w-full space-y-2.5">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-emerald-600">YES {yesPercent.toFixed(0)}%</span>
                <span className="text-rose-600">NO {(100 - yesPercent).toFixed(0)}%</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                    style={{ width: `${yesPercent}%` }}
                />
                <div
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-1000 ease-out"
                    style={{ width: `${100 - yesPercent}%` }}
                />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] font-mono">
                <span>{yesPrice.toFixed(2)} SOL</span>
                <span>{noPrice.toFixed(2)} SOL</span>
            </div>
        </div>
    );
}
