use anchor_lang::prelude::*;

#[account]
pub struct Dao{
    pub admin: Pubkey,
    pub treasory: Pubkey,
    pub governance_mint: Pubkey,
    pub proposal_count: u64,
}