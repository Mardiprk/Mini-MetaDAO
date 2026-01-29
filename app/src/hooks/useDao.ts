import { useEffect, useState, useMemo } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '@/lib/anchor';
import { getDaoPDA } from '@/lib/pdas';
import { PublicKey } from '@solana/web3.js';

export function useDao() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [dao, setDao] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const program = useMemo(() => {
        if (!wallet) return null;
        return getProgram(connection, wallet);
    }, [connection, wallet]);

    const fetchDao = async () => {
        if (!program) return;
        setLoading(true);
        try {
            const [daoPda] = getDaoPDA();
            const daoAccount = await (program.account as any).dao.fetch(daoPda);
            setDao(daoAccount);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching DAO:', err);
            // Handle "Account does not exist" gracefully as per requirements
            if (err.message && err.message.includes('Account does not exist')) {
                setError('DAO not initialized');
            } else {
                setError(err.message || 'Failed to fetch DAO');
            }
            setDao(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDao();
    }, [program]);

    return { dao, loading, error, refresh: fetchDao, program };
}
