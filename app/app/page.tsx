'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram, PublicKey } from '@solana/web3.js';
import { useDao } from "@/src/hooks/useDao";
import { useProposals } from "@/src/hooks/useProposals";
import ProposalCard from '@/components/ProposalCard';
import { getProgram } from '@/lib/anchor';
import { getDaoPDA, getProposalPDA } from "@/src/lib/pdas";

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { dao, loading: daoLoading } = useDao();
  const { proposals, loading: proposalsLoading } = useProposals(dao?.proposalCount || null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init DAO state
  const [govMint, setGovMint] = useState('');
  const [initializing, setInitializing] = useState(false);

  const handleInitDao = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet');
      return;
    }

    if (!govMint.trim()) {
      setError('Please enter a governance mint address');
      return;
    }

    try {
      setInitializing(true);
      setError(null);

      const program = getProgram(connection, wallet as any);
      const [daoPDA] = getDaoPDA();
      const governanceMintPubkey = new PublicKey(govMint);

      const tx = await program.methods
        .initDao()
        .accounts({
          dao: daoPDA,
          governanceMint: governanceMintPubkey,
          admin: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('DAO initialized:', tx);
      window.location.reload();
    } catch (err: any) {
      console.error('Error initializing DAO:', err);
      setError(err.message || 'Failed to initialize DAO');
    } finally {
      setInitializing(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const program = getProgram(connection, wallet as any);
      const [daoPDA] = getDaoPDA();
      const [proposalPDA] = getProposalPDA(dao!.proposalCount);

      const tx = await program.methods
        .createProposal(description)
        .accounts({
          dao: daoPDA,
          proposal: proposalPDA,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Proposal created:', tx);
      setDescription('');
      setShowCreateModal(false);
      // Reload page to fetch new proposals
      window.location.reload();
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError(err.message || 'Failed to create proposal');
    } finally {
      setCreating(false);
    }
  };

  if (!wallet.publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight font-outfit">
              Governance through <span className="text-blue-600">conviction</span>
            </h1>
            <p className="text-slate-500 text-lg sm:text-xl leading-relaxed">
              Mini Meta DAO enables futarchy-inspired decision making. Connect your wallet to participate in market-driven governance on Solana.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 rounded-full glass-panel text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200">
              Solana Mainnet
            </div>
            <div className="px-4 py-2 rounded-full glass-panel text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200">
              Futarchy Protocol
            </div>
          </div>

          <div className="w-full max-w-md p-8 premium-card rounded-3xl space-y-6">
            <div className="h-48 rounded-2xl bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-slate-400 text-sm font-medium">Connect wallet to begin</div>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              By connecting your wallet, you agree to the protocol's terms and conditions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (daoLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-slate-500 mt-4">Loading DAO...</p>
        </div>
      </div>
    );
  }

  if (!dao && !daoLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8 py-20">
        <div className="w-full max-w-xl premium-card rounded-3xl p-10 text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 font-outfit">Bootstrap DAO</h1>
            <p className="text-slate-500 text-sm">
              Initialize the Meta DAO governance parameters for this protocol.
            </p>
          </div>

          <div className="text-left space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Governance Mint Address</label>
            <input
              type="text"
              value={govMint}
              onChange={(e) => setGovMint(e.target.value)}
              placeholder="e.g. EPjFWivR..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleInitDao}
            disabled={initializing || !govMint}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
          >
            {initializing ? 'Processing...' : 'Initialize DAO'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero / Summary */}
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-10 border-b border-slate-200/60">
          <div className="max-w-2xl space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">
              Mini Meta DAO
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight font-outfit">
              Market-driven governance
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Harness collective intelligence through futarchy. Let the market decide which proposals align with the DAO's long-term value.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Proposals</span>
              <span className="text-3xl font-bold text-slate-900 font-outfit">
                {dao ? Number(dao.proposalCount) : '0'}
              </span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              Create Proposal
            </button>
          </div>
        </section>

        {/* Proposals Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Live & past proposals</h2>
          </div>

          {proposalsLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-slate-500 mt-4">Loading proposals...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-16 bg-white/80 border border-dashed border-slate-300 rounded-2xl">
              <p className="text-slate-600 text-lg">No proposals yet</p>
              <p className="text-slate-500 text-sm mt-2">Create the first proposal to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((proposalData) => (
                <ProposalCard key={proposalData.proposal.id} data={proposalData} />
              ))}
            </div>
          )}
        </section>

        {/* Create Proposal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Create proposal</h2>
              <p className="text-sm text-slate-500 mb-4">
                Draft a clear, outcome-focused question your market will trade on.
              </p>

              <div className="mb-4">
                <label className="block text-sm text-slate-600 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your proposal..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/60 min-h-[120px]"
                  disabled={creating}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setDescription('');
                    setError(null);
                  }}
                  disabled={creating}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProposal}
                  disabled={creating || !description.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
