'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getProgram } from '@/lib/anchor';
import { getDaoPDA } from '@/lib/pdas';
import { Dao } from '@/lib/types';

export function useDao() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [dao, setDao] = useState<Dao | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDao() {
            try {
                setLoading(true);
                setError(null);

                if (!wallet.publicKey) {
                    setDao(null);
                    setLoading(false);
                    return;
                }

                const program = getProgram(connection, wallet as any);
                const [daoPDA] = getDaoPDA();

                const daoAccount = await (program.account as any).dao.fetch(daoPDA);

                setDao({
                    admin: daoAccount.admin,
                    treasury: daoAccount.treasury,
                    governanceMint: daoAccount.governanceMint,
                    proposalCount: Number(daoAccount.proposalCount),
                });
            } catch (err: any) {
                if (err.message?.includes('Account does not exist')) {
                    console.log('DAO count not yet initialized');
                } else {
                    console.error('Error fetching DAO:', err);
                    setError(err.message || 'Failed to fetch DAO');
                }
                setDao(null);
            } finally {
                setLoading(false);
            }
        }

        fetchDao();
    }, [connection, wallet.publicKey]);

    return { dao, loading, error };
}
