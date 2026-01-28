program freelancing_platform.aleo;

record Client:
    owner as address.private;
    escrow_balance as u64.private;
    rating as u8.private;
    completed_projects as u32.private;

record Freelancer:
    owner as address.private;
    earned_balance as u64.private;
    rating as u8.private;
    skills as [field; 5u32].private;
    completed_projects as u32.private;

record Escrow:
    owner as address.private;
    payee as address.private;
    amount as u64.private;
    milestone as u8.private;
    total_milestones as u8.private;
    milestone_amounts as [u64; 2u32].private;
    description as field.private;
    status as u8.private;
    client_approved as boolean.private;
    freelancer_approved as boolean.private;

mapping escrows:
    key as field.public;
    value as boolean.public;

mapping platform_balance:
    key as address.public;
    value as u64.public;

function register_client:
    cast self.caller into r0 as address;
    cast r0 0u64 0u8 0u32 into r1 as Client.record;
    output r1 as Client.record;

function register_freelancer:
    input r0 as [field; 5u32].private;
    cast self.caller into r1 as address;
    cast r1 0u64 5u8 r0 0u32 into r2 as Freelancer.record;
    output r2 as Freelancer.record;

function deposit_funds:
    input r0 as Client.record;
    input r1 as u64.private;
    assert.eq r0.owner self.caller;
    add r0.escrow_balance r1 into r2;
    cast r0.owner r2 r0.rating r0.completed_projects into r3 as Client.record;
    output r3 as Client.record;

function create_escrow:
    input r0 as address.private;
    input r1 as u64.private;
    input r2 as [u64; 2u32].private;
    input r3 as field.private;
    input r4 as Client.record;
    assert.eq r4.owner self.caller;
    gte r4.escrow_balance r1 into r5;
    assert.eq r5 true;
    hash.psd2 self.caller into r6 as field;
    cast self.caller into r7 as address;
    cast r7 r0 r1 0u8 2u8 r2 r3 0u8 false false into r8 as Escrow.record;
    sub r4.escrow_balance r1 into r9;
    cast r4.owner r9 r4.rating r4.completed_projects into r10 as Client.record;
    async create_escrow r6 into r11;
    output r8 as Escrow.record;
    output r10 as Client.record;
    output r11 as freelancing_platform.aleo/create_escrow.future;

finalize create_escrow:
    input r0 as field.public;
    set true into escrows[r0];

function withdraw_funds:
    input r0 as Client.record;
    input r1 as u64.private;
    assert.eq r0.owner self.caller;
    gte r0.escrow_balance r1 into r2;
    assert.eq r2 true;
    sub r0.escrow_balance r1 into r3;
    cast r0.owner r3 r0.rating r0.completed_projects into r4 as Client.record;
    output r4 as Client.record;

function submit_milestone:
    input r0 as Escrow.record;
    assert.eq r0.payee self.caller;
    is.eq r0.status 0u8 into r1;
    assert.eq r1 true;
    cast r0.owner r0.payee r0.amount r0.milestone r0.total_milestones r0.milestone_amounts r0.description r0.status r0.client_approved true into r2 as Escrow.record;
    output r2 as Escrow.record;

function approve_milestone:
    input r0 as Escrow.record;
    assert.eq r0.owner self.caller;
    is.eq r0.status 0u8 into r1;
    assert.eq r1 true;
    assert.eq r0.freelancer_approved true;
    cast r0.owner r0.payee r0.amount r0.milestone r0.total_milestones r0.milestone_amounts r0.description r0.status true r0.freelancer_approved into r2 as Escrow.record;
    output r2 as Escrow.record;

function release_milestone:
    input r0 as Escrow.record;
    input r1 as Freelancer.record;
    assert.eq r0.owner self.caller;
    is.eq r0.status 0u8 into r2;
    assert.eq r2 true;
    add r1.earned_balance r0.milestone_amounts[0u32] into r3;
    add r1.completed_projects 1u32 into r4;
    cast r1.owner r3 r1.rating r1.skills r4 into r5 as Freelancer.record;
    sub r0.amount r0.milestone_amounts[0u32] into r6;
    add r0.milestone 1u8 into r7;
    add r0.milestone 1u8 into r8;
    gte r8 r0.total_milestones into r9;
    ternary r9 1u8 0u8 into r10;
    cast r0.owner r0.payee r6 r7 r0.total_milestones r0.milestone_amounts r0.description r10 false false into r11 as Escrow.record;
    output r11 as Escrow.record;
    output r5 as Freelancer.record;
