use anchor_lang::prelude::*;
use crate::state::Market;
use crate::utils::*;
use crate::errors::MiniMetaDaoError;

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    pub resolver: Signer<'info>,
}

pub fn resolve_market(
    ctx: Context<ResolveMarket>,
    outcome_yes: bool,
) -> Result<()> {
    require!(is_expired(ctx.accounts.market.closes_at)?, MiniMetaDaoError::MarketStillActive);
    require!(!ctx.accounts.market.resolved, MiniMetaDaoError::MarketAlreadyResolved);

    ctx.accounts.market.resolved = true;
    ctx.accounts.market.outcome_yes = outcome_yes;
    Ok(())
}
