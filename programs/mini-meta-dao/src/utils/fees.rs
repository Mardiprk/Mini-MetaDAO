use crate::constants::*;

pub fn calculate_fee(amount: u64) -> u64 {
    amount
        .checked_mul(FEE_BPS)
        .unwrap()
        .checked_div(BPS_DENOMINATOR)
        .unwrap()
}

pub fn apply_fee(amount: u64) -> (u64, u64) {
    let fee = calculate_fee(amount);
    let net_amount = amount.checked_sub(fee).unwrap();
    (net_amount, fee)
}