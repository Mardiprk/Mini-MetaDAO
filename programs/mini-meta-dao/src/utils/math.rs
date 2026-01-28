pub fn yes_price(yes: u64, no: u64) -> Option<f64> {
    let total = yes.checked_add(no)?;

    if total == 0 {
        return None;
    }

    Some(yes as f64 / total as f64)
}