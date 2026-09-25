#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token::Client as TokenClient,
    Address, Env, Symbol, Vec,
};

// ─── Storage Keys ────────────────────────────────────────────────────────────

const ESCROW_COUNTER: Symbol = symbol_short!("ESC_CTR");

fn escrow_storage_key(id: u32) -> Symbol {
    match id {
        0 => symbol_short!("ESC_0"),
        1 => symbol_short!("ESC_1"),
        2 => symbol_short!("ESC_2"),
        3 => symbol_short!("ESC_3"),
        4 => symbol_short!("ESC_4"),
        5 => symbol_short!("ESC_5"),
        6 => symbol_short!("ESC_6"),
        7 => symbol_short!("ESC_7"),
        8 => symbol_short!("ESC_8"),
        9 => symbol_short!("ESC_9"),
        10 => symbol_short!("ESC_A"),
        _ => panic!("Max 11 escrows in prototype, use persistent storage for production"),
    }
}

fn escrow_id_from_symbol(sym: &Symbol) -> u32 {
    if *sym == symbol_short!("ESC_0") { 0 }
    else if *sym == symbol_short!("ESC_1") { 1 }
    else if *sym == symbol_short!("ESC_2") { 2 }
    else if *sym == symbol_short!("ESC_3") { 3 }
    else if *sym == symbol_short!("ESC_4") { 4 }
    else if *sym == symbol_short!("ESC_5") { 5 }
    else if *sym == symbol_short!("ESC_6") { 6 }
    else if *sym == symbol_short!("ESC_7") { 7 }
    else if *sym == symbol_short!("ESC_8") { 8 }
    else if *sym == symbol_short!("ESC_9") { 9 }
    else if *sym == symbol_short!("ESC_A") { 10 }
    else { 0 }
}

// ─── Types ───────────────────────────────────────────────────────────────────

#[derive(Clone, PartialEq, Eq)]
#[contracttype]
pub enum EscrowStatus {
    Created,
    Funded,
    Partial,
    Completed,
    Disputed,
    Refunded,
}

#[derive(Clone, PartialEq, Eq)]
#[contracttype]
pub enum MilestoneStatus {
    Pending,
    Approved,
    Released,
    Disputed,
}

#[derive(Clone)]
#[contracttype]
pub struct Milestone {
    pub id: u32,
    pub description: Symbol,
    pub amount: i128,
    pub status: MilestoneStatus,
    pub approved_by: Option<Address>,
    pub released_at: Option<u64>,
}

#[derive(Clone)]
#[contracttype]
pub struct Escrow {
    pub id: Symbol,
    pub payer: Address,
    pub contractor: Address,
    pub token: Address,
    pub total_amount: i128,
    pub released_amount: i128,
    pub remaining_amount: i128,
    pub status: EscrowStatus,
    pub created_at: u64,
    pub funded_at: Option<u64>,
    pub milestones: Vec<Milestone>,
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Create a new escrow. Returns the escrow ID symbol.
    ///
    /// The first escrow uses key ESC_0 so frontends can iterate `0..count`.
    pub fn create_escrow(
        env: Env,
        payer: Address,
        contractor: Address,
        total_amount: i128,
        token: Address,
    ) -> Symbol {
        payer.require_auth();

        if total_amount <= 0 {
            panic!("Total amount must be positive");
        }

        let counter: u32 = env.storage().instance().get(&ESCROW_COUNTER).unwrap_or(0);
        // escrow_storage_key panics past id 10, so guard here for a clear error.
        let new_id = counter;
        let key = escrow_storage_key(new_id);
        env.storage().instance().set(&ESCROW_COUNTER, &(counter + 1));

        let now = env.ledger().timestamp();

        let escrow = Escrow {
            id: key.clone(),
            payer: payer.clone(),
            contractor,
            token,
            total_amount,
            released_amount: 0,
            remaining_amount: total_amount,
            status: EscrowStatus::Created,
            created_at: now,
            funded_at: None,
            milestones: Vec::new(&env),
        };

        env.storage().instance().set(&key, &escrow);

        key
    }

    /// Add a milestone to an escrow. Returns the milestone number.
    pub fn add_milestone(
        env: Env,
        escrow_id: Symbol,
        description: Symbol,
        amount: i128,
    ) -> u32 {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Created {
            panic!("Can only add milestones to created escrows");
        }

        if amount <= 0 {
            panic!("Milestone amount must be positive");
        }

        // Milestones must never promise more than the escrow holds.
        let mut planned: i128 = 0;
        for m in escrow.milestones.iter() {
            planned += m.amount;
        }
        if planned + amount > escrow.total_amount {
            panic!("Sum of milestone amounts exceeds total escrow amount");
        }

        let ms_count = escrow.milestones.len();
        let new_count = ms_count + 1;

        let milestone = Milestone {
            id: new_count,
            description,
            amount,
            status: MilestoneStatus::Pending,
            approved_by: None,
            released_at: None,
        };

        escrow.milestones.push_back(milestone);
        env.storage().instance().set(&escrow_id, &escrow);

        new_count
    }

    /// Fund the escrow — take real custody of `total_amount` tokens from the payer.
    pub fn fund_escrow(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Created {
            panic!("Escrow is not in Created status");
        }

        // Real settlement: move tokens into this contract BEFORE marking funded,
        // so a failed transfer never leaves a Funded escrow with no custody.
        let token = TokenClient::new(&env, &escrow.token);
        token.transfer(
            &escrow.payer,
            &env.current_contract_address(),
            &escrow.total_amount,
        );

        let now = env.ledger().timestamp();
        escrow.status = EscrowStatus::Funded;
        escrow.funded_at = Some(now);

        env.storage().instance().set(&escrow_id, &escrow);
    }

    /// Approve a milestone (payer confirms work is done).
    pub fn approve_milestone(env: Env, escrow_id: Symbol, milestone_id: u32) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Funded && escrow.status != EscrowStatus::Partial {
            panic!("Escrow not in active state");
        }

        let idx = (milestone_id - 1) as u32;
        if idx >= escrow.milestones.len() {
            panic!("Milestone not found");
        }

        let mut milestone = escrow.milestones.get(idx).unwrap();
        if milestone.status != MilestoneStatus::Pending {
            panic!("Milestone is not pending");
        }

        milestone.status = MilestoneStatus::Approved;
        milestone.approved_by = Some(escrow.payer.clone());

        escrow.milestones.set(idx, milestone);
        env.storage().instance().set(&escrow_id, &escrow);
    }

    /// Release funds for an approved milestone — pays the contractor in tokens.
    pub fn release_milestone(env: Env, escrow_id: Symbol, milestone_id: u32) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        let idx = (milestone_id - 1) as u32;
        if idx >= escrow.milestones.len() {
            panic!("Milestone not found");
        }

        let mut milestone = escrow.milestones.get(idx).unwrap();
        if milestone.status != MilestoneStatus::Approved {
            panic!("Milestone must be approved before release");
        }

        // Real settlement: pay the contractor BEFORE updating accounting,
        // so a failed transfer never books funds as released.
        let token = TokenClient::new(&env, &escrow.token);
        token.transfer(
            &env.current_contract_address(),
            &escrow.contractor,
            &milestone.amount,
        );

        let now = env.ledger().timestamp();
        milestone.status = MilestoneStatus::Released;
        milestone.released_at = Some(now);

        escrow.released_amount += milestone.amount;
        escrow.remaining_amount -= milestone.amount;

        // Accounting invariant: custody math must never exceed the funded total.
        if escrow.released_amount > escrow.total_amount {
            panic!("Released amount exceeds total escrow amount");
        }

        if escrow.released_amount >= escrow.total_amount {
            escrow.status = EscrowStatus::Completed;
        } else {
            escrow.status = EscrowStatus::Partial;
        }

        escrow.milestones.set(idx, milestone);
        env.storage().instance().set(&escrow_id, &escrow);
    }

    /// Open a dispute on a milestone.
    ///
    /// Either party may call: `caller` must authenticate and be the payer
    /// or the contractor of this escrow. The explicit `caller` param gives a
    /// real OR-auth — a single `require_auth` on one fixed party cannot
    /// express "payer OR contractor".
    pub fn open_dispute(env: Env, escrow_id: Symbol, milestone_id: u32, caller: Address) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        caller.require_auth();

        if caller != escrow.payer && caller != escrow.contractor {
            panic!("Only payer or contractor can open a dispute");
        }

        if escrow.status == EscrowStatus::Completed || escrow.status == EscrowStatus::Refunded {
            panic!("Cannot dispute completed or refunded escrows");
        }

        let idx = (milestone_id - 1) as u32;
        if idx >= escrow.milestones.len() {
            panic!("Milestone not found");
        }

        let mut milestone = escrow.milestones.get(idx).unwrap();
        milestone.status = MilestoneStatus::Disputed;
        escrow.status = EscrowStatus::Disputed;

        escrow.milestones.set(idx, milestone);
        env.storage().instance().set(&escrow_id, &escrow);
    }

    /// Refund remaining funds to payer (only when disputed) — returns custody.
    pub fn refund_escrow(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Disputed {
            panic!("Can only refund disputed escrows");
        }

        // Real settlement: return custody BEFORE zeroing the balance,
        // so a failed transfer never books a refund that never moved.
        let remaining = escrow.remaining_amount;
        let token = TokenClient::new(&env, &escrow.token);
        token.transfer(
            &env.current_contract_address(),
            &escrow.payer,
            &remaining,
        );

        escrow.status = EscrowStatus::Refunded;
        escrow.remaining_amount = 0;

        env.storage().instance().set(&escrow_id, &escrow);
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    /// Get escrow details
    pub fn get_escrow(env: Env, escrow_id: Symbol) -> Escrow {
        env.storage().instance().get(&escrow_id).unwrap()
    }

    /// Get all milestones for an escrow
    pub fn get_milestones(env: Env, escrow_id: Symbol) -> Vec<Milestone> {
        let escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.milestones
    }

    /// Get total number of escrows created
    pub fn get_escrow_count(env: Env) -> u32 {
        env.storage().instance().get(&ESCROW_COUNTER).unwrap_or(0)
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::token::StellarAssetClient;

    /// Register a real Stellar Asset Contract token, fund the payer, and
    /// register the escrow contract. Returns (client, payer, contractor, token).
    fn setup(
        env: &Env,
    ) -> (
        EscrowContractClient<'_>,
        Address,
        Address,
        StellarAssetClient<'_>,
    ) {
        env.mock_all_auths();

        let payer = Address::generate(env);
        let contractor = Address::generate(env);

        let admin = Address::generate(env);
        let token_address = env.register_stellar_asset_contract_v2(admin).address();
        let token = StellarAssetClient::new(env, &token_address);
        token.mint(&payer, &10_000_000000);

        let contract_id = env.register(EscrowContract, ());
        let client = EscrowContractClient::new(env, &contract_id);

        (client, payer, contractor, token)
    }

    #[test]
    fn test_create_escrow() {
        let env = Env::default();
        let (client, payer, contractor, token) = setup(&env);

        let escrow_id =
            client.create_escrow(&payer, &contractor, &1000_000000, &token.address);

        // First escrow must be ESC_0 so frontends can iterate `0..count`.
        assert_eq!(escrow_id, symbol_short!("ESC_0"));
        assert_eq!(client.get_escrow_count(), 1);

        let escrow = client.get_escrow(&escrow_id);
        assert_eq!(escrow.payer, payer);
        assert_eq!(escrow.contractor, contractor);
        assert_eq!(escrow.token, token.address);
        assert_eq!(escrow.total_amount, 1000_000000);
        assert!(escrow.status == EscrowStatus::Created);
        assert_eq!(escrow.milestones.len(), 0);
    }

    #[test]
    fn test_add_milestone() {
        let env = Env::default();
        let (client, payer, contractor, token) = setup(&env);

        let escrow_id =
            client.create_escrow(&payer, &contractor, &1000_000000, &token.address);

        let ms1 = client.add_milestone(&escrow_id, &symbol_short!("DESIGN"), &200_000000);

        let ms2 = client.add_milestone(&escrow_id, &symbol_short!("BUILD"), &500_000000);

        assert_eq!(ms1, 1);
        assert_eq!(ms2, 2);

        let milestones = client.get_milestones(&escrow_id);
        assert_eq!(milestones.len(), 2);
    }

    #[test]
    fn test_fund_and_release() {
        let env = Env::default();
        let (client, payer, contractor, token) = setup(&env);

        let escrow_id =
            client.create_escrow(&payer, &contractor, &1000_000000, &token.address);

        client.add_milestone(&escrow_id, &symbol_short!("DESIGN"), &200_000000);

        client.fund_escrow(&escrow_id);
        // Real custody: the full total sits in the escrow contract.
        assert_eq!(
            token.balance(&client.address),
            1000_000000
        );

        client.approve_milestone(&escrow_id, &1);
        client.release_milestone(&escrow_id, &1);

        let escrow = client.get_escrow(&escrow_id);
        assert_eq!(escrow.released_amount, 200_000000);
        assert!(escrow.status == EscrowStatus::Partial);
        // Contractor was actually paid.
        assert_eq!(token.balance(&contractor), 200_000000);
    }

    #[test]
    fn test_full_lifecycle() {
        let env = Env::default();
        let (client, payer, contractor, token) = setup(&env);

        let escrow_id =
            client.create_escrow(&payer, &contractor, &1000_000000, &token.address);

        client.add_milestone(&escrow_id, &symbol_short!("M1"), &500_000000);
        client.add_milestone(&escrow_id, &symbol_short!("M2"), &500_000000);

        client.fund_escrow(&escrow_id);

        client.approve_milestone(&escrow_id, &1);
        client.release_milestone(&escrow_id, &1);

        client.approve_milestone(&escrow_id, &2);
        client.release_milestone(&escrow_id, &2);

        let escrow = client.get_escrow(&escrow_id);
        assert!(escrow.status == EscrowStatus::Completed);
        assert_eq!(escrow.released_amount, 1000_000000);
        assert_eq!(token.balance(&contractor), 1000_000000);
        assert_eq!(token.balance(&client.address), 0);
    }

    #[test]
    fn test_refund_returns_custody() {
        let env = Env::default();
        let (client, payer, contractor, token) = setup(&env);

        let escrow_id =
            client.create_escrow(&payer, &contractor, &1000_000000, &token.address);
        client.add_milestone(&escrow_id, &symbol_short!("M1"), &400_000000);
        client.fund_escrow(&escrow_id);

        let payer_before = token.balance(&payer);
        client.open_dispute(&escrow_id, &1, &payer);
        client.refund_escrow(&escrow_id);

        let escrow = client.get_escrow(&escrow_id);
        assert!(escrow.status == EscrowStatus::Refunded);
        assert_eq!(escrow.remaining_amount, 0);
        assert_eq!(token.balance(&payer), payer_before + 1000_000000);
        assert_eq!(token.balance(&client.address), 0);
    }

    #[test]
    #[should_panic(expected = "Sum of milestone amounts exceeds total escrow amount")]
    fn test_milestone_sum_validation() {
        let env = Env::default();
        let (client, payer, contractor, token) = setup(&env);

        let escrow_id =
            client.create_escrow(&payer, &contractor, &1000_000000, &token.address);

        client.add_milestone(&escrow_id, &symbol_short!("M1"), &700_000000);
        // 700 + 700 > 1000 total — must panic.
        client.add_milestone(&escrow_id, &symbol_short!("M2"), &700_000000);
    }

    #[test]
    fn test_contractor_can_dispute() {
        let env = Env::default();
        let (client, payer, contractor, token) = setup(&env);

        let escrow_id =
            client.create_escrow(&payer, &contractor, &1000_000000, &token.address);
        client.add_milestone(&escrow_id, &symbol_short!("M1"), &500_000000);
        client.fund_escrow(&escrow_id);

        // Contractor (not payer) opens the dispute — the new `caller` param.
        client.open_dispute(&escrow_id, &1, &contractor);

        let escrow = client.get_escrow(&escrow_id);
        assert!(escrow.status == EscrowStatus::Disputed);
        let milestones = client.get_milestones(&escrow_id);
        assert!(milestones.get(0).unwrap().status == MilestoneStatus::Disputed);
    }

    #[test]
    #[should_panic(expected = "Only payer or contractor can open a dispute")]
    fn test_stranger_cannot_dispute() {
        let env = Env::default();
        let (client, payer, contractor, token) = setup(&env);

        let escrow_id =
            client.create_escrow(&payer, &contractor, &1000_000000, &token.address);
        client.add_milestone(&escrow_id, &symbol_short!("M1"), &500_000000);
        client.fund_escrow(&escrow_id);

        let stranger = Address::generate(&env);
        client.open_dispute(&escrow_id, &1, &stranger);
    }
}
