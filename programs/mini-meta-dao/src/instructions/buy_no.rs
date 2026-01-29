use anchor_lang::prelude::*;
use crate::state::{Market, Position};
use crate::utils::*;
use crate::errors::MiniMetaDaoError;

#[derive(Accounts)]
pub struct BuyNo<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = bettor,
        space = 8 + 32 + 32 + 8 + 1 + 1,
        seeds = [
            b"position",
            market.key().as_ref(),
            bettor.key().as_ref()
        ],
        bump
    )]
    pub position: Account<'info, Position>,

    #[account(mut)]
    pub bettor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn buy_no(ctx: Context<BuyNo>, amount: u64) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let position = &mut ctx.accounts.position;

    validate_bet_amount(amount)?;
    require!(
        !is_expired(market.closes_at)?,
        MiniMetaDaoError::MarketClosed
    );

    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.bettor.key(),
        &market.key(),
        amount,
    );

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.bettor.to_account_info(),
            market.to_account_info(),
        ],
    )?;

    market.no_pool = market.no_pool.checked_add(amount).ok_or(MiniMetaDaoError::Overflow)?;

    position.bettor = ctx.accounts.bettor.key();
    position.market = market.key();
    position.amount = amount;
    position.is_yes = false;
    position.redeemed = false;

    Ok(())
}
