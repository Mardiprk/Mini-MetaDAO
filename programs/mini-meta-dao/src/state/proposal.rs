use anchor_lang::prelude::Pubkey;

pub struct Proposal{
    pub id: u64,
    pub creator: Pubkey,
    pub description: String,
    pub market: Pubkey,
    pub executed: bool,
}