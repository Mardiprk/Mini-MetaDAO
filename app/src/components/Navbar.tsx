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
        <nav className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                <div className="flex justify-between items-center h-14 w-full">
                    <Link href="/" className="flex items-center space-x-3">
                        <img src="/minimetadao.png" alt="Mini Meta DAO" className="w-8 h-8 rounded-lg shadow-sm" />
                        <div className="text-xl font-medium tracking-tight text-slate-900 font-outfit">
                            MiniMetaDAO
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        {mounted && (
                            <WalletMultiButton className="!h-9 !px-4 !text-sm !transition-all hover:!opacity-90" />
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
