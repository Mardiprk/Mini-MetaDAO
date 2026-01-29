'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getProgram } from '../lib/anchor';
import { getMarketPDA, getPositionPDA } from '../lib/pdas';

interface BuyPanelProps {
    proposalPubkey: PublicKey;
    marketPubkey: PublicKey;
    yesPool: number;
    noPool: number;
    isMarketClosed: boolean;
    onSuccess: () => void;
}

export default function BuyPanel({
    proposalPubkey,
    marketPubkey,
    yesPool,
    noPool,
    isMarketClosed,
    onSuccess
}: BuyPanelProps) {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const amountLamports = amount ? parseFloat(amount) * LAMPORTS_PER_SOL : 0;

    // Calculate estimated payout (simplified - 2% fee)
    const estimatedPayout = amountLamports * 0.98;

    const handleBuy = async (isYes: boolean) => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            setError('Please connect your wallet');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const program = getProgram(connection, wallet as any);
            const [positionPDA] = getPositionPDA(marketPubkey, wallet.publicKey);

            const tx = isYes
                ? await program.methods
                    .buyYes(BigInt(amountLamports))
                    .accounts({
                        market: marketPubkey,
                        position: positionPDA,
                        bettor: wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc()
                : await program.methods
                    .buyNo(BigInt(amountLamports))
                    .accounts({
                        market: marketPubkey,
                        position: positionPDA,
                        bettor: wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc();

            console.log('Transaction signature:', tx);
            setAmount('');
            onSuccess();
        } catch (err: any) {
            console.error('Error buying:', err);
            setError(err.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    const setMaxAmount = async () => {
        if (!wallet.publicKey) return;

        try {
            const balance = await connection.getBalance(wallet.publicKey);
            // Leave 0.01 SOL for fees
            const maxAmount = Math.max(0, (balance - 0.01 * LAMPORTS_PER_SOL) / LAMPORTS_PER_SOL);
            setAmount(maxAmount.toFixed(4));
        } catch (err) {
            console.error('Error getting balance:', err);
        }
    };

    return (
        <div className="premium-card rounded-3xl p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 font-outfit">Execute Trade</h3>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Market</span>
                </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Investment Amount</label>
                    {wallet.publicKey && (
                        <button
                            onClick={setMaxAmount}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                        >
                            Use Max Balance
                        </button>
                    )}
                </div>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">SOL</div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        disabled={isMarketClosed || loading}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-4 py-6 text-2xl font-bold font-outfit text-slate-900 placeholder-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all disabled:opacity-50"
                        step="0.001"
                        min="0"
                    />
                </div>
            </div>

            {/* Market Info / Estimated Payout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fee (2%)</span>
                    <span className="text-sm font-bold text-slate-600 font-outfit">{(amountLamports * 0.02 / LAMPORTS_PER_SOL).toFixed(4)} SOL</span>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Estimated Shares</span>
                    <span className="text-xl font-bold text-blue-600 font-outfit">
                        {amount ? (estimatedPayout / LAMPORTS_PER_SOL).toFixed(4) : "0.0000"}
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-medium">
                    {error}
                </div>
            )}

            {/* Buy Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleBuy(true)}
                    disabled={isMarketClosed || loading || !wallet.publicKey}
                    className="group relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-30 disabled:shadow-none"
                >
                    <span className="relative z-10 text-sm uppercase tracking-widest">{loading ? 'Processing...' : 'Speculate YES'}</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                    onClick={() => handleBuy(false)}
                    disabled={isMarketClosed || loading || !wallet.publicKey}
                    className="group relative overflow-hidden bg-rose-600 hover:bg-rose-700 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-rose-500/20 disabled:opacity-30 disabled:shadow-none"
                >
                    <span className="relative z-10 text-sm uppercase tracking-widest">{loading ? 'Processing...' : 'Speculate NO'}</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            {isMarketClosed && (
                <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market is closed for trading</span>
                </div>
            )}

            {!wallet.publicKey && (
                <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authentication Required to Trade</span>
                </div>
            )}
        </div>
    );
}
