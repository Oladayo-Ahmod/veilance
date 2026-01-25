

// program freelancing_platform.aleo {

//     // Record types
//     record Client {
//         owner: address,
//         escrow_balance: u64,
//         rating: u8,
//         completed_projects: u32,
//     }

//     record Freelancer {
//         owner: address,
//         earned_balance: u64,
//         rating: u8,
//         skills: vector<field>,
//         completed_projects: u32,
//     }

//     record Escrow {
//         owner: address,           // Client
//         payee: address,           // Freelancer
//         amount: u64,
//         milestone: u8,            // Current milestone (0-based)
//         total_milestones: u8,
//         milestone_amounts: vector<u64>,
//         description: field,
//         created_at: u32,
//         status: u8,               // 0: Active, 1: Completed, 2: Disputed, 3: Cancelled
//         dispute_reason: field,
//         disputed_by: address,
//         client_approved: bool,
//         freelancer_approved: bool,
//     }

//     record Dispute {
//         owner: address,
//         escrow_id: field,
//         reason: field,
//         raised_by: address,
//         created_at: u32,
//         status: u8,               // 0: Open, 1: Resolved, 2: Escalated
//         resolution: field,
//     }

//     // Struct for milestone release
//     struct MilestoneRequest {
//         escrow_id: field,
//         milestone_index: u8,
//         description: field,
//     }

//     // Mapping structures
//     mapping escrows: field => Escrow;
//     mapping disputes: field => Dispute;
//     mapping client_ratings: address => vector<u8>;
//     mapping freelancer_ratings: address => vector<u8>;
//     mapping skills: address => vector<field>;

//     // Constants
//     constant PLATFORM_FEE_PERCENT: u8 = 2u8;  // 2% platform fee
//     constant MIN_ESCROW_AMOUNT: u64 = 1000000u64;  // Minimum 1 credit
//     constant MAX_MILESTONES: u8 = 10u8;
//     constant RATING_DECAY: u8 = 1u8;  // Rating decays by 1 point after dispute

//     // Events
//     event EscrowCreated: (client: address, freelancer: address, amount: u64, escrow_id: field);
//     event MilestoneReleased: (escrow_id: field, milestone: u8, amount: u64);
//     project EscrowCompleted: (escrow_id: field, client: address, freelancer: address, total_amount: u64);
//     event DisputeRaised: (escrow_id: field, raised_by: address, reason: field);
//     event RatingUpdated: (rated: address, rater: address, rating: u8);
//     event FundsDeposited: (client: address, amount: u64);
//     event FundsWithdrawn: (user: address, amount: u64);

//     @noupgrade
//     async constructor() {}

//     // Initialize client profile
//     transition registerClient() -> Client {
//         let client: Client = Client {
//             owner: self.caller as address,
//             escrow_balance: 0u64,
//             rating: 5u8,  // Default rating
//             completed_projects: 0u32,
//         };
//         return client;
//     }

//     // Initialize freelancer profile with skills
//     transition registerFreelancer(skills: vector<field>) -> Freelancer {
//         let freelancer: Freelancer = Freelancer {
//             owner: self.caller as address,
//             earned_balance: 0u64,
//             rating: 5u8,  // Default rating
//             skills: skills,
//             completed_projects: 0u32,
//         };
//         return freelancer;
//     }

//     // Deposit funds to client account
//     transition depositFunds(mut client: Client, amount: u64) -> Client {
//         assert_eq(client.owner, self.caller);
//         assert(amount >= MIN_ESCROW_AMOUNT);
        
//         client.escrow_balance += amount;
//         emit FundsDeposited(client.owner, amount);
        
//         return client;
//     }

//     // Withdraw funds from client account
//     transition withdrawFunds(mut client: Client, amount: u64) -> Client {
//         assert_eq(client.owner, self.caller);
//         assert(client.escrow_balance >= amount);
        
//         client.escrow_balance -= amount;
//         emit FundsWithdrawn(client.owner, amount);
        
//         return client;
//     }

//     // Create a new escrow for a project
//     transition createEscrow(
//         payee: address,
//         total_amount: u64,
//         milestone_amounts: vector<u64>,
//         description: field,
//         mut client: Client
//     ) -> (Escrow, Client) {
//         // Validate inputs
//         assert_eq(client.owner, self.caller);
//         assert(client.escrow_balance >= total_amount);
//         assert(total_amount >= MIN_ESCROW_AMOUNT);
        
//         let total_milestones: u8 = milestone_amounts.len() as u8;
//         assert(total_milestones > 0u8 && total_milestones <= MAX_MILESTONES);
        
//         // Verify milestone amounts sum to total
//         let mut sum: u64 = 0u64;
//         for i in 0..total_milestones {
//             sum += milestone_amounts[i as u64];
//         }
//         assert_eq(sum, total_amount);
        
//         // Generate unique escrow ID
//         let escrow_id: field = Poseidon8::hash_to_field(
//             self.caller,
//             payee,
//             total_amount as field,
//             block.height as field
//         );
        
//         // Create escrow
//         let escrow: Escrow = Escrow {
//             owner: self.caller as address,
//             payee: payee,
//             amount: total_amount,
//             milestone: 0u8,
//             total_milestones: total_milestones,
//             milestone_amounts: milestone_amounts,
//             description: description,
//             created_at: block.height,
//             status: 0u8,  // Active
//             dispute_reason: 0field,
//             disputed_by: 0address,
//             client_approved: false,
//             freelancer_approved: false,
//         };
        
//         // Deduct from client balance
//         client.escrow_balance -= total_amount;
        
//         // Store escrow
//         set escrows[escrow_id] = escrow;
//         emit EscrowCreated(self.caller, payee, total_amount, escrow_id);
        
//         return (escrow, client);
//     }

//     // Submit work for a milestone (freelancer calls this)
//     transition submitMilestone(escrow_id: field, mut escrow: Escrow) -> Escrow {
//         // Verify caller is freelancer
//         assert_eq(escrow.payee, self.caller);
//         assert(escrow.status == 0u8);  // Active
//         assert(escrow.milestone < escrow.total_milestones);
        
//         // Mark freelancer approval
//         escrow.freelancer_approved = true;
        
//         set escrows[escrow_id] = escrow;
//         return escrow;
//     }

//     // Approve and release milestone payment (client calls this)
//     transition releaseMilestone(
//         escrow_id: field, 
//         mut escrow: Escrow, 
//         mut freelancer: Freelancer
//     ) -> (Escrow, Freelancer) {
//         // Verify caller is client
//         assert_eq(escrow.owner, self.caller);
//         assert(escrow.status == 0u8);  // Active
//         assert(escrow.milestone < escrow.total_milestones);
//         assert(escrow.freelancer_approved);  // Work must be submitted first
        
//         // Calculate milestone amount with platform fee
//         let milestone_amount: u64 = escrow.milestone_amounts[escrow.milestone as u64];
//         let platform_fee: u64 = milestone_amount * (PLATFORM_FEE_PERCENT as u64) / 100u64;
//         let freelancer_payment: u64 = milestone_amount - platform_fee;
        
//         // Release payment to freelancer
//         freelancer.earned_balance += freelancer_payment;
//         escrow.client_approved = true;
        
//         // Move to next milestone or complete
//         if (escrow.milestone + 1u8 >= escrow.total_milestones) {
//             escrow.status = 1u8;  // Completed
            
//             // Update completed projects count
//             // Note: In practice, you'd need to update client record too
//             freelancer.completed_projects += 1u32;
            
//             emit EscrowCompleted(escrow_id, escrow.owner, escrow.payee, escrow.amount);
//         } else {
//             escrow.milestone += 1u8;
//             // Reset approvals for next milestone
//             escrow.client_approved = false;
//             escrow.freelancer_approved = false;
//         }
        
//         emit MilestoneReleased(escrow_id, escrow.milestone, freelancer_payment);
//         set escrows[escrow_id] = escrow;
        
//         return (escrow, freelancer);
//     }

//     // Raise a dispute on an escrow
//     transition raiseDispute(
//         escrow_id: field,
//         mut escrow: Escrow,
//         reason: field
//     ) -> (Escrow, Dispute) {
//         // Verify caller is either client or freelancer
//         assert(self.caller == escrow.owner || self.caller == escrow.payee);
//         assert(escrow.status == 0u8);  // Active
        
//         // Update escrow status
//         escrow.status = 2u8;  // Disputed
//         escrow.dispute_reason = reason;
//         escrow.disputed_by = self.caller as address;
        
//         // Create dispute record
//         let dispute: Dispute = Dispute {
//             owner: self.caller as address,
//             escrow_id: escrow_id,
//             reason: reason,
//             raised_by: self.caller as address,
//             created_at: block.height,
//             status: 0u8,  // Open
//             resolution: 0field,
//         };
        
//         set escrows[escrow_id] = escrow;
//         set disputes[escrow_id] = dispute;
//         emit DisputeRaised(escrow_id, self.caller, reason);
        
//         return (escrow, dispute);
//     }

//     // Resolve a dispute (could be called by admin or through arbitration)
//     transition resolveDispute(
//         escrow_id: field,
//         mut escrow: Escrow,
//         mut dispute: Dispute,
//         resolution: field,
//         client_refund_percent: u8,  // Percentage to refund to client
//         mut client: Client,
//         mut freelancer: Freelancer
//     ) -> (Escrow, Dispute, Client, Freelancer) {
//         // In production, add admin/arbitrator verification
//         // assert(self.caller == ADMIN_ADDRESS);
        
//         assert(escrow.status == 2u8);  // Disputed
//         assert(dispute.status == 0u8);  // Open
        
//         // Calculate distribution
//         let remaining_amount: u64 = 0u64;
//         for i in escrow.milestone..escrow.total_milestones {
//             remaining_amount += escrow.milestone_amounts[i as u64];
//         }
        
//         let client_refund: u64 = remaining_amount * (client_refund_percent as u64) / 100u64;
//         let freelancer_payment: u64 = remaining_amount - client_refund;
        
//         // Apply platform fee to freelancer payment
//         let platform_fee: u64 = freelancer_payment * (PLATFORM_FEE_PERCENT as u64) / 100u64;
//         freelancer_payment -= platform_fee;
        
//         // Distribute funds
//         client.escrow_balance += client_refund;
//         freelancer.earned_balance += freelancer_payment;
        
//         // Update records
//         escrow.status = 1u8;  // Mark as completed (resolved)
//         dispute.status = 1u8;  // Resolved
//         dispute.resolution = resolution;
        
//         // Apply rating penalty
//         if (client_refund_percent > 50u8) {
//             // More refund to client means penalty to freelancer
//             if (freelancer.rating > RATING_DECAY) {
//                 freelancer.rating -= RATING_DECAY;
//             }
//         } else {
//             // More payment to freelancer means penalty to client
//             if (client.rating > RATING_DECAY) {
//                 client.rating -= RATING_DECAY;
//             }
//         }
        
//         set escrows[escrow_id] = escrow;
//         set disputes[escrow_id] = dispute;
        
//         return (escrow, dispute, client, freelancer);
//     }

//     // Rate a user after project completion
//     transition rateUser(
//         escrow_id: field,
//         escrow: Escrow,
//         rating: u8,
//         mut rated_user: Client  // Could be Client or Freelancer
//     ) -> Client {
//         // Verify project is completed
//         assert(escrow.status == 1u8);  // Completed
//         // Verify caller is the other party in the escrow
//         assert(self.caller == escrow.owner || self.caller == escrow.payee);
//         // Verify rating is valid (1-5)
//         assert(rating >= 1u8 && rating <= 5u8);
        
//         // Update rating (simple average for demo)
//         // In production, use weighted average or more sophisticated system
//         let total_ratings: u32 = rated_user.completed_projects + 1u32;
//         let new_rating: u8 = ((rated_user.rating as u32 * rated_user.completed_projects + rating as u32) / total_ratings) as u8;
        
//         rated_user.rating = new_rating;
//         emit RatingUpdated(rated_user.owner, self.caller, rating);
        
//         return rated_user;
//     }

//     // Withdraw earnings (freelancer)
//     transition withdrawEarnings(mut freelancer: Freelancer, amount: u64) -> Freelancer {
//         assert_eq(freelancer.owner, self.caller);
//         assert(freelancer.earned_balance >= amount);
        
//         freelancer.earned_balance -= amount;
//         emit FundsWithdrawn(self.caller, amount);
        
//         return freelancer;
//     }

//     // Cancel escrow (only before any milestones are approved)
//     transition cancelEscrow(
//         escrow_id: field,
//         mut escrow: Escrow,
//         mut client: Client
//     ) -> (Escrow, Client) {
//         assert_eq(escrow.owner, self.caller);
//         assert(escrow.status == 0u8);  // Active
//         assert(escrow.milestone == 0u8);  // No milestones started
//         assert(!escrow.freelancer_approved);  // No work submitted
        
//         // Return all funds to client
//         client.escrow_balance += escrow.amount;
//         escrow.status = 3u8;  // Cancelled
        
//         set escrows[escrow_id] = escrow;
        
//         return (escrow, client);
//     }

//     // Get escrow details (view function - returns public information)
//     finalize getEscrow(escrow_id: field) -> Escrow {
//         let escrow: Escrow = escrows[escrow_id];
//         return escrow;
//     }

//     // Get user rating (view function)
//     finalize getUserRating(user: address, is_freelancer: bool) -> u8 {
//         if (is_freelancer) {
//             let freelancer: Freelancer = freelancer_ratings[user][0];  // Simplified
//             return freelancer.rating;
//         } else {
//             let client: Client = client_ratings[user][0];  // Simplified
//             return client.rating;
//         }
//     }
// }