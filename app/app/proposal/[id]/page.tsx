'use client';

import { use, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Link from 'next/link';
import { useDao } from "@/src/hooks/useDao";
import { useMarket } from "@/src/hooks/useMarket";
import { usePosition } from "@/src/hooks/usePosition";
import { getProgram } from '@/lib/anchor';
import { getProposalPDA, getMarketPDA, getTreasuryPDA, getPositionPDA } from '@/lib/pdas';
import BuyPanel from "@/src/components/BuyPanel";
import PriceBar from "@/src/components/PriceBar";
import StatsGrid from "@/src/components/StatsGrid";

export default function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { connection } = useConnection();
    const wallet = useWallet();
    const { dao } = useDao();

    const proposalId = parseInt(id);
    const [proposalPDA] = getProposalPDA(proposalId);
    const [marketPDA] = getMarketPDA(proposalPDA);

    const { market, loading: marketLoading } = useMarket(marketPDA);
    const { position } = usePosition(marketPDA);

    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch proposal
    useState(() => {
        async function fetchProposal() {
            if (!wallet.publicKey) {
                setLoading(false);
                return;
            }

            try {
                const program = getProgram(connection, wallet as any);
                const proposalAccount = await (program.account as any).proposal.fetch(proposalPDA);

                setProposal({
                    id: Number(proposalAccount.id),
                    creator: proposalAccount.creator,
                    description: proposalAccount.description,
                    market: proposalAccount.market,
                    executed: proposalAccount.executed,
                });
            } catch (err: any) {
                console.error('Error fetching proposal:', err);
                setError(err.message || 'Failed to fetch proposal');
            } finally {
                setLoading(false);
            }
        }

        fetchProposal();
    });

    const isAdmin = dao && wallet.publicKey && dao.admin.equals(wallet.publicKey);
    const now = Math.floor(Date.now() / 1000);
    const isMarketClosed = market ? market.resolved || market.closesAt < now : true;
    const canRedeem = market?.resolved && position && !position.redeemed;

    const handleResolveMarket = async (outcomeYes: boolean) => {
        if (!wallet.publicKey || !wallet.signTransaction) return;

        try {
            setActionLoading(true);
            setError(null);

            const program = getProgram(connection, wallet as any);

            const tx = await program.methods
                .resolveMarket(outcomeYes)
                .accounts({
                    market: marketPDA,
                    resolver: wallet.publicKey,
                })
                .rpc();

            console.log('Market resolved:', tx);
            window.location.reload();
        } catch (err: any) {
            console.error('Error resolving market:', err);
            setError(err.message || 'Failed to resolve market');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!wallet.publicKey || !wallet.signTransaction || !position) return;

        try {
            setActionLoading(true);
            setError(null);

            const program = getProgram(connection, wallet as any);
            const [positionPDA] = getPositionPDA(marketPDA, wallet.publicKey);

            const tx = await program.methods
                .redeem()
                .accounts({
                    market: marketPDA,
                    position: positionPDA,
                    bettor: wallet.publicKey,
                })
                .rpc();

            console.log('Redeemed:', tx);
            window.location.reload();
        } catch (err: any) {
            console.error('Error redeeming:', err);
            setError(err.message || 'Failed to redeem');
        } finally {
            setActionLoading(false);
        }
    };

    const handleExecuteProposal = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return;

        const solAmount = prompt('Enter SOL amount to transfer (in lamports):');
        const tokenAmount = prompt('Enter token amount to transfer:');

        if (!solAmount || !tokenAmount) return;

        try {
            setActionLoading(true);
            setError(null);

            const program = getProgram(connection, wallet as any);
            const [treasuryPDA] = getTreasuryPDA();

            // You would need to provide actual token account addresses
            const treasuryTokenAccount = new PublicKey('11111111111111111111111111111111'); // Replace
            const recipientTokenAccount = new PublicKey('11111111111111111111111111111111'); // Replace

            const tx = await program.methods
                .executeProposal(BigInt(solAmount), BigInt(tokenAmount))
                .accounts({
                    dao: dao!.admin, // This should be DAO PDA
                    proposal: proposalPDA,
                    treasury: treasuryPDA,
                    treasuryTokenAccount,
                    recipientTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    admin: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log('Proposal executed:', tx);
            window.location.reload();
        } catch (err: any) {
            console.error('Error executing proposal:', err);
            setError(err.message || 'Failed to execute proposal');
        } finally {
            setActionLoading(false);
        }
    };

    if (!wallet.publicKey) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20">
                    <p className="text-slate-500">Connect your wallet to view proposal details</p>
                </div>
            </div>
        );
    }

    if (loading || marketLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-slate-500 mt-4">Loading proposal...</p>
                </div>
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20">
                    <p className="text-slate-500">Proposal not found</p>
                    <Link href="/" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full min-h-screen">
            <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Back Button */}
                <Link href="/" className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                    <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> Back to Dashboard
                </Link>

                {/* Proposal Header */}
                <div className="space-y-6 pb-8 border-b border-slate-200/60">
                    <div className="flex justify-between items-start">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 border border-slate-200 rounded">ID-{proposal.id}</span>
                                {proposal.executed && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                        Executed
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 leading-tight font-outfit">{proposal.description}</h1>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-medium text-sm">
                        {error}
                    </div>
                )}

                {market ? (
                    <div className="space-y-12">
                        {/* Stats Grid */}
                        <StatsGrid
                            yesPool={market.yesPool}
                            noPool={market.noPool}
                            feePool={market.feePool}
                            closesAt={market.closesAt}
                            resolved={market.resolved}
                        />

                        {/* Price Bar & Buy Panel Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            <div className="md:col-span-1 space-y-6">
                                <div className="premium-card rounded-2xl p-6 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Market Consensus</h3>
                                    <div className="py-2">
                                        <PriceBar yesPool={market.yesPool} noPool={market.noPool} />
                                    </div>
                                </div>

                                {/* Position Info */}
                                {position && (
                                    <div className="premium-card rounded-2xl p-6 space-y-4 bg-slate-50/50">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Position</h3>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Side</div>
                                                <div className={`text-xl font-bold font-outfit ${position.isYes ? 'text-blue-600' : 'text-rose-600'}`}>
                                                    {position.isYes ? 'YES' : 'NO'}
                                                </div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Amount</div>
                                                <div className="text-xl font-bold text-slate-900 font-outfit">
                                                    {(position.amount / LAMPORTS_PER_SOL).toFixed(3)} <span className="text-sm">SOL</span>
                                                </div>
                                            </div>
                                        </div>

                                        {canRedeem && !position.redeemed && (
                                            <button
                                                onClick={handleRedeem}
                                                disabled={actionLoading}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-xs uppercase tracking-widest"
                                            >
                                                {actionLoading ? 'Redeeming...' : 'Redeem Winnings'}
                                            </button>
                                        )}

                                        {position.redeemed && (
                                            <div className="text-center py-2 border border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Reward Claimed
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                {/* Buy Panel */}
                                {!market.resolved && (
                                    <BuyPanel
                                        proposalPubkey={proposalPDA}
                                        marketPubkey={marketPDA}
                                        yesPool={market.yesPool}
                                        noPool={market.noPool}
                                        isMarketClosed={isMarketClosed}
                                        onSuccess={() => window.location.reload()}
                                    />
                                )}
                                {market.resolved && (
                                    <div className="premium-card rounded-3xl p-12 text-center space-y-4 grayscale border-dashed">
                                        <div className="text-4xl">🏁</div>
                                        <h3 className="text-xl font-bold text-slate-900 font-outfit">This market has concluded</h3>
                                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                            Trading is disabled for resolved proposals. If you had a winning position, you can redeem your funds.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && (
                            <div className="premium-card bg-amber-50/30 border-amber-100 rounded-3xl p-8 space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700">Protocol Administration</h3>
                                </div>

                                {!market.resolved && isMarketClosed && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleResolveMarket(true)}
                                            disabled={actionLoading}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-30 text-xs uppercase tracking-widest"
                                        >
                                            Resolve YES
                                        </button>
                                        <button
                                            onClick={() => handleResolveMarket(false)}
                                            disabled={actionLoading}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-30 text-xs uppercase tracking-widest"
                                        >
                                            Resolve NO
                                        </button>
                                    </div>
                                )}

                                {market.resolved && !proposal.executed && (
                                    <button
                                        onClick={handleExecuteProposal}
                                        disabled={actionLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-xs uppercase tracking-widest"
                                    >
                                        {actionLoading ? 'Executing Protocol Transfer...' : 'Execute Approved Proposal'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="premium-card rounded-3xl p-20 text-center space-y-4 border-dashed">
                        <div className="text-4xl grayscale opacity-40">⏳</div>
                        <p className="text-slate-500 font-medium">No market opened for this proposal</p>
                    </div>
                )}
            </div>
        </div>
    );
}
