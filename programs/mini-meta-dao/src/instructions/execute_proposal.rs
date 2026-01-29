use anchor_lang::prelude::*;
use crate::state::{Proposal, Dao};
use crate::errors::MiniMetaDaoError;
use crate::constants::*;

#[event]
pub struct ProposalExecuted {
    pub proposal: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub dao: Account<'info, Dao>,

    #[account(mut)]
    pub proposal: Account<'info, Proposal>,

    /// CHECK: DAO treasury PDA
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury: UncheckedAccount<'info>,

    /// Recipient of funds (for MVP, passed in)
    /// CHECK: validated by proposal logic
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn execute_proposal(
    ctx: Context<ExecuteProposal>,
    amount: u64, // lamports to transfer
) -> Result<()> {
    let dao = &ctx.accounts.dao;
    let proposal = &mut ctx.accounts.proposal;

    // --- Authorization ---
    require!(
        ctx.accounts.admin.key() == dao.admin,
        MiniMetaDaoError::Unauthorized
    );

    // --- State checks ---
    require!(
        !proposal.executed,
        MiniMetaDaoError::ProposalAlreadyExecuted
    );

    // --- Transfer SOL from treasury PDA ---
    let seeds = &[TREASURY_SEED, &[ctx.bumps.treasury]];

    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.treasury.key(),
        &ctx.accounts.recipient.key(),
        amount,
    );

    anchor_lang::solana_program::program::invoke_signed(
        &ix,
        &[
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.recipient.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[seeds],
    )?;

    // --- Mark proposal executed ---
    proposal.executed = true;

    emit!(ProposalExecuted {
        proposal: proposal.key(),
        recipient: ctx.accounts.recipient.key(),
        amount,
    });

    Ok(())
}
