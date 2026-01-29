use anchor_lang::prelude::*;

#[error_code]
pub enum MiniMetaDaoError {
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Market is already closed")]
    MarketClosed,
    #[msg("Market is still active")]
    MarketStillActive,
    #[msg("Market already resolved")]
    MarketAlreadyResolved,
    #[msg("Market not yet resolved")]
    MarketNotResolved,
    #[msg("Invalid market duration")]
    InvalidMarketDuration,
    #[msg("Bet amount too small")]
    BetTooSmall,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Proposal already executed")]
    ProposalAlreadyExecuted,
    #[msg("Invalid outcome")]
    InvalidOutcome,
    #[msg("Math Overflow")]
    Overflow,
}
