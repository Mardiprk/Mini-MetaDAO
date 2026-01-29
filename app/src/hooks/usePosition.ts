import { useEffect, useState, useMemo } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '@/lib/anchor';
import { getPositionPDA } from '@/lib/pdas';
import { PublicKey } from '@solana/web3.js';

export function usePosition(marketPda?: PublicKey) {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [position, setPosition] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const program = useMemo(() => {
        if (!wallet) return null;
        return getProgram(connection, wallet);
    }, [connection, wallet]);

    const fetchPosition = async () => {
        if (!program || !wallet || !marketPda) {
            setLoading(false);
            setPosition(null);
            return;
        }
        setLoading(true);
        try {
            const [positionPda] = getPositionPDA(marketPda, wallet.publicKey);
            const positionAccount = await (program.account as any).position.fetch(positionPda);
            setPosition(positionAccount);
        } catch (err) {
            // "Account does not exist" is fine here, means no position
            setPosition(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosition();
    }, [program, wallet?.publicKey.toBase58(), marketPda?.toBase58()]);

    return { position, loading, refresh: fetchPosition };
}
