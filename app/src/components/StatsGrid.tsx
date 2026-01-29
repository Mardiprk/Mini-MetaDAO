'use client';

interface StatsGridProps {
    yesPool: number;
    noPool: number;
    feePool: number;
    closesAt: number;
    resolved: boolean;
}

export default function StatsGrid({ yesPool, noPool, feePool, closesAt, resolved }: StatsGridProps) {
    const totalLiquidity = (yesPool + noPool) / 1e9;
    const fees = feePool / 1e9;

    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = closesAt - now;
    const daysRemaining = Math.floor(timeRemaining / 86400);
    const hoursRemaining = Math.floor((timeRemaining % 86400) / 3600);
    const minutesRemaining = Math.floor((timeRemaining % 3600) / 60);

    const stats = [
        {
            label: 'Total Liquidity',
            value: `${totalLiquidity.toFixed(4)} SOL`,
            color: 'text-blue-600',
        },
        {
            label: 'Fee Pool',
            value: `${fees.toFixed(4)} SOL`,
            color: 'text-indigo-600',
        },
        {
            label: 'Status',
            value: resolved ? 'Resolved' : timeRemaining > 0 ? 'Active' : 'Closed',
            color: resolved ? 'text-slate-500' : timeRemaining > 0 ? 'text-emerald-600' : 'text-rose-600',
        },
        {
            label: 'Time Remaining',
            value: resolved ? 'N/A' : timeRemaining > 0 ? `${daysRemaining}d ${hoursRemaining}h ${minutesRemaining}m` : 'Ended',
            color: 'text-slate-500',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="premium-card rounded-2xl p-5 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
                    <div className={`text-xl font-bold font-outfit ${stat.color}`}>{stat.value}</div>
                </div>
            ))}
        </div>
    );
}
