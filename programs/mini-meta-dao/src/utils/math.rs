pub fn yes_price(yes: u64, no: u64) -> f64 {
    if yes + no == 0 {
        0.5
    } else {
        yes as f64 / (yes + no) as f64
    }
}

pub fn no_price(yes: u64, no: u64) -> f64 {
    1.0 - yes_price(yes, no)
}
