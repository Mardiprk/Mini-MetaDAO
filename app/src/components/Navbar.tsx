'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 flex justify-center">
                <div className="flex justify-between items-center h-16 w-full">
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-slate-200 shadow-sm transform hover:scale-105 transition-transform cursor-pointer">
                            <img
                                src="/minimetadao.png"
                                alt="Mini Meta DAO Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-xl font-bold tracking-tight text-slate-900">
                            MiniMetaDAO
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        {mounted && (
                            <WalletMultiButton className="wallet-adapter-button-trigger" />
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
