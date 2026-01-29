use anchor_lang::prelude::*;

pub fn now_ts()  -> Result<i64>{
    Ok(Clock::get()?.unix_timestamp)
}

pub fn is_expired(closes_at: i64) -> Result<bool>{
    let now = now_ts()?;
    Ok(now >= closes_at)
}