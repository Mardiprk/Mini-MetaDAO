use anchor_lang::prelude::*;
use crate::errors::MiniMetaDaoError;
use crate::state::{Dao, Proposal};
use crate::constants::*;

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut, seeds = [DAO_SEED], bump)]
    pub dao: Account<'info, Dao>,

    #[account(
        init,
        payer = creator,
        space = 8 + 8 + 32 + 32 + 1 + 200,
        seeds = [PROPOSAL_SEED, dao.proposal_count.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    description: String,
) -> Result<()> {
    let dao = &mut ctx.accounts.dao;
    let proposal = &mut ctx.accounts.proposal;

    proposal.id = dao.proposal_count;
    proposal.creator = ctx.accounts.creator.key();
    proposal.description = description;
    proposal.market = Pubkey::default();
    proposal.executed = false;

    dao.proposal_count = dao.proposal_count.checked_add(1).ok_or(MiniMetaDaoError::Overflow)?;

    Ok(())
}
