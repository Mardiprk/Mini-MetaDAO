'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '@/lib/anchor';
import { getPositionPDA } from '@/lib/pdas';
import { Position } from '@/lib/types';

export function usePosition(marketPubkey: PublicKey | null) {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [position, setPosition] = useState<Position | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPosition() {
            try {
                setLoading(true);
                setError(null);

                if (!wallet.publicKey || !marketPubkey) {
                    setPosition(null);
                    setLoading(false);
                    return;
                }

                const program = getProgram(connection, wallet as any);
                const [positionPDA] = getPositionPDA(marketPubkey, wallet.publicKey);

                try {
                    const positionAccount = await (program.account as any).position.fetch(positionPDA);

                    setPosition({
                        bettor: positionAccount.bettor,
                        market: positionAccount.market,
                        amount: Number(positionAccount.amount),
                        isYes: positionAccount.isYes,
                        redeemed: positionAccount.redeemed,
                    });
                } catch (err) {
                    // Position doesn't exist yet - this is normal
                    setPosition(null);
                }
            } catch (err: any) {
                console.error('Error fetching position:', err);
                setError(err.message || 'Failed to fetch position');
                setPosition(null);
            } finally {
                setLoading(false);
            }
        }

        fetchPosition();
    }, [connection, wallet.publicKey, marketPubkey?.toString()]);

    return { position, loading, error };
}
