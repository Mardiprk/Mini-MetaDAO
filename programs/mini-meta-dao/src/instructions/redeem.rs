use anchor_lang::prelude::*;
use crate::state::{Market, Position};
use crate::errors::MiniMetaDaoError;

#[derive(Accounts)]
pub struct Redeem<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        has_one = market,
        has_one = bettor
    )]
    pub position: Account<'info, Position>,

    #[account(mut)]
    pub bettor: Signer<'info>,
}

pub fn redeem(ctx: Context<Redeem>) -> Result<()> {
    let market = &ctx.accounts.market;
    let position = &mut ctx.accounts.position;

    require!(market.resolved, MiniMetaDaoError::MarketNotResolved);
    require!(!position.redeemed, MiniMetaDaoError::InvalidOutcome);
    require!(
        position.is_yes == market.outcome_yes,
        MiniMetaDaoError::InvalidOutcome
    );

    let winning_pool = if market.outcome_yes {
        market.yes_pool
    } else {
        market.no_pool
    };

    let losing_pool = if market.outcome_yes {
        market.no_pool
    } else {
        market.yes_pool
    };

    let payout = position.amount
        .checked_mul(losing_pool)
        .unwrap()
        .checked_div(winning_pool)
        .unwrap()
        .checked_add(position.amount)
        .unwrap();

    **ctx.accounts.market.to_account_info().try_borrow_mut_lamports()? -= payout;
    **ctx.accounts.bettor.to_account_info().try_borrow_mut_lamports()? += payout;

    position.redeemed = true;

    Ok(())
}
