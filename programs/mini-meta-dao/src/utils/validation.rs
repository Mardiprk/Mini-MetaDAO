use anchor_lang::prelude::*;
use crate::errors::MiniMetaDaoError;
use crate::constants::*;

pub fn validate_market_duration(duration: i64) -> Result<()>{
    require!(
        duration >= MIN_MARKET_DURATION && duration <= MAX_MARKET_DURATION,
        MiniMetaDaoError::InvalidMarketDuration
    );
    Ok(())
}

pub fn validate_bet_amount(amount: u64) -> Result<()>{
    require!(
        amount >= MIN_BET_AMOUNT,
        MiniMetaDaoError::BetTooSmall
    );
    Ok(())
}