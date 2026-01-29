import { useCallback } from 'react';
import { toast } from 'sonner';
import { parseError } from '@/lib/errors';

export function useTx() {
    const handleTx = useCallback(async (
        txPromise: Promise<string>,
        loadingMsg: string = 'Sending transaction...',
        successMsg: string = 'Transaction confirmed'
    ) => {
        const toastId = toast.loading(loadingMsg);

        try {
            const signature = await txPromise;
            toast.success(successMsg, {
                id: toastId,
                description: `Signature: ${signature.slice(0, 8)}...`,
                action: {
                    label: 'View',
                    onClick: () => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank')
                }
            });
            return { signature, error: null };
        } catch (error: any) {
            console.error('Transaction error:', error);
            const errorMessage = parseError(error);
            toast.error(errorMessage, {
                id: toastId,
            });
            return { signature: null, error: errorMessage };
        }
    }, []);

    return { handleTx };
}
