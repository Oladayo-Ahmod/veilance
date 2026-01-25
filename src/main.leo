program freelancing_platform.aleo {

    // 1. Record Types (UTXO Model)
    // In Aleo, to "update" a record, you consume the old one and return a new one.
    record Client {
        owner: address,
        escrow_balance: u64,
        rating: u8,
        completed_projects: u32,
    }

    record Freelancer {
        owner: address,
        earned_balance: u64,
        rating: u8,
        skills: [field; 5], // Fixed-size array (Vector not supported)
        completed_projects: u32,
    }

    record Escrow {
        owner: address,        // Client
        payee: address,        // Freelancer
        amount: u64,
        milestone: u8,
        total_milestones: u8,
        milestone_amounts: [u64; 5], // Fixed-size array
        description: field,
        status: u8,            // 0: Active, 1: Completed, 2: Disputed
        client_approved: bool,
        freelancer_approved: bool,
    }

    // 2. Public State (Mappings)
    // Used to track "Events" and global state publicly.
    mapping escrows: field => bool; 
    mapping platform_balance: address => u64;

    // 3. Transitions (Private Logic)

    transition register_client() -> Client {
        return Client {
            owner: self.caller,
            escrow_balance: 0u64,
            rating: 5u8,
            completed_projects: 0u32,
        };
    }

    transition register_freelancer(skills: [field; 5]) -> Freelancer {
        return Freelancer {
            owner: self.caller,
            earned_balance: 0u64,
            rating: 5u8,
            skills: skills,
            completed_projects: 0u32,
        };
    }

    transition deposit_funds(client: Client, amount: u64) -> Client {
        // Assertions ensure only the record owner can update it
        assert_eq(client.owner, self.caller);
        
        return Client {
            owner: client.owner,
            escrow_balance: client.escrow_balance + amount,
            rating: client.rating,
            completed_projects: client.completed_projects,
        };
    }

    transition create_escrow(
        payee: address,
        total_amount: u64,
        milestone_amounts: [u64; 5],
        description: field,
        client: Client
    ) -> (Escrow, Client) {
        assert_eq(client.owner, self.caller);
        assert(client.escrow_balance >= total_amount);

        // Calculate unique ID (Poseidon hash)
        let escrow_id: field = Poseidon2::hash_to_field(self.caller);

        let escrow: Escrow = Escrow {
            owner: self.caller,
            payee: payee,
            amount: total_amount,
            milestone: 0u8,
            total_milestones: 5u8,
            milestone_amounts: milestone_amounts,
            description: description,
            status: 0u8,
            client_approved: false,
            freelancer_approved: false,
        };

        let updated_client: Client = Client {
            owner: client.owner,
            escrow_balance: client.escrow_balance - total_amount,
            rating: client.rating,
            completed_projects: client.completed_projects,
        };

        // 'then finalize' is how we update public state
        return (escrow, updated_client) then finalize_create(escrow_id);
    }

    finalize finalize_create(id: field) {
        // Equivalent to "emitting an event" - updates public mapping
        Mapping::set(escrows, id, true);
    }

    // 2. Withdraw Funds (For Client)
    transition withdraw_funds(client: Client, amount: u64) -> Client {
        assert_eq(client.owner, self.caller);
        assert(client.escrow_balance >= amount);
        
        return Client {
            owner: client.owner,
            escrow_balance: client.escrow_balance - amount,
            rating: client.rating,
            completed_projects: client.completed_projects,
        };
    }

    transition submit_milestone(escrow: Escrow) -> Escrow {
        // Only the freelancer (payee) can submit work
        assert_eq(escrow.payee, self.caller);
        assert(escrow.status == 0u8); 
        
        return Escrow {
            owner: escrow.owner,
            payee: escrow.payee,
            amount: escrow.amount,
            milestone: escrow.milestone,
            total_milestones: escrow.total_milestones,
            milestone_amounts: escrow.milestone_amounts,
            description: escrow.description,
            status: escrow.status,
            client_approved: escrow.client_approved,
            freelancer_approved: true, // Mark work as submitted
        };
    }

    // 6. Approve Milestone (Client calls this)
    transition approve_milestone(escrow: Escrow) -> Escrow {
        // Only the client (owner) can approve the work
        assert_eq(escrow.owner, self.caller);
        assert(escrow.status == 0u8); 
        assert(escrow.freelancer_approved); // Can only approve if work was submitted

        return Escrow {
            owner: escrow.owner,
            payee: escrow.payee,
            amount: escrow.amount,
            milestone: escrow.milestone,
            total_milestones: escrow.total_milestones,
            milestone_amounts: escrow.milestone_amounts,
            description: escrow.description,
            status: escrow.status,
            client_approved: true, // Milestone is now approved by client
            freelancer_approved: escrow.freelancer_approved,
        };
    }

    transition release_milestone(
        escrow: Escrow, 
        freelancer: Freelancer
    ) -> (Escrow, Freelancer) {
        assert_eq(escrow.owner, self.caller);
        assert(escrow.status == 0u8);
        
        // Logic for milestone amount (Simplified)
        let amount: u64 = escrow.milestone_amounts[0u32]; 
        
        let updated_freelancer: Freelancer = Freelancer {
            owner: freelancer.owner,
            earned_balance: freelancer.earned_balance + amount,
            rating: freelancer.rating,
            skills: freelancer.skills,
            completed_projects: freelancer.completed_projects + 1u32,
        };

        let updated_escrow: Escrow = Escrow {
            owner: escrow.owner,
            payee: escrow.payee,
            amount: escrow.amount - amount,
            milestone: escrow.milestone + 1u8,
            total_milestones: escrow.total_milestones,
            milestone_amounts: escrow.milestone_amounts,
            description: escrow.description,
            status: (escrow.milestone + 1u8 >= escrow.total_milestones) ? 1u8 : 0u8,
            client_approved: false,
            freelancer_approved: false,
        };

        return (updated_escrow, updated_freelancer);
    }


}