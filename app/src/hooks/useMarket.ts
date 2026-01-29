import { useEffect, useState, useMemo } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '@/lib/anchor';
import { PublicKey } from '@solana/web3.js';

export function useMarket(marketPda?: PublicKey) {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [market, setMarket] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const program = useMemo(() => {
        if (!wallet) return null;
        return getProgram(connection, wallet);
    }, [connection, wallet]);

    const fetchMarket = async () => {
        if (!program || !marketPda) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const marketAccount = await (program.account as any).market.fetch(marketPda);
            setMarket(marketAccount);
        } catch (err) {
            console.error('Error fetching market:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarket();
    }, [program, marketPda?.toBase58()]);

    return { market, loading, refresh: fetchMarket };
}
