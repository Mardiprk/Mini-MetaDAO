use anchor_lang::prelude::*;
use crate::state::Dao;
use crate::constants::*;

pub fn init_dao(ctx: Context<InitDao>) -> Result<()>{
    
    Ok(())
}

#[derive(Accounts)]
pub struct InitDao<'info>{
    
}