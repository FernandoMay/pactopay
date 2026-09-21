#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Bytes, Env, Symbol, Vec,
};

// ─── Storage Keys ────────────────────────────────────────────────────────────

const CONTRACT_ADMIN: Symbol = symbol_short!("ADMIN");
const ESCROW_ID: Symbol = symbol_short!("ESC_ID");
const MILESTONE_COUNT: Symbol = symbol_short!("MS_CNT");
const ESCROW_TOTAL: Symbol = symbol_short!("TOTL");

// ─── Types ───────────────────────────────────────────────────────────────────

#[derive(Clone)]
#[contracttype]
pub enum EscrowStatus {
    Created,    // Contract created, waiting for deposit
    Funded,     // Deposit received, work in progress
    Partial,    // Some milestones released, work ongoing
    Completed,  // All milestones released
    Disputed,   // Dispute in progress
    Refunded,   // Funds returned to payer
}

#[derive(Clone)]
#[contracttype]
pub enum MilestoneStatus {
    Pending,    // Not yet approved
    Approved,   // Approved by payer, ready for release
    Released,   // Funds sent to contractor
    Disputed,   // Under dispute
}

#[derive(Clone)]
#[contracttype]
pub struct Milestone {
    pub id: u32,
    pub description: Symbol,
    pub amount: i128,           // USDC amount in base units (6 decimals)
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
}

// ─── Events ──────────────────────────────────────────────────────────────────

const EVENT_ESCROW_CREATED: Symbol = symbol_short!("ESC_NEW");
const EVENT_ESCROW_FUNDED: Symbol = symbol_short!("ESC_FND");
const EVENT_MILESTONE_APPROVED: Symbol = symbol_short!("MS_APR");
const EVENT_MILESTONE_RELEASED: Symbol = symbol_short!("MS_RLS");
const EVENT_ESCROW_COMPLETED: Symbol = symbol_short!("ESC_CMP");
const EVENT_ESCROW_REFUNDED: Symbol = symbol_short!("ESC_REF");
const EVENT_DISPUTE_OPENED: Symbol = symbol_short!("DSP_OPN");

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Create a new escrow contract between payer and contractor
    /// Returns the escrow ID
    pub fn create_escrow(
        env: Env,
        payer: Address,
        contractor: Address,
        total_amount: i128,
    ) -> Symbol {
        // Require admin or payer authorization
        payer.require_auth();

        if total_amount <= 0 {
            panic!("Total amount must be positive");
        }

        let escrow_id = env.escrow().create_contract_address(&payer);
        let now = env.ledger().timestamp();

        let escrow = Escrow {
            id: escrow_id.clone(),
            payer: payer.clone(),
            contractor,
            total_amount,
            released_amount: 0,
            remaining_amount: total_amount,
            status: EscrowStatus::Created,
            created_at: now,
            funded_at: None,
        };

        env.storage().instance().set(&ESCROW_ID, &escrow_id);
        env.storage().instance().set(&escrow_id, &escrow);
        env.storage().instance().set(&MILESTONE_COUNT, &0u32);

        env.events().publish(
            (EVENT_ESCROW_CREATED,),
            (escrow_id.clone(), payer, total_amount),
        );

        escrow_id
    }

    /// Add a milestone to an escrow
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

        let count: u32 = env.storage().instance().get(&MILESTONE_COUNT).unwrap_or(0);
        let new_count = count + 1;

        let milestone = Milestone {
            id: new_count,
            description,
            amount,
            status: MilestoneStatus::Pending,
            approved_by: None,
            released_at: None,
        };

        let milestone_key = Symbol::new(&env, &format!("MS_{}", new_count));
        env.storage().instance().set(&milestone_key, &milestone);
        env.storage().instance().set(&MILESTONE_COUNT, &new_count);

        new_count
    }

    /// Fund the escrow - transfer USDC from payer to contract
    pub fn fund_escrow(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Created {
            panic!("Escrow is not in Created status");
        }

        // In production, this would invoke the USDC token contract
        // to transfer from payer to this contract's address
        // For hackathon demo, we mark as funded
        let now = env.ledger().timestamp();
        escrow.status = EscrowStatus::Funded;
        escrow.funded_at = Some(now);

        env.storage().instance().set(&escrow_id, &escrow);

        env.events()
            .publish((EVENT_ESCROW_FUNDED,), (escrow_id, escrow.total_amount));
    }

    /// Approve a milestone (payer confirms work is done)
    pub fn approve_milestone(env: Env, escrow_id: Symbol, milestone_id: u32) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Funded && escrow.status != EscrowStatus::Partial {
            panic!("Escrow not in active state");
        }

        let milestone_key = Symbol::new(&env, &format!("MS_{}", milestone_id));
        let mut milestone: Milestone = env.storage().instance().get(&milestone_key).unwrap();

        if milestone.status != MilestoneStatus::Pending {
            panic!("Milestone is not pending");
        }

        milestone.status = MilestoneStatus::Approved;
        milestone.approved_by = Some(escrow.payer.clone());

        env.storage().instance().set(&milestone_key, &milestone);

        env.events().publish(
            (EVENT_MILESTONE_APPROVED,),
            (escrow_id, milestone_id, milestone.amount),
        );
    }

    /// Release funds for an approved milestone to the contractor
    pub fn release_milestone(env: Env, escrow_id: Symbol, milestone_id: u32) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        let milestone_key = Symbol::new(&env, &format!("MS_{}", milestone_id));
        let mut milestone: Milestone = env.storage().instance().get(&milestone_key).unwrap();

        if milestone.status != MilestoneStatus::Approved {
            panic!("Milestone must be approved before release");
        }

        let now = env.ledger().timestamp();
        milestone.status = MilestoneStatus::Released;
        milestone.released_at = Some(now);

        escrow.released_amount += milestone.amount;
        escrow.remaining_amount -= milestone.amount;

        // Update escrow status
        let count: u32 = env.storage().instance().get(&MILESTONE_COUNT).unwrap();
        if escrow.released_amount >= escrow.total_amount {
            escrow.status = EscrowStatus::Completed;
            env.events()
                .publish((EVENT_ESCROW_COMPLETED,), (escrow_id.clone(), escrow.total_amount));
        } else {
            escrow.status = EscrowStatus::Partial;
        }

        env.storage().instance().set(&escrow_id, &escrow);
        env.storage().instance().set(&milestone_key, &milestone);

        env.events().publish(
            (EVENT_MILESTONE_RELEASED,),
            (escrow_id, milestone_id, milestone.amount, escrow.contractor.clone()),
        );
    }

    /// Open a dispute on a milestone
    pub fn open_dispute(env: Env, escrow_id: Symbol, milestone_id: u32) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status == EscrowStatus::Completed || escrow.status == EscrowStatus::Refunded {
            panic!("Cannot dispute completed or refunded escrows");
        }

        let milestone_key = Symbol::new(&env, &format!("MS_{}", milestone_id));
        let mut milestone: Milestone = env.storage().instance().get(&milestone_key).unwrap();

        milestone.status = MilestoneStatus::Disputed;
        escrow.status = EscrowStatus::Disputed;

        env.storage().instance().set(&escrow_id, &escrow);
        env.storage().instance().set(&milestone_key, &milestone);

        env.events()
            .publish((EVENT_DISPUTE_OPENED,), (escrow_id, milestone_id));
    }

    /// Refund remaining funds to payer (only when disputed or all work rejected)
    pub fn refund_escrow(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.payer.require_auth();

        if escrow.status != EscrowStatus::Disputed {
            panic!("Can only refund disputed escrows");
        }

        let refund_amount = escrow.remaining_amount;
        escrow.status = EscrowStatus::Refunded;
        escrow.remaining_amount = 0;

        env.storage().instance().set(&escrow_id, &escrow);

        env.events()
            .publish((EVENT_ESCROW_REFUNDED,), (escrow_id, refund_amount));
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    /// Get escrow details
    pub fn get_escrow(env: Env, escrow_id: Symbol) -> Escrow {
        env.storage().instance().get(&escrow_id).unwrap()
    }

    /// Get milestone details
    pub fn get_milestone(env: Env, escrow_id: Symbol, milestone_id: u32) -> Milestone {
        let milestone_key = Symbol::new(&env, &format!("MS_{}", milestone_id));
        env.storage().instance().get(&milestone_key).unwrap()
    }

    /// Get all milestones for an escrow
    pub fn get_milestones(env: Env, escrow_id: Symbol) -> Vec<Milestone> {
        let count: u32 = env.storage().instance().get(&MILESTONE_COUNT).unwrap_or(0);
        let mut milestones = Vec::new(&env);

        for i in 1..=count {
            let milestone_key = Symbol::new(&env, &format!("MS_{}", i));
            let milestone: Milestone = env.storage().instance().get(&milestone_key).unwrap();
            milestones.push_back(milestone);
        }

        milestones
    }

    /// Get escrow summary for frontend display
    pub fn get_summary(env: Env, escrow_id: Symbol) -> (Symbol, i128, i128, Symbol) {
        let escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        let status = match escrow.status {
            EscrowStatus::Created => symbol_short!("CREATED"),
            EscrowStatus::Funded => symbol_short!("FUNDED"),
            EscrowStatus::Partial => symbol_short!("PARTIAL"),
            EscrowStatus::Completed => symbol_short!("COMPLETED"),
            EscrowStatus::Disputed => symbol_short!("DISPUTED"),
            EscrowStatus::Refunded => symbol_short!("REFUNDED"),
        };
        (
            status,
            escrow.total_amount,
            escrow.released_amount,
            escrow.id,
        )
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
            1000_000000, // 1000 USDC
        );

        let escrow = EscrowContract::get_escrow(env.clone(), escrow_id.clone());
        assert_eq!(escrow.payer, payer);
        assert_eq!(escrow.contractor, contractor);
        assert_eq!(escrow.total_amount, 1000_000000);
        assert_eq!(escrow.status, EscrowStatus::Created);
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

        let escrow = EscrowContract::get_escrow(env.clone(), escrow_id.clone());
        assert_eq!(escrow.released_amount, 200_000000);
        assert_eq!(escrow.status, EscrowStatus::Partial);
    }

    #[test]
    fn test_full_escrow_lifecycle() {
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
            symbol_short!("M1"),
            500_000000,
        );

        EscrowContract::add_milestone(
            env.clone(),
            escrow_id.clone(),
            symbol_short!("M2"),
            500_000000,
        );

        EscrowContract::fund_escrow(env.clone(), escrow_id.clone());

        // Release first milestone
        EscrowContract::approve_milestone(env.clone(), escrow_id.clone(), 1);
        EscrowContract::release_milestone(env.clone(), escrow_id.clone(), 1);

        // Release second milestone
        EscrowContract::approve_milestone(env.clone(), escrow_id.clone(), 2);
        EscrowContract::release_milestone(env.clone(), escrow_id.clone(), 2);

        let escrow = EscrowContract::get_escrow(env, escrow_id);
        assert_eq!(escrow.status, EscrowStatus::Completed);
        assert_eq!(escrow.released_amount, 1000_000000);
    }
}
