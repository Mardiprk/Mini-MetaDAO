use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::{Proposal, Dao};
use crate::errors::MiniMetaDaoError;
use crate::constants::*;

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub dao: Account<'info, Dao>,

    #[account(mut)]
    pub proposal: Account<'info, Proposal>,

    /// CHECK: DAO treasury PDA (SOL holder + token authority)
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury: UncheckedAccount<'info>,

    // -------- SPL TOKEN CPI ACCOUNTS --------

    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    // -------- AUTH --------

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn execute_proposal(
    ctx: Context<ExecuteProposal>,
    sol_amount: u64,
    token_amount: u64,
) -> Result<()> {
    let dao = &ctx.accounts.dao;
    let proposal = &mut ctx.accounts.proposal;

    // -------- AUTH --------
    require!(
        ctx.accounts.admin.key() == dao.admin,
        MiniMetaDaoError::Unauthorized
    );

    require!(
        !proposal.executed,
        MiniMetaDaoError::ProposalAlreadyExecuted
    );

    // -------- PDA SIGNER SETUP --------
    let treasury_bump = ctx.bumps.treasury;

    let treasury_seeds: &[&[u8]] = &[
        TREASURY_SEED,
        &[treasury_bump],
    ];

    let signer_seeds: &[&[&[u8]]] = &[treasury_seeds];

    // -------- SOL TRANSFER (CPI #1) --------
    let sol_ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.treasury.key(),
        &ctx.accounts.admin.key(),
        sol_amount,
    );

    anchor_lang::solana_program::program::invoke_signed(
        &sol_ix,
        &[
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.admin.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        signer_seeds,
    )?;

    // -------- SPL TOKEN TRANSFER (CPI #2) --------
    let cpi_accounts = Transfer {
        from: ctx.accounts.treasury_token_account.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.treasury.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );

    token::transfer(cpi_ctx, token_amount)?;

    // -------- FINALIZE --------
    proposal.executed = true;

    Ok(())
}
