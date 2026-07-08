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

    // Should not panic - initialization successful
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

  #[test]
  fn test_verify_profile() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SkillOracleContract);
    let client = SkillOracleContractClient::new(&env, &contract_id);

    let admin = Address::random(&env);
    let wallet = Address::random(&env);

    client.initialize(&admin);

    // Submit proof first
    client.submit_proof(&wallet, &String::from_small_slice(&env, "hash1"), &1, &50);

    // Verify profile
    client.verify_profile(&wallet);

    let profile = client.get_profile(&wallet).unwrap();
    assert_eq!(profile.is_verified, true);
  }
}
