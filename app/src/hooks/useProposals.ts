'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '@/lib/anchor';
import { getProposalPDA, getMarketPDA } from '@/lib/pdas';
import { ProposalWithMarket } from '@/lib/types';

export function useProposals(proposalCount: number | null) {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [proposals, setProposals] = useState<ProposalWithMarket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProposals() {
            try {
                setLoading(true);
                setError(null);

                if (!wallet.publicKey || proposalCount === null || proposalCount === 0) {
                    setProposals([]);
                    setLoading(false);
                    return;
                }

                const program = getProgram(connection, wallet as any);
                const proposalsData: ProposalWithMarket[] = [];

                for (let i = 0; i < proposalCount; i++) {
                    const [proposalPDA] = getProposalPDA(i);

                    try {
                        const proposalAccount = await (program.account as any).proposal.fetch(proposalPDA);

                        const proposal = {
                            id: Number(proposalAccount.id),
                            creator: proposalAccount.creator,
                            description: proposalAccount.description,
                            market: proposalAccount.market,
                            executed: proposalAccount.executed,
                        };

                        let market = null;
                        let marketPubkey = null;

                        // Check if market exists (not default pubkey)
                        if (!proposalAccount.market.equals(PublicKey.default)) {
                            const [marketPDA] = getMarketPDA(proposalPDA);
                            marketPubkey = marketPDA;

                            try {
                                const marketAccount = await (program.account as any).market.fetch(marketPDA);
                                market = {
                                    proposal: marketAccount.proposal,
                                    yesPool: Number(marketAccount.yesPool),
                                    noPool: Number(marketAccount.noPool),
                                    feePool: Number(marketAccount.feePool),
                                    closesAt: Number(marketAccount.closesAt),
                                    resolved: marketAccount.resolved,
                                    outcomeYes: marketAccount.outcomeYes,
                                };
                            } catch (err) {
                                console.log(`Market not found for proposal ${i}`);
                            }
                        }

                        proposalsData.push({
                            proposal,
                            proposalPubkey: proposalPDA,
                            market,
                            marketPubkey,
                        });
                    } catch (err) {
                        console.error(`Error fetching proposal ${i}:`, err);
                    }
                }

                setProposals(proposalsData);
            } catch (err: any) {
                console.error('Error fetching proposals:', err);
                setError(err.message || 'Failed to fetch proposals');
                setProposals([]);
            } finally {
                setLoading(false);
            }
        }

        fetchProposals();
    }, [connection, wallet.publicKey, proposalCount]);

    return { proposals, loading, error };
}
