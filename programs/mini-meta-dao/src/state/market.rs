use anchor_lang::prelude::*;

#[account]
pub struct Market {
    pub proposal: Pubkey,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub fee_pool: u64,
    pub closes_at: i64,
    pub resolved: bool,
    pub outcome_yes: bool,
}