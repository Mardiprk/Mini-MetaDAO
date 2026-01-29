import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('BvRfHqJ1cMg8EFcKj7A3qNxJhbmD8okDzF8LQintszR9');

// PDA Seeds
export const DAO_SEED = Buffer.from('dao');
export const TREASURY_SEED = Buffer.from('treasury');
export const PROPOSAL_SEED = Buffer.from('proposal');
export const MARKET_SEED = Buffer.from('market');
export const POSITION_SEED = Buffer.from('position');

/**
 * Derive the DAO PDA
 */
export function getDaoPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([DAO_SEED], PROGRAM_ID);
}

/**
 * Derive the Treasury PDA
 */
export function getTreasuryPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([TREASURY_SEED], PROGRAM_ID);
}

/**
 * Derive a Proposal PDA
 * @param proposalId - The proposal count/ID
 */
export function getProposalPDA(proposalId: number): [PublicKey, number] {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(proposalId));
    return PublicKey.findProgramAddressSync([PROPOSAL_SEED, buffer], PROGRAM_ID);
}

/**
 * Derive a Market PDA
 * @param proposalPubkey - The proposal's public key
 */
export function getMarketPDA(proposalPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([MARKET_SEED, proposalPubkey.toBuffer()], PROGRAM_ID);
}

/**
 * Derive a Position PDA
 * @param marketPubkey - The market's public key
 * @param bettorPubkey - The bettor's public key
 */
export function getPositionPDA(marketPubkey: PublicKey, bettorPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [POSITION_SEED, marketPubkey.toBuffer(), bettorPubkey.toBuffer()],
        PROGRAM_ID
    );
}
