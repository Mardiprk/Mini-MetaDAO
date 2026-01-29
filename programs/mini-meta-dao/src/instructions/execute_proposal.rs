pub fn execute_proposal(
    ctx: Context<ExecuteProposal>,
    sol_amount: u64,    // lamports
    token_amount: u64,  // SPL token amount
) -> Result<()> {
    let dao = &ctx.accounts.dao;
    let proposal = &mut ctx.accounts.proposal;

    // ---------------- AUTH ----------------
    require!(
        ctx.accounts.admin.key() == dao.admin,
        MiniMetaDaoError::Unauthorized
    );

    require!(
        !proposal.executed,
        MiniMetaDaoError::ProposalAlreadyExecuted
    );

    // ---------------- SOL TRANSFER (CPI #1) ----------------
    let treasury_bump = *ctx.bumps.get("treasury").unwrap();
    let treasury_seeds: &[&[u8]] = &[TREASURY_SEED, &[treasury_bump]];

    let sol_ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.treasury.key(),
        &ctx.accounts.admin.key(),
        sol_amount,
    );

    anchor_lang::solana_program::program::invoke_signed(
        &sol_ix,
        &[
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.admin.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[treasury_seeds],
    )?;

    // ---------------- SPL TOKEN TRANSFER (CPI #2) ----------------
    let cpi_accounts = Transfer {
        from: ctx.accounts.treasury_token_account.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.treasury.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        &[treasury_seeds],
    );

    token::transfer(cpi_ctx, token_amount)?;

    // ---------------- FINALIZE ----------------
    proposal.executed = true;

    Ok(())
}
