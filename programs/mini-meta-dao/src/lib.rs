use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod utils;
pub mod state;
pub mod instructions;

pub use instructions::*;

declare_id!("BvRfHqJ1cMg8EFcKj7A3qNxJhbmD8okDzF8LQintszR9");

#[program]
pub mod mini_meta_dao {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
