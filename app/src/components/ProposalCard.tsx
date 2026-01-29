'use client';

import Link from 'next/link';
import { ProposalWithMarket } from '../lib/types';

interface ProposalCardProps {
    data: ProposalWithMarket;
}

export default function ProposalCard({ data }: ProposalCardProps) {
    const { proposal, market } = data;

    // Calculate prices
    const totalPool = market ? market.yesPool + market.noPool : 0;
    const yesPrice = totalPool > 0 ? (market!.yesPool / totalPool) * 100 : 50;
    const noPrice = totalPool > 0 ? (market!.noPool / totalPool) * 100 : 50;

    // Calculate time remaining
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = market ? market.closesAt - now : 0;
    const daysRemaining = Math.floor(timeRemaining / 86400);
    const hoursRemaining = Math.floor((timeRemaining % 86400) / 3600);

    // Status
    const isActive = market && !market.resolved && timeRemaining > 0;
    const isResolved = market?.resolved;

    return (
        <Link href={`/proposal/${proposal.id}`}>
            <div className="premium-card rounded-2xl p-6 group cursor-pointer h-full flex flex-col">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${isResolved
                        ? 'bg-slate-100 text-slate-600'
                        : isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-slate-50 text-slate-400'
                        }`}>
                        {isResolved ? 'Resolved' : isActive ? 'Active' : 'No Market'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID-{proposal.id}</span>
                </div>

                {/* Description */}
                <h3 className="text-[17px] font-semibold text-slate-900 leading-snug mb-6 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {proposal.description}
                </h3>

                <div className="mt-auto">
                    {market && (
                        <>
                            {/* Prices */}
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">YES Forecast</div>
                                    <div className="text-xl font-bold text-slate-900">{yesPrice.toFixed(1)}%</div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${yesPrice}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">NO Forecast</div>
                                    <div className="text-xl font-bold text-slate-900">{noPrice.toFixed(1)}%</div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 transition-all duration-500 ml-auto" style={{ width: `${noPrice}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>{(totalPool / 1e9).toFixed(2)} SOL Liquidity</span>
                                </div>
                                {isActive && (
                                    <div className="font-medium text-slate-700">
                                        {daysRemaining}d {hoursRemaining}h left
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {!market && (
                        <div className="flex items-center justify-center py-6 border-t border-slate-50 grayscale opacity-40">
                            <span className="text-xs font-medium text-slate-500 italic">Market pending initialization</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
