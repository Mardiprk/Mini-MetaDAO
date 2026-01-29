'use client';

import { useDao } from '@/hooks/useDao';
import { useProposals } from '@/hooks/useProposals';
import { useTx } from '@/hooks/useTx';
import ProposalRow from '@/components/ProposalRow';
import { useState } from 'react';
import { Plus, LayoutGrid, AlertCircle, Loader2, Sparkles, BarChart3, Users } from 'lucide-react';

export default function HomePage() {
  const { dao, loading: daoLoading, error: daoError, refresh: refreshDao, program } = useDao();
  const { proposals, loading: proposalsLoading, refresh: refreshProposals } = useProposals();
  const { handleTx } = useTx();

  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !description || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tx = (program.methods as any).createProposal(description).rpc();
      const { error } = await handleTx(tx, 'Creating proposal...', 'Proposal has been broadcasted');

      if (!error) {
        setDescription('');
        refreshDao();
        refreshProposals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (daoLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Syncing with Solana</p>
      </div>
    );
  }

  if (daoError) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Network Connection Issue</h2>
        <p className="text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">{daoError}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-98"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
          <span className="text-[11px] text-blue-700 font-bold uppercase tracking-widest">Devnet Live</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
          The Prediction <br />
          <span className="text-blue-600">Governance</span> Protocol
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          MiniMetaDAO uses decentralized prediction markets to drive impactful community decisions with speed and transparency.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <BarChart3 size={18} className="text-blue-500" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Proposals</div>
              <div className="text-lg font-bold text-slate-900 leading-tight">{dao?.proposalCount?.toString() || '0'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <Users size={18} className="text-emerald-500" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Markets</div>
              <div className="text-lg font-bold text-slate-900 leading-tight">
                {proposals.filter(p => !p.marketAccount.resolved).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Proposal Form */}
      <div className="mb-20">
        <form onSubmit={handleCreateProposal} className="relative group max-w-3xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur-xl opacity-10 group-focus-within:opacity-20 transition duration-500" />
          <div className="relative bg-white border border-slate-200 rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5 text-slate-900 mb-1">
                <Sparkles size={18} className="text-blue-600" />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Start a Discussion</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What should the DAO decide next?"
                  className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-slate-900 font-medium focus:outline-none focus:border-blue-500/20 focus:bg-white transition-all placeholder:text-slate-300"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !description}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    "Broadcast"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Proposal List Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl">
              <LayoutGrid size={20} className="text-slate-900" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Governance Queue</h2>
          </div>
          <button
            onClick={refreshProposals}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
          >
            Refresh Feed
          </button>
        </div>

        {proposalsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutGrid size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Stable connection, no active proposals</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {proposals.map((proposal) => (
              <ProposalRow key={proposal.id.toString()} proposal={proposal} />
            ))}
          </div>
        )}
      </div>

      <footer className="mt-32 pt-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
          MiniMetaDAO &copy; 2026 • Powered by Solana
        </p>
      </footer>
    </div>
  );
}
