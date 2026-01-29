'use client';

interface PriceBarProps {
    yesPool: number;
    noPool: number;
}

export default function PriceBar({ yesPool, noPool }: PriceBarProps) {
    const total = yesPool + noPool;
    const yesPercent = total > 0 ? (yesPool / total) * 100 : 50;
    const noPercent = total > 0 ? (noPool / total) * 100 : 50;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">YES</div>
                    <div className="text-2xl font-bold text-slate-900 font-outfit">{yesPercent.toFixed(1)}%</div>
                </div>
                <div className="space-y-1 text-right">
                    <div className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">NO</div>
                    <div className="text-2xl font-bold text-slate-900 font-outfit">{noPercent.toFixed(1)}%</div>
                </div>
            </div>

            <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                    className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                    style={{ width: `${yesPercent}%` }}
                />
                <div
                    className="h-full bg-rose-500 transition-all duration-700 ease-out"
                    style={{ width: `${noPercent}%` }}
                />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                <span>{(yesPool / 1e9).toFixed(3)} SOL</span>
                <span>{(noPool / 1e9).toFixed(3)} SOL</span>
            </div>
        </div>
    );
}
