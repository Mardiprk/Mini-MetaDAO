use anchor_lang::prelude::*;

#[account]
pub struct Position {
    pub bettor: Pubkey,
    pub market: Pubkey,
    pub amount: u64,
    pub is_yes: bool,
    pub redeemed: bool,
}
