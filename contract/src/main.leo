import credits.aleo;
program freelancing_platform.aleo {

    record Client {
        owner: address,
        escrow_balance: u64,
        rating: u8,
        completed_projects: u32,
    }

    record Freelancer {
        owner: address,
        rating: u8,
        skills: [field; 5],
        completed_projects: u32,
    }

    record Escrow {
        owner: address,        // Client
        payee: address,        // Freelancer
        remaining_amount: u64,
        milestone: u8,
        total_milestones: u8,
        milestone_amounts: [u64; 2],
        description: field,
        status: u8,            // 0: Active, 1: Completed, 2: Disputed
    }

    // ─────────────────────────────
    // Storage
    // ─────────────────────────────

    mapping escrows: field => bool;
    mapping milestone_submitted: field => bool;
    mapping freelancer_balances: address => u64;
    mapping freelancer_stats: address => u32;

    @noupgrade
    async constructor(
    ) {}

    // ─────────────────────────────
    // Registration
    // ─────────────────────────────

    transition register_client() -> Client {
        return Client {
            owner: self.caller as address,
            escrow_balance: 0u64,
            rating: 0u8,
            completed_projects: 0u32,
        };
    }

    transition register_freelancer(skills: [field; 5]) -> Freelancer {
        return Freelancer {
            owner: self.caller as address,
            rating: 5u8,
            skills: skills,
            completed_projects: 0u32,
        };
    } 
    

    // ─────────────────────────────
    // Client funds
    // ─────────────────────────────

    async transition deposit_funds(client: Client, amount: u64) -> (Client, Future) {
        assert_eq(client.owner, self.caller);
        
        let f: Future = credits.aleo/transfer_public_as_signer(self.address, amount);
        
        let updated_client: Client = Client {
            owner: client.owner,
            escrow_balance: client.escrow_balance + amount,
            rating: client.rating,
            completed_projects: client.completed_projects,
        };

        return (updated_client, finalize_deposit_funds(f));
    }

    async function finalize_deposit_funds(f: Future) {
        f.await();
    }

    // ─────────────────────────────
    // Escrow creation
    // ─────────────────────────────

    async transition create_escrow(
        payee: address,
        total_amount: u64,
        milestone_amounts: [u64; 2],
        description: field,
        client: Client
    ) -> (Escrow, Client, Future) {

        assert_eq(client.owner, self.caller);
        assert(client.escrow_balance >= total_amount);

        let escrow_id: field = Poseidon2::hash_to_field(self.caller);

        let escrow: Escrow = Escrow {
            owner: self.caller as address,
            payee: payee,
            remaining_amount: total_amount,
            milestone: 0u8,
            total_milestones: 2u8,
            milestone_amounts: milestone_amounts,
            description: description,
            status: 0u8,
        };

        let updated_client: Client = Client {
            owner: client.owner,
            escrow_balance: client.escrow_balance - total_amount,
            rating: client.rating,
            completed_projects: client.completed_projects,
        };

        return (escrow, updated_client, finalize_create(escrow_id));
    }

    async function finalize_create(id: field) {
        Mapping::set(escrows, id, true);
        Mapping::set(milestone_submitted, id, false);
    }

    // ─────────────────────────────
    // Freelancer submits milestone
    // ─────────────────────────────

    async transition submit_milestone(escrow_id: field)->Future {
       return finalize_submit_milestone(escrow_id);
    }

    async function finalize_submit_milestone (escrow_id:field) {
        assert(Mapping::get(escrows, escrow_id));
        Mapping::set(milestone_submitted, escrow_id, true);
    }

    // ─────────────────────────────
    // Client approves + releases
    // ─────────────────────────────

   async transition approve_and_release(
        escrow_id: field,
        escrow: Escrow,
    ) -> (Escrow, Future) {

        assert_eq(escrow.owner, self.caller);
        assert(escrow.status == 0u8);

        // Determine payment amount
        let amount: u64 = escrow.milestone == 0u8 
            ? escrow.milestone_amounts[0u32] 
            : escrow.milestone_amounts[1u32];

        // let f: Future = credits.aleo/transfer_public(escrow.payee, amount);

        let next_milestone: u8 = escrow.milestone + 1u8;
        let done: bool = next_milestone >= escrow.total_milestones;

        let updated_escrow: Escrow = Escrow {
            owner: escrow.owner,
            payee: escrow.payee,
            remaining_amount: escrow.remaining_amount - amount,
            milestone: next_milestone,
            total_milestones: escrow.total_milestones,
            milestone_amounts: escrow.milestone_amounts,
            description: escrow.description,
            status: done ? 1u8 : 0u8,
        };

        return (updated_escrow, finalize_approve_and_release(escrow_id, escrow.payee, amount));
    }

    async function finalize_approve_and_release(escrow_id: field, payee: address, amount: u64) {
        // Update freelancer balance
        let current_balance: u64 = Mapping::get_or_use(freelancer_balances, payee, 0u64);
        Mapping::set(freelancer_balances, payee, current_balance + amount);
        assert(Mapping::get(milestone_submitted, escrow_id));
        Mapping::set(milestone_submitted, escrow_id, false);
    }

    // Withdraw funds from client account
    async transition withdraw_funds(client: Client, amount: u64) -> (Client, Future) {
        assert_eq(client.owner, self.caller);
        assert(client.escrow_balance >= amount);

        let f: Future = credits.aleo/transfer_public(self.caller, amount);

        let updated_client: Client = Client {
            owner: client.owner,
            escrow_balance: client.escrow_balance - amount,
            rating: client.rating,
            completed_projects: client.completed_projects,
        };

        return (updated_client, finalize_withdraw_funds(f));
    }

    async function finalize_withdraw_funds(f: Future) {
        f.await();
    }

    async transition freelancer_withdraw(amount: u64) -> Future {
        let f: Future = credits.aleo/transfer_public(self.caller, amount);
        return finalize_freelancer_withdraw(f, self.caller, amount);
    }

    async function finalize_freelancer_withdraw(f: Future, payee: address, amount: u64) {
        f.await();
        // Check and update their mapping balance
        let current_balance: u64 = Mapping::get(freelancer_balances, payee);
        assert(current_balance >= amount);
        Mapping::set(freelancer_balances, payee, current_balance - amount);
    }
}
