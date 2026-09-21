#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
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
        _ => symbol_short!("ESC_X"),
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
    pub fn create_escrow(
        env: Env,
        payer: Address,
        contractor: Address,
        total_amount: i128,
    ) -> Symbol {
        payer.require_auth();

        if total_amount <= 0 {
            panic!("Total amount must be positive");
        }

        let counter: u32 = env.storage().instance().get(&ESCROW_COUNTER).unwrap_or(0);
        let new_id = counter + 1;
        env.storage().instance().set(&ESCROW_COUNTER, &new_id);

        let now = env.ledger().timestamp();

        let escrow = Escrow {
            id: escrow_storage_key(new_id),
            payer: payer.clone(),
            contractor,
            total_amount,
            released_amount: 0,
            remaining_amount: total_amount,
            status: EscrowStatus::Created,
            created_at: now,
            funded_at: None,
            milestones: Vec::new(&env),
        };

        let key = escrow_storage_key(new_id);
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

    /// Fund the escrow — mark it as funded.
    pub fn fund_escrow(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Created {
            panic!("Escrow is not in Created status");
        }

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

    /// Release funds for an approved milestone.
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

        let now = env.ledger().timestamp();
        milestone.status = MilestoneStatus::Released;
        milestone.released_at = Some(now);

        escrow.released_amount += milestone.amount;
        escrow.remaining_amount -= milestone.amount;

        if escrow.released_amount >= escrow.total_amount {
            escrow.status = EscrowStatus::Completed;
        } else {
            escrow.status = EscrowStatus::Partial;
        }

        escrow.milestones.set(idx, milestone);
        env.storage().instance().set(&escrow_id, &escrow);
    }

    /// Open a dispute on a milestone.
    pub fn open_dispute(env: Env, escrow_id: Symbol, milestone_id: u32) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

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

    /// Refund remaining funds to payer (only when disputed).
    pub fn refund_escrow(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Disputed {
            panic!("Can only refund disputed escrows");
        }

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

    #[test]
    fn test_create_escrow() {
        let env = Env::default();
        let payer = Address::generate(&env);
        let contractor = Address::generate(&env);

        env.mock_all_auths();

        let escrow_id = EscrowContract::create_escrow(
            env.clone(),
            payer.clone(),
            contractor.clone(),
            1000_000000,
        );

        let escrow = EscrowContract::get_escrow(env.clone(), escrow_id);
        assert_eq!(escrow.payer, payer);
        assert_eq!(escrow.contractor, contractor);
        assert_eq!(escrow.total_amount, 1000_000000);
        assert_eq!(escrow.status, EscrowStatus::Created);
        assert_eq!(escrow.milestones.len(), 0);
    }

    #[test]
    fn test_add_milestone() {
        let env = Env::default();
        let payer = Address::generate(&env);
        let contractor = Address::generate(&env);

        env.mock_all_auths();

        let escrow_id = EscrowContract::create_escrow(
            env.clone(),
            payer.clone(),
            contractor,
            1000_000000,
        );

        let ms1 = EscrowContract::add_milestone(
            env.clone(),
            escrow_id.clone(),
            symbol_short!("DESIGN"),
            200_000000,
        );

        let ms2 = EscrowContract::add_milestone(
            env.clone(),
            escrow_id.clone(),
            symbol_short!("BUILD"),
            500_000000,
        );

        assert_eq!(ms1, 1);
        assert_eq!(ms2, 2);

        let milestones = EscrowContract::get_milestones(env, escrow_id);
        assert_eq!(milestones.len(), 2);
    }

    #[test]
    fn test_fund_and_release() {
        let env = Env::default();
        let payer = Address::generate(&env);
        let contractor = Address::generate(&env);

        env.mock_all_auths();

        let escrow_id = EscrowContract::create_escrow(
            env.clone(),
            payer.clone(),
            contractor,
            1000_000000,
        );

        EscrowContract::add_milestone(
            env.clone(),
            escrow_id.clone(),
            symbol_short!("DESIGN"),
            200_000000,
        );

        EscrowContract::fund_escrow(env.clone(), escrow_id.clone());
        EscrowContract::approve_milestone(env.clone(), escrow_id.clone(), 1);
        EscrowContract::release_milestone(env.clone(), escrow_id.clone(), 1);

        let escrow = EscrowContract::get_escrow(env, escrow_id);
        assert_eq!(escrow.released_amount, 200_000000);
        assert_eq!(escrow.status, EscrowStatus::Partial);
    }

    #[test]
    fn test_full_lifecycle() {
        let env = Env::default();
        let payer = Address::generate(&env);
        let contractor = Address::generate(&env);

        env.mock_all_auths();

        let escrow_id = EscrowContract::create_escrow(
            env.clone(),
            payer.clone(),
            contractor,
            1000_000000,
        );

        EscrowContract::add_milestone(env.clone(), escrow_id.clone(), symbol_short!("M1"), 500_000000);
        EscrowContract::add_milestone(env.clone(), escrow_id.clone(), symbol_short!("M2"), 500_000000);

        EscrowContract::fund_escrow(env.clone(), escrow_id.clone());

        EscrowContract::approve_milestone(env.clone(), escrow_id.clone(), 1);
        EscrowContract::release_milestone(env.clone(), escrow_id.clone(), 1);

        EscrowContract::approve_milestone(env.clone(), escrow_id.clone(), 2);
        EscrowContract::release_milestone(env.clone(), escrow_id.clone(), 2);

        let escrow = EscrowContract::get_escrow(env, escrow_id);
        assert_eq!(escrow.status, EscrowStatus::Completed);
        assert_eq!(escrow.released_amount, 1000_000000);
    }
}
