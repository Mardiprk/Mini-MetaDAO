use anchor_lang::prelude::*;
use crate::state::Proposal;
use crate::errors::MiniMetaDaoError;

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
}

pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    require!(!proposal.executed, MiniMetaDaoError::ProposalAlreadyExecuted);

    proposal.executed = true;
    Ok(())
}
