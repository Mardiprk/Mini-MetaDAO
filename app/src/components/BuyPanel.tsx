'use client';

import { useState, useEffect } from 'react';
import { useTx } from '@/hooks/useTx';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Loader2, ArrowRight, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { getPositionPDA } from '@/lib/pdas';

interface BuyPanelProps {
    program: any;
    marketPda: PublicKey;
    onSuccess: () => void;
    disabled?: boolean;
}

export default function BuyPanel({ program, marketPda, onSuccess, disabled }: BuyPanelProps) {
    const { handleTx } = useTx();
    const { publicKey } = useWallet();
    const { connection } = useConnection();

    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then(val => setBalance(val / LAMPORTS_PER_SOL));
        }
    }, [publicKey, connection]);

    const handleBuy = async (isYes: boolean) => {
        if (!program || !amount || parseFloat(amount) <= 0 || !publicKey) return;

        setLoading(true);
        try {
            const lamports = new BN(Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL));
            const tx = isYes
                ? (program.methods as any).buyYes(lamports).rpc()
                : (program.methods as any).buyNo(lamports).rpc();

            const { error } = await handleTx(
                tx,
                `Buying ${isYes ? 'YES' : 'NO'}...`,
                `Successfully bought ${amount} SOL of ${isYes ? 'YES' : 'NO'}`
            );

            if (!error) {
                setAmount('');
                onSuccess();
                const newBalance = await connection.getBalance(publicKey);
                setBalance(newBalance / LAMPORTS_PER_SOL);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isInvalid = !amount || parseFloat(amount) <= 0 || (balance !== null && parseFloat(amount) > balance);

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount to Trade</span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <Wallet size={12} className="text-blue-500" />
                        {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
                    </span>
                </div>
                <div className="relative group">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.1"
                        min="0"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 pr-20 text-2xl font-bold text-slate-900 focus:outline-none focus:border-blue-500/30 focus:bg-white transition-all placeholder:text-slate-200"
                        disabled={loading || disabled}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-slate-400 font-bold text-sm">SOL</span>
                        <button
                            onClick={() => balance && setAmount((balance * 0.95).toFixed(4))}
                            className="bg-white hover:bg-slate-50 text-[10px] font-bold text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all active:scale-95"
                        >
                            MAX
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <button
                    onClick={() => handleBuy(true)}
                    disabled={loading || disabled || isInvalid}
                    className="relative group bg-emerald-50 hover:bg-emerald-600 border border-emerald-100 hover:border-emerald-600 rounded-2xl py-4 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col items-center gap-0.5">
                        <span className="text-emerald-700 group-hover:text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2 transition-colors">
                            <TrendingUp size={20} /> Buy YES
                        </span>
                        <span className="text-[10px] text-emerald-600/80 group-hover:text-emerald-100 font-bold uppercase transition-colors">Bullish on Proposal</span>
                    </div>
                </button>

                <button
                    onClick={() => handleBuy(false)}
                    disabled={loading || disabled || isInvalid}
                    className="relative group bg-rose-50 hover:bg-rose-600 border border-rose-100 hover:border-rose-600 rounded-2xl py-4 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col items-center gap-0.5">
                        <span className="text-rose-700 group-hover:text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2 transition-colors">
                            <TrendingDown size={20} /> Buy NO
                        </span>
                        <span className="text-[10px] text-rose-600/80 group-hover:text-rose-100 font-bold uppercase transition-colors">Bearish on Proposal</span>
                    </div>
                </button>
            </div>

            {loading && (
                <div className="flex items-center justify-center gap-3 text-slate-400 text-sm font-semibold animate-pulse py-2">
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                    <span>Transaction in progress...</span>
                </div>
            )}
        </div>
    );
}
