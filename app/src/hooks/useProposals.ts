import { useEffect, useState } from 'react';
import { useDao } from './useDao';
import { getProposalPDA, getMarketPDA } from '@/lib/pdas';

export function useProposals() {
    const { program, dao, loading: daoLoading } = useDao();
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProposals = async () => {
        if (!program || !dao) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const count = dao.proposalCount.toNumber();
            const proposalData = [];

            // Fetch proposals in reverse order (newest first)
            for (let i = count - 1; i >= 0; i--) {
                const [proposalPda] = getProposalPDA(i);
                try {
                    const proposal = await (program.account as any).proposal.fetch(proposalPda);
                    const [marketPda] = getMarketPDA(proposalPda);

                    try {
                        const market = await (program.account as any).market.fetch(marketPda);
                        proposalData.push({
                            ...proposal,
                            publicKey: proposalPda,
                            marketAccount: market,
                            marketPda
                        });
                    } catch (marketErr: any) {
                        console.warn(`Market missing for proposal ${i}, skipping:`, marketPda.toBase58());
                    }
                } catch (err: any) {
                    if (!err.message?.includes('Account does not exist')) {
                        console.error(`Unexpected error fetching proposal ${i}:`, err);
                    }
                }
            }
            setProposals(proposalData);
        } catch (err) {
            console.error('Error fetching proposals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, [program, dao]);

    return { proposals, loading: loading || daoLoading, refresh: fetchProposals };
}
