'use client';

import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import idl from '@/idl/mini_meta_dao.json'

export function getProgram(connection: Connection, wallet: AnchorWallet) {
    const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
    });

    return new Program(idl as any, provider);
}

export function getConnection(): Connection {
    return new Connection('https://api.devnet.solana.com', 'confirmed');
}
