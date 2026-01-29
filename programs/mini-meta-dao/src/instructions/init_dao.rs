use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::state::Dao;
use crate::constants::*;

#[derive(Accounts)]
pub struct InitDao<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 32 + 8,
        seeds = [DAO_SEED],
        bump
    )]
    pub dao: Account<'info, Dao>,

    /// CHECK: treasury PDA
    #[account(
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury: UncheckedAccount<'info>,

    pub governance_mint: Account<'info, Mint>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn init_dao(ctx: Context<InitDao>) -> Result<()> {
    let dao = &mut ctx.accounts.dao;

    dao.admin = ctx.accounts.admin.key();
    dao.treasury = ctx.accounts.treasury.key();
    dao.governance_mint = ctx.accounts.governance_mint.key();
    dao.proposal_count = 0;

    Ok(())
}
