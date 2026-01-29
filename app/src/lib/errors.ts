import { AnchorError } from '@coral-xyz/anchor';

export function parseError(error: any): string {
    if (!error) return 'Unknown error';

    // Handle Anchor Errors
    if (error instanceof AnchorError) {
        return error.error.errorMessage;
    }

    // Handle string errors
    if (typeof error === 'string') return error;

    // Handle object errors with message
    const message = error.message || error.toString();

    // Common Solana error patterns
    if (message.includes('User rejected the request')) {
        return 'Transaction rejected by user';
    }
    if (message.includes('0x1770')) return 'Unauthorized action';
    if (message.includes('0x1771')) return 'Market is already closed';
    if (message.includes('0x1772')) return 'Market is still active';
    if (message.includes('0x1773')) return 'Market already resolved';
    if (message.includes('0x1774')) return 'Market not yet resolved';
    if (message.includes('0x1775')) return 'Invalid market duration';
    if (message.includes('0x1776')) return 'Bet amount too small';
    if (message.includes('0x1777')) return 'Insufficient funds';
    if (message.includes('0x1778')) return 'Proposal already executed';
    if (message.includes('0x1779')) return 'Invalid outcome';
    if (message.includes('0x177a')) return 'Math Overflow';

    // Log messages often contain the real error
    if (error.logs) {
        const logs = error.logs as string[];
        for (const log of logs) {
            if (log.includes('Custom program error: 0x1770')) return 'Unauthorized action';
            if (log.includes('Custom program error: 0x1771')) return 'Market is already closed';
            if (log.includes('Custom program error: 0x1772')) return 'Market is still active';
            if (log.includes('Custom program error: 0x1773')) return 'Market already resolved';
            if (log.includes('Custom program error: 0x1774')) return 'Market not yet resolved';
            if (log.includes('Custom program error: 0x1775')) return 'Invalid market duration';
            if (log.includes('Custom program error: 0x1776')) return 'Bet amount too small';
            if (log.includes('Custom program error: 0x1777')) return 'Insufficient funds';
            if (log.includes('Custom program error: 0x1778')) return 'Proposal already executed';
            if (log.includes('Custom program error: 0x1779')) return 'Invalid outcome';
            if (log.includes('Custom program error: 0x177a')) return 'Math Overflow';
        }
    }

    if (message.includes('insufficient lamports')) {
        return 'Insufficient SOL balance';
    }

    if (message.includes('already in use')) {
        return 'Account already exists';
    }

    return message;
}
