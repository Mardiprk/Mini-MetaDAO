import { PublicKey } from '@solana/web3.js';

export interface Dao {
    admin: PublicKey;
    treasury: PublicKey;
    governanceMint: PublicKey;
    proposalCount: number;
}

export interface Proposal {
    id: number;
    creator: PublicKey;
    description: string;
    market: PublicKey;
    executed: boolean;
}

export interface Market {
    proposal: PublicKey;
    yesPool: number;
    noPool: number;
    feePool: number;
    closesAt: number;
    resolved: boolean;
    outcomeYes: boolean;
}

export interface Position {
    bettor: PublicKey;
    market: PublicKey;
    amount: number;
    isYes: boolean;
    redeemed: boolean;
}

export interface ProposalWithMarket {
    proposal: Proposal;
    proposalPubkey: PublicKey;
    market: Market | null;
    marketPubkey: PublicKey | null;
}
