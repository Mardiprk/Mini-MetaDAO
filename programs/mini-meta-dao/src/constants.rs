use anchor_lang::prelude::*;

// PDA Seeds
pub const DAO_SEED: &[u8] = b"dao";
pub const TREASURY_SEED: &[u8] = b"treasury";
pub const PROPOSAL_SEED: &[u8] = b"proposal";
pub const MARKET_SEED: &[u8] = b"market";

// 1 DAY
pub const MIN_MARKET_DURATION: i64 = 60 * 60 * 24;
// 7 DAY
pub const MAX_MARKET_DURATION: i64 = 60 * 60 * 24 * 7;

/// Economic parameters
pub const MIN_BET_AMOUNT: u64 = 1_000_000; // 0.001 SOL (lamports)
pub const FEE_BPS: u64 = 200; // 2% fee (basis points)
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Pricing
pub const PASS_THRESHOLD: f64 = 0.5;