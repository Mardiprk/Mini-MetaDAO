use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod state;
pub mod instructions;
pub mod utils;

pub use instructions::*;

declare_id!("BRrZTP9GnkFpGfbXjeG754X2NdKZN4h2rkfgtX9kPMWV");

#[program]
pub mod mini_meta_dao {
    use super::*;

    pub fn init_dao(ctx: Context<InitDao>) -> Result<()> {
        instructions::init_dao(ctx)
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        description: String,
    ) -> Result<()> {
        instructions::create_proposal(ctx, description)
    }

    pub fn open_market(
        ctx: Context<OpenMarket>,
        duration: i64,
    ) -> Result<()> {
        instructions::open_market(ctx, duration)
    }

    pub fn buy_yes(
        ctx: Context<BuyYes>,
        amount: u64,
    ) -> Result<()> {
        instructions::buy_yes(ctx, amount)
    }

    pub fn buy_no(
        ctx: Context<BuyNo>,
        amount: u64,
    ) -> Result<()> {
        instructions::buy_no(ctx, amount)
    }

    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        outcome_yes: bool,
    ) -> Result<()> {
        instructions::resolve_market(ctx, outcome_yes)
    }

    pub fn redeem(ctx: Context<Redeem>) -> Result<()> {
        instructions::redeem(ctx)
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>, sol_amount: u64, token_amount: u64) -> Result<()> {
        instructions::execute_proposal(ctx, sol_amount, token_amount)
    }
}