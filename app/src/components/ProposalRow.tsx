'use client';

import Link from 'next/link';
import { ChevronRight, Clock, CheckCircle2, Circle } from 'lucide-react';

interface ProposalRowProps {
    proposal: any;
}

export default function ProposalRow({ proposal }: ProposalRowProps) {
    const market = proposal.marketAccount;
    const isResolved = market.resolved;
    const isExecuted = proposal.executed;

    // Calculate prices (simple AMM price)
    const yesPool = market.yesPool.toNumber();
    const noPool = market.noPool.toNumber();
    const totalPool = yesPool + noPool;

    const yesPrice = totalPool > 0 ? (yesPool / totalPool).toFixed(2) : "0.50";
    const noPrice = totalPool > 0 ? (noPool / totalPool).toFixed(2) : "0.50";

    const timeRemaining = () => {
        const now = Math.floor(Date.now() / 1000);
        const diff = market.closesAt.toNumber() - now;
        if (diff <= 0) return 'Market Closed';

        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    return (
        <Link
            href={`/proposal/${proposal.id.toString()}`}
            className="group block w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                            #{proposal.id.toString()}
                        </span>
                        {isExecuted ? (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                <CheckCircle2 size={10} /> Executed
                            </span>
                        ) : isResolved ? (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <CheckCircle2 size={10} /> Resolved
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                                <Circle size={10} className="animate-pulse fill-blue-600" /> Active
                            </span>
                        )}
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors truncate">
                        {proposal.description}
                    </h3>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Odds</span>
                        <div className="flex items-center gap-2 font-mono font-bold text-sm">
                            <span className="text-emerald-500">{yesPrice} Y</span>
                            <span className="text-slate-200">/</span>
                            <span className="text-rose-500">{noPrice} N</span>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end w-28">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Deadline</span>
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock size={12} strokeWidth={2.5} />
                            <span className="text-xs font-semibold whitespace-nowrap">{timeRemaining()}</span>
                        </div>
                    </div>

                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <ChevronRight size={18} strokeWidth={3} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
