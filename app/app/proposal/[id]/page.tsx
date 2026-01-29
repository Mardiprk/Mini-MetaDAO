'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDao } from '@/hooks/useDao';
import { useMarket } from '@/hooks/useMarket';
import { usePosition } from '@/hooks/usePosition';
import { useTx } from '@/hooks/useTx';
import PriceBar from '@/components/PriceBar';
import BuyPanel from '@/components/BuyPanel';
import { useEffect, useState, useMemo } from 'react';
import { getProposalPDA, getMarketPDA, getDaoPDA, getTreasuryPDA, getPositionPDA } from '@/lib/pdas';
import { ArrowLeft, Clock, Shield, CheckCircle2, TrendingUp, Info, Loader2, Landmark, Target } from 'lucide-react';
import Link from 'next/link';
import { BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

export default function ProposalDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { program, dao, loading: daoLoading } = useDao();
    const { handleTx } = useTx();
    const { publicKey } = useWallet();

    const proposalId = useMemo(() => new BN(id as string), [id]);
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const proposalPda = useMemo(() => getProposalPDA(proposalId.toNumber())[0], [proposalId]);
    const marketPda = useMemo(() => getMarketPDA(proposalPda)[0], [proposalPda]);

    const { market, loading: marketLoading, refresh: refreshMarket } = useMarket(marketPda);
    const { position, loading: positionLoading, refresh: refreshPosition } = usePosition(marketPda);

    const fetchProposal = async () => {
        if (!program) return;
        try {
            const data = await (program.account as any).proposal.fetch(proposalPda);
            setProposal(data);
        } catch (err) {
            console.error('Error fetching proposal:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposal();
    }, [program, proposalPda]);

    const handleResolve = async (outcomeYes: boolean) => {
        if (!program || !publicKey) return;
        try {
            const tx = (program.methods as any).resolveMarket(outcomeYes).accounts({
                market: marketPda,
                resolver: publicKey,
            }).rpc();
            const { error } = await handleTx(tx, 'Resolving market...', `Market resolved to ${outcomeYes ? 'YES' : 'NO'}`);
            if (!error) {
                refreshMarket();
                fetchProposal();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleExecute = async () => {
        if (!program || !dao || !publicKey) return;
        try {
            const [daoPda] = getDaoPDA();
            const [treasuryPda] = getTreasuryPDA();

            const tx = (program.methods as any).executeProposal(new BN(0), new BN(0)).accounts({
                dao: daoPda,
                proposal: proposalPda,
                treasury: treasuryPda,
                treasuryTokenAccount: publicKey,
                recipientTokenAccount: publicKey,
                admin: publicKey,
            }).rpc();

            const { error } = await handleTx(tx, 'Executing proposal...', 'Proposal instructions executed');
            if (!error) {
                fetchProposal();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRedeem = async () => {
        if (!program || !publicKey) return;
        try {
            const [pda] = getPositionPDA(marketPda, publicKey);
            const tx = (program.methods as any).redeem().accounts({
                market: marketPda,
                position: pda,
                bettor: publicKey,
            }).rpc();

            const { error } = await handleTx(tx, 'Redeeming rewards...', 'Rewards successfully claimed');
            if (!error) {
                refreshPosition();
                refreshMarket();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || daoLoading || marketLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Fetching Proposal</p>
            </div>
        );
    }

    if (!proposal || !market) {
        return (
            <div className="max-w-xl mx-auto mt-20 p-12 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Proposal Not Found</h2>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium">This record doesn't exist on-chain or might belong to a different DAO context.</p>
                <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
                    <ArrowLeft size={16} /> Return Home
                </Link>
            </div>
        );
    }

    const isAdmin = publicKey?.toBase58() === dao?.admin?.toBase58();
    const yesPool = market.yesPool.toNumber();
    const noPool = market.noPool.toNumber();
    const totalPool = yesPool + noPool;
    const yesPrice = totalPool > 0 ? yesPool / totalPool : 0.5;
    const noPrice = totalPool > 0 ? noPool / totalPool : 0.5;

    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-10 group font-bold text-xs uppercase tracking-widest">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Go Back</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200 uppercase tracking-widest font-mono">
                                PROPOSAL #{proposal.id.toString()}
                            </span>
                            {proposal.executed ? (
                                <span className="flex items-center gap-1.5 text-[10px] border border-emerald-100 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                                    <CheckCircle2 size={12} /> Executed
                                </span>
                            ) : market.resolved ? (
                                <span className="flex items-center gap-1.5 text-[10px] border border-slate-100 bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                                    <CheckCircle2 size={12} /> Resolved
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-[10px] border border-blue-100 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                                    <Clock size={12} className="animate-pulse" /> Active
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight">
                            {proposal.description}
                        </h1>
                    </div>

                    {/* Market Sentiment Card */}
                    <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/40 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">On-chain Market Data</span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                Total Pool: {((yesPool + noPool) / 1e9).toFixed(2)} SOL
                            </div>
                        </div>

                        <PriceBar yesPrice={yesPrice} noPrice={noPrice} />

                        <div className="grid grid-cols-2 gap-5 pt-2">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/10">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 font-mono">Yes Volume</div>
                                <div className="text-2xl font-black text-slate-900">{(yesPool / 1e9).toFixed(2)} <span className="text-xs text-slate-400 font-bold">SOL</span></div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/10">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 font-mono">No Volume</div>
                                <div className="text-2xl font-black text-slate-900">{(noPool / 1e9).toFixed(2)} <span className="text-xs text-slate-400 font-bold">SOL</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && !market.resolved && (
                        <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem] space-y-5">
                            <div className="flex items-center gap-3 text-blue-800">
                                <Shield size={22} strokeWidth={2.5} />
                                <span className="text-sm font-black uppercase tracking-widest">Protocol Resolution</span>
                            </div>
                            <p className="text-slate-600 text-[13px] font-medium leading-relaxed">
                                As the designated administrator, you are responsible for resolving this market based on external outcomes.
                                Accurate resolution is critical for protocol integrity.
                            </p>
                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => handleResolve(true)}
                                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95"
                                >
                                    Resolve YES
                                </button>
                                <button
                                    onClick={() => handleResolve(false)}
                                    className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95"
                                >
                                    Resolve NO
                                </button>
                            </div>
                        </div>
                    )}

                    {isAdmin && market.resolved && !proposal.executed && market.outcomeYes && (
                        <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] space-y-5">
                            <div className="flex items-center gap-3 text-indigo-800">
                                <Landmark size={22} strokeWidth={2.5} />
                                <span className="text-sm font-black uppercase tracking-widest">Execute Intent</span>
                            </div>
                            <p className="text-slate-600 text-[13px] font-medium leading-relaxed">
                                The predictive market has finalized to YES. The proposed on-chain instructions are ready for execution.
                            </p>
                            <button
                                onClick={handleExecute}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95"
                            >
                                Trigger On-Chain Action
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <BuyPanel
                        program={program}
                        marketPda={marketPda}
                        onSuccess={() => { refreshMarket(); refreshPosition(); }}
                        disabled={market.resolved}
                    />

                    {/* User Position */}
                    {position && (
                        <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/30 space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Stake</span>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${position.isYes ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {position.isYes ? 'YES Position' : 'NO Position'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-4xl font-black text-slate-900">
                                    {(position.amount.toNumber() / 1e9).toFixed(2)}
                                </span>
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">SOL Deposited</span>
                            </div>

                            {market.resolved && !position.redeemed && (
                                <button
                                    onClick={handleRedeem}
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95"
                                >
                                    Claim Payout
                                </button>
                            )}

                            {position.redeemed && (
                                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase py-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <span>Rewards Claimed</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-5">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Info size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Market Stats</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Deadline</span>
                                <span className="text-xs font-black text-slate-900 font-mono">{new Date(market.closesAt.toNumber() * 1000).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Protocol Fee</span>
                                <span className="text-xs font-black text-slate-900 font-mono">{(market.feePool.toNumber() / 1e9).toFixed(4)} SOL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-32 pt-12 border-t border-slate-200 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
                    MiniMetaDAO Protocol &copy; 2026
                </p>
            </footer>
        </div>
    );
}
