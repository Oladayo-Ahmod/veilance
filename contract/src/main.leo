import credits.aleo;
program freelancing_platform.aleo {

    /// @notice Record representing a client on the platform
    /// @param owner The address that owns this client record
    /// @param escrow_balance The total amount of credits locked in escrow by this client
    /// @param rating The client's average rating (0-255 scale)
    /// @param completed_projects Total number of projects completed by this client
    record Client {
        owner: address,
        escrow_balance: u64,
        rating: u8,
        completed_projects: u32,
    }

    /// @notice Record representing a freelancer on the platform
    /// @param owner The address that owns this freelancer record
    /// @param rating The freelancer's average rating (0-255 scale)
    /// @param skills Array of up to 5 skill identifiers
    /// @param completed_projects Total number of projects completed by this freelancer
    record Freelancer {
        owner: address,
        rating: u8,
        skills: [field; 5],
        completed_projects: u32,
    }

    /// @notice Record representing an escrow agreement between client and freelancer
    /// @param owner The client address who created the escrow
    /// @param payee The freelancer address who will receive payments
    /// @param remaining_amount Amount of credits still locked in escrow
    /// @param milestone Current milestone index (0-based)
    /// @param total_milestones Total number of milestones in the project
    /// @param milestone_amounts Array of payment amounts for each milestone [2]
    /// @param description Field identifier for the project description
    /// @param status Current escrow status: 0=Active, 1=Completed, 2=Disputed
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

    /// @notice Mapping to track active escrows by their ID
    mapping escrows: field => bool;
    
    /// @notice Mapping to track milestone submission status for each escrow
    mapping milestone_submitted: field => bool;
    
    /// @notice Mapping to track freelancer withdrawable balances
    mapping freelancer_balances: address => u64;
    
    /// @notice Mapping to track freelancer statistics
    mapping freelancer_stats: address => u32;

    /// @notice Constructor - initializes the platform without any state
    @noupgrade
    async constructor(
    ) {}

    // ─────────────────────────────
    // Registration
    // ─────────────────────────────

    /// @notice Registers a new client
    /// @return Client A new client record with zero balance and zero stats
    transition register_client() -> Client {
        return Client {
            owner: self.caller as address,
            escrow_balance: 0u64,
            rating: 0u8,
            completed_projects: 0u32,
        };
    }

    /// @notice Registers a new freelancer with initial skills
    /// @param skills Array of up to 5 skill identifiers
    /// @return Freelancer A new freelancer record with default rating of 5
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

    /// @notice Deposits credits into client's escrow balance
    /// @param client The client record to update
    /// @param amount Amount of credits to deposit
    /// @return (Updated client record, Future for transfer finalization)
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

    /// @notice Finalizes the deposit after credit transfer completes
    /// @param f Future from the credit transfer transaction
    async function finalize_deposit_funds(f: Future) {
        f.await();
    }

    // ─────────────────────────────
    // Escrow creation
    // ─────────────────────────────

    /// @notice Creates a new escrow agreement between client and freelancer
    /// @param payee The freelancer address to receive payments
    /// @param total_amount Total credits to lock in escrow
    /// @param milestone_amounts Payment amounts for each milestone [2]
    /// @param description Field identifier for project description
    /// @param client The client's record
    /// @return (New escrow record, Updated client record, Future for escrow creation)
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

    /// @notice Finalizes escrow creation by updating mappings
    /// @param id The escrow identifier
    async function finalize_create(id: field) {
        Mapping::set(escrows, id, true);
        Mapping::set(milestone_submitted, id, false);
    }

    // ─────────────────────────────
    // Freelancer submits milestone
    // ─────────────────────────────

    /// @notice Submits a milestone for client approval
    /// @param escrow_id The escrow identifier
    /// @return Future for milestone submission finalization
    async transition submit_milestone(escrow_id: field)->Future {
       return finalize_submit_milestone(escrow_id);
    }

    /// @notice Finalizes milestone submission by updating status
    /// @param escrow_id The escrow identifier
    async function finalize_submit_milestone (escrow_id:field) {
        assert(Mapping::get(escrows, escrow_id));
        Mapping::set(milestone_submitted, escrow_id, true);
    }

    // ─────────────────────────────
    // Client approves + releases
    // ─────────────────────────────

   /// @notice Approves milestone completion and releases payment to freelancer
   /// @param escrow_id The escrow identifier
   /// @param escrow The escrow record to update
   /// @return (Updated escrow record, Future for payment release)
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

    /// @notice Finalizes approval and release by updating freelancer balance
    /// @param escrow_id The escrow identifier
    /// @param payee The freelancer receiving payment
    /// @param amount Amount of credits to add to freelancer's balance
    async function finalize_approve_and_release(escrow_id: field, payee: address, amount: u64) {
        // Update freelancer balance
        let current_balance: u64 = Mapping::get_or_use(freelancer_balances, payee, 0u64);
        Mapping::set(freelancer_balances, payee, current_balance + amount);
        assert(Mapping::get(milestone_submitted, escrow_id));
        Mapping::set(milestone_submitted, escrow_id, false);
    }

    /// @notice Withdraws funds from client's escrow balance back to their wallet
    /// @param client The client record to update
    /// @param amount Amount of credits to withdraw
    /// @return (Updated client record, Future for withdrawal)
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

    /// @notice Finalizes client withdrawal after transfer completes
    /// @param f Future from the credit transfer transaction
    async function finalize_withdraw_funds(f: Future) {
        f.await();
    }

    /// @notice Allows freelancer to withdraw earned credits
    /// @param amount Amount of credits to withdraw
    /// @return Future for withdrawal finalization
    async transition freelancer_withdraw(amount: u64) -> Future {
        let f: Future = credits.aleo/transfer_public(self.caller, amount);
        return finalize_freelancer_withdraw(f, self.caller, amount);
    }

    /// @notice Finalizes freelancer withdrawal by updating their balance mapping
    /// @param f Future from the credit transfer transaction
    /// @param payee The freelancer address withdrawing funds
    /// @param amount Amount of credits withdrawn
    async function finalize_freelancer_withdraw(f: Future, payee: address, amount: u64) {
        f.await();
        // Check and update their mapping balance
        let current_balance: u64 = Mapping::get(freelancer_balances, payee);
        assert(current_balance >= amount);
        Mapping::set(freelancer_balances, payee, current_balance - amount);
    }

    // ─────────────────────────────
    // Cancel Escrow (Refunds Client)
    // ─────────────────────────────

    /// @notice Cancels an active escrow and refunds remaining balance to client
    /// @param escrow_id The escrow identifier
    /// @param escrow The escrow record to cancel
    /// @param client The client's record to update
    /// @return (Updated client record with refund, Future for escrow cancellation)
    async transition cancel_escrow(
        escrow_id: field,
        escrow: Escrow,
        client: Client
    ) -> (Client, Future) {
        assert_eq(escrow.owner, self.caller);
        assert_eq(client.owner, self.caller);

        assert_eq(escrow.status, 0u8);

        let updated_client: Client = Client {
            owner: client.owner,
            escrow_balance: client.escrow_balance + escrow.remaining_amount,
            rating: client.rating,
            completed_projects: client.completed_projects,
        };

        return (updated_client, finalize_cancel_escrow(escrow_id));
    }

    /// @notice Finalizes escrow cancellation by deactivating it in mappings
    /// @param escrow_id The escrow identifier
    async function finalize_cancel_escrow(escrow_id: field) {
        assert(Mapping::get(escrows, escrow_id));
        Mapping::set(escrows, escrow_id, false);
    }
}