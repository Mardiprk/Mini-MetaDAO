use anchor_lang::prelude::*;
use crate::errors::MiniMetaDaoError;
use crate::state::{Proposal, Market};
use crate::utils::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct OpenMarket<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 8 + 8 + 8 + 1 + 1,
        seeds = [MARKET_SEED, proposal.key().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn open_market(
    ctx: Context<OpenMarket>,
    duration: i64,
) -> Result<()> {
    validate_market_duration(duration)?;

    let market = &mut ctx.accounts.market;
    let now = now_ts()?;

    market.proposal = ctx.accounts.proposal.key();
    market.yes_pool = 0;
    market.no_pool = 0;
    market.closes_at = now.checked_add(duration).ok_or(MiniMetaDaoError::Overflow)?;
    market.resolved = false;
    market.outcome_yes = false;

    ctx.accounts.proposal.market = market.key();
    Ok(())
}
