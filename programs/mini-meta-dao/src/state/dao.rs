use anchor_lang::prelude::Pubkey;

pub struct Dao{
    pub admin: Pubkey,
    pub treasory: Pubkey,
    pub governance_mint: Pubkey,
    pub proposal_count: u64,
}