use anchor_lang::prelude::*;
use crate::state::{Market, Position};
use crate::utils::*;
use crate::errors::MiniMetaDaoError;

#[derive(Accounts)]
pub struct BuyYes<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = bettor,
        space = 8 + 32 + 32 + 8 + 1 + 1,
        seeds = [b"position", market.key().as_ref(), bettor.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,

    #[account(mut)]
    pub bettor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn buy_yes(ctx: Context<BuyYes>, amount: u64) -> Result<()> {
    validate_bet_amount(amount)?;
    require!(
        !is_expired(ctx.accounts.market.closes_at)?,
        MiniMetaDaoError::MarketClosed
    );

    let (net_amount, fee) = apply_fee(amount);

    // Transfer full amount
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.bettor.key(),
        &ctx.accounts.market.key(),
        amount,
    );

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.bettor.to_account_info(),
            ctx.accounts.market.to_account_info(),
        ],
    )?;

    let market = &mut ctx.accounts.market;

    market.yes_pool = market.yes_pool
        .checked_add(net_amount)
        .ok_or(MiniMetaDaoError::Overflow)?;
    market.fee_pool = market.fee_pool
        .checked_add(fee)
        .ok_or(MiniMetaDaoError::Overflow)?;

    let position = &mut ctx.accounts.position;
    position.bettor = ctx.accounts.bettor.key();
    position.market = market.key();
    position.amount = net_amount;
    position.is_yes = true;
    position.redeemed = false;

    Ok(())
}
