'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '@/lib/anchor';
import { Market } from '@/lib/types';

export function useMarket(marketPubkey: PublicKey | null) {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [market, setMarket] = useState<Market | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMarket() {
            try {
                setLoading(true);
                setError(null);

                if (!wallet.publicKey || !marketPubkey) {
                    setMarket(null);
                    setLoading(false);
                    return;
                }

                const program = getProgram(connection, wallet as any);
                const marketAccount = await (program.account as any).market.fetch(marketPubkey);

                setMarket({
                    proposal: marketAccount.proposal,
                    yesPool: Number(marketAccount.yesPool),
                    noPool: Number(marketAccount.noPool),
                    feePool: Number(marketAccount.feePool),
                    closesAt: Number(marketAccount.closesAt),
                    resolved: marketAccount.resolved,
                    outcomeYes: marketAccount.outcomeYes,
                });
            } catch (err: any) {
                if (err.message?.includes('Account does not exist')) {
                    console.log('Market account not found');
                } else {
                    console.error('Error fetching market:', err);
                    setError(err.message || 'Failed to fetch market');
                }
                setMarket(null);
            } finally {
                setLoading(false);
            }
        }

        fetchMarket();
    }, [connection, wallet.publicKey, marketPubkey?.toString()]);

    return { market, loading, error, refetch: () => { } };
}
