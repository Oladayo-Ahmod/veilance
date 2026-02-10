import credits.aleo;
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
    remaining_amount as u64.private;
    milestone as u8.private;
    total_milestones as u8.private;
    milestone_amounts as [u64; 2u32].private;
    description as field.private;
    status as u8.private;

mapping escrows:
    key as field.public;
    value as boolean.public;

mapping milestone_submitted:
    key as field.public;
    value as boolean.public;

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
    call credits.aleo/transfer_public_as_signer freelancing_platform.aleo r1 into r2;
    add r0.escrow_balance r1 into r3;
    cast r0.owner r3 r0.rating r0.completed_projects into r4 as Client.record;
    async deposit_funds r2 into r5;
    output r4 as Client.record;
    output r5 as freelancing_platform.aleo/deposit_funds.future;

finalize deposit_funds:
    input r0 as credits.aleo/transfer_public_as_signer.future;
    await r0;

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
    cast r7 r0 r1 0u8 2u8 r2 r3 0u8 into r8 as Escrow.record;
    sub r4.escrow_balance r1 into r9;
    cast r4.owner r9 r4.rating r4.completed_projects into r10 as Client.record;
    async create_escrow r6 into r11;
    output r8 as Escrow.record;
    output r10 as Client.record;
    output r11 as freelancing_platform.aleo/create_escrow.future;

finalize create_escrow:
    input r0 as field.public;
    set true into escrows[r0];
    set false into milestone_submitted[r0];

function submit_milestone:
    input r0 as field.private;
    async submit_milestone r0 into r1;
    output r1 as freelancing_platform.aleo/submit_milestone.future;

finalize submit_milestone:
    input r0 as field.public;
    get escrows[r0] into r1;
    assert.eq r1 true;
    set true into milestone_submitted[r0];

function approve_and_release:
    input r0 as field.private;
    input r1 as Escrow.record;
    input r2 as address.private;
    assert.eq r1.owner self.caller;
    is.eq r1.status 0u8 into r3;
    assert.eq r3 true;
    is.eq r1.milestone 0u8 into r4;
    ternary r4 r1.milestone_amounts[0u32] r1.milestone_amounts[1u32] into r5;
    call credits.aleo/transfer_public r2 r5 into r6;
    add r1.milestone 1u8 into r7;
    gte r7 r1.total_milestones into r8;
    sub r1.remaining_amount r5 into r9;
    ternary r8 1u8 0u8 into r10;
    cast r1.owner r1.payee r9 r7 r1.total_milestones r1.milestone_amounts r1.description r10 into r11 as Escrow.record;
    async approve_and_release r0 r6 into r12;
    output r11 as Escrow.record;
    output r12 as freelancing_platform.aleo/approve_and_release.future;

finalize approve_and_release:
    input r0 as field.public;
    input r1 as credits.aleo/transfer_public.future;
    await r1;
    get milestone_submitted[r0] into r2;
    assert.eq r2 true;
    set false into milestone_submitted[r0];

constructor:
    assert.eq edition 0u16;
