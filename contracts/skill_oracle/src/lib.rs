#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, symbol_short};

#[contracttype]
pub struct SkillProfile {
    pub wallet: Address,
    pub total_score: u32,      // 0-1000
    pub github_score: u32,
    pub hackathon_score: u32,
    pub oss_score: u32,
    pub bugbounty_score: u32,
    pub freelance_score: u32,
    pub proof_count: u32,
    pub last_updated: u64,
    pub is_verified: bool,
}

#[contracttype]
pub struct ProofRecord {
    pub proof_hash: String,    // IPFS CID or SHA256
    pub proof_type: u32,       // 1=github 2=hackathon 3=oss 4=bugbounty 5=freelance
    pub score_delta: u32,
    pub timestamp: u64,
    pub submitter: Address,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Profile(Address),
    ProofHistory(Address),
}

#[contract]
pub struct SkillOracleContract;

#[contractimpl]
impl SkillOracleContract {
    /// Initialize the contract with an admin address
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        
        env.storage()
            .persistent()
            .set(&DataKey::Admin, &admin);
    }

    /// Submit a proof for a wallet (admin only)
    pub fn submit_proof(
        env: Env,
        wallet: Address,
        proof_hash: String,
        proof_type: u32,
        score_delta: u32,
    ) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .expect("Admin not set");
        
        admin.require_auth();

        // Validate proof type (1-5)
        assert!(proof_type >= 1 && proof_type <= 5, "Invalid proof type");

        // Get or create profile
        let mut profile: SkillProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Profile(wallet.clone()))
            .unwrap_or_else(|| SkillProfile {
                wallet: wallet.clone(),
                total_score: 0,
                github_score: 0,
                hackathon_score: 0,
                oss_score: 0,
                bugbounty_score: 0,
                freelance_score: 0,
                proof_count: 0,
                last_updated: env.ledger().timestamp(),
                is_verified: false,
            });

        // Update category score based on proof type
        match proof_type {
            1 => {
                // GitHub
                let new_score = core::cmp::min(profile.github_score + score_delta, 300);
                profile.github_score = new_score;
            }
            2 => {
                // Hackathon
                let new_score = core::cmp::min(profile.hackathon_score + score_delta, 200);
                profile.hackathon_score = new_score;
            }
            3 => {
                // OSS
                let new_score = core::cmp::min(profile.oss_score + score_delta, 250);
                profile.oss_score = new_score;
            }
            4 => {
                // Bug Bounty
                let new_score = core::cmp::min(profile.bugbounty_score + score_delta, 150);
                profile.bugbounty_score = new_score;
            }
            5 => {
                // Freelance
                let new_score = core::cmp::min(profile.freelance_score + score_delta, 100);
                profile.freelance_score = new_score;
            }
            _ => panic!("Invalid proof type"),
        }

        // Recalculate total score (cap at 1000)
        let total = (profile.github_score as u64
            + profile.hackathon_score as u64
            + profile.oss_score as u64
            + profile.bugbounty_score as u64
            + profile.freelance_score as u64) as u32;
        profile.total_score = core::cmp::min(total, 1000);

        profile.proof_count += 1;
        profile.last_updated = env.ledger().timestamp();

        // Store updated profile
        env.storage()
            .persistent()
            .set(&DataKey::Profile(wallet.clone()), &profile);

        // Record proof
        let proof = ProofRecord {
            proof_hash,
            proof_type,
            score_delta,
            timestamp: env.ledger().timestamp(),
            submitter: admin,
        };

        let mut proofs: Vec<ProofRecord> = env
            .storage()
            .persistent()
            .get(&DataKey::ProofHistory(wallet.clone()))
            .unwrap_or_else(|| Vec::new(&env));

        proofs.push_back(proof);
        env.storage()
            .persistent()
            .set(&DataKey::ProofHistory(wallet), &proofs);
    }

    /// Get full profile for a wallet
    pub fn get_profile(env: Env, wallet: Address) -> Option<SkillProfile> {
        env.storage()
            .persistent()
            .get(&DataKey::Profile(wallet))
    }

    /// Get total score only (efficient for verification)
    pub fn get_score(env: Env, wallet: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Profile(wallet))
            .map(|profile: SkillProfile| profile.total_score)
            .unwrap_or(0)
    }

    /// Get proof history for a wallet
    pub fn get_proofs(env: Env, wallet: Address) -> Vec<ProofRecord> {
        env.storage()
            .persistent()
            .get(&DataKey::ProofHistory(wallet))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Update a category score (admin only)
    pub fn update_score(
        env: Env,
        wallet: Address,
        category: u32,
        new_score: u32,
    ) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .expect("Admin not set");

        admin.require_auth();

        // Validate category (1-5)
        assert!(category >= 1 && category <= 5, "Invalid category");

        let mut profile: SkillProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Profile(wallet.clone()))
            .expect("Profile not found");

        match category {
            1 => profile.github_score = core::cmp::min(new_score, 300),
            2 => profile.hackathon_score = core::cmp::min(new_score, 200),
            3 => profile.oss_score = core::cmp::min(new_score, 250),
            4 => profile.bugbounty_score = core::cmp::min(new_score, 150),
            5 => profile.freelance_score = core::cmp::min(new_score, 100),
            _ => panic!("Invalid category"),
        }

        // Recalculate total
        let total = (profile.github_score as u64
            + profile.hackathon_score as u64
            + profile.oss_score as u64
            + profile.bugbounty_score as u64
            + profile.freelance_score as u64) as u32;
        profile.total_score = core::cmp::min(total, 1000);

        profile.last_updated = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Profile(wallet), &profile);
    }

    /// Verify a profile (admin marks as verified)
    pub fn verify_profile(env: Env, wallet: Address) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .expect("Admin not set");

        admin.require_auth();

        let mut profile: SkillProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Profile(wallet.clone()))
            .expect("Profile not found");

        profile.is_verified = true;
        profile.last_updated = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Profile(wallet), &profile);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Env as _};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SkillOracleContract);
        let client = SkillOracleContractClient::new(&env, &contract_id);

        let admin = Address::random(&env);
        client.initialize(&admin);

        // Should not panic
    }

    #[test]
    fn test_submit_proof_and_get_score() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SkillOracleContract);
        let client = SkillOracleContractClient::new(&env, &contract_id);

        let admin = Address::random(&env);
        let wallet = Address::random(&env);

        client.initialize(&admin);

        let proof_hash = String::from_small_slice(&env, "test_proof_hash_123");
        client.submit_proof(
            &wallet,
            &proof_hash,
            &1, // GitHub proof
            &50, // 50 points
        );

        let score = client.get_score(&wallet);
        assert_eq!(score, 50);
    }

    #[test]
    fn test_multiple_proofs() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SkillOracleContract);
        let client = SkillOracleContractClient::new(&env, &contract_id);

        let admin = Address::random(&env);
        let wallet = Address::random(&env);

        client.initialize(&admin);

        // Submit multiple proofs
        client.submit_proof(&wallet, &String::from_small_slice(&env, "hash1"), &1, &50);
        client.submit_proof(&wallet, &String::from_small_slice(&env, "hash2"), &2, &30);
        client.submit_proof(&wallet, &String::from_small_slice(&env, "hash3"), &3, &40);

        let score = client.get_score(&wallet);
        assert_eq!(score, 120);

        let profile = client.get_profile(&wallet).unwrap();
        assert_eq!(profile.github_score, 50);
        assert_eq!(profile.hackathon_score, 30);
        assert_eq!(profile.oss_score, 40);
        assert_eq!(profile.proof_count, 3);
    }

    #[test]
    fn test_score_caps() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SkillOracleContract);
        let client = SkillOracleContractClient::new(&env, &contract_id);

        let admin = Address::random(&env);
        let wallet = Address::random(&env);

        client.initialize(&admin);

        // Try to submit proofs that exceed category caps
        client.submit_proof(&wallet, &String::from_small_slice(&env, "hash1"), &1, &400);

        // Should be capped at 300
        let profile = client.get_profile(&wallet).unwrap();
        assert_eq!(profile.github_score, 300);
    }
}
