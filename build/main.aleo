program test_escrow.aleo;

record Fund:
    owner as address.private;
    balance as u64.private;

record Escrow:
    owner as address.private;
    payee as address.private;
    amount as u64.private;
    released as boolean.private;

function createFund:
    input r0 as u64.private;
    cast self.caller into r1 as address;
    cast r1 r0 into r2 as Fund.record;
    output r2 as Fund.record;

function create:
    input r0 as address.private;
    input r1 as u64.private;
    input r2 as Fund.record;
    assert.eq r2.owner self.caller;
    gte r2.balance r1 into r3;
    assert.eq r3 true;
    cast self.caller into r4 as address;
    cast r4 r0 r1 false into r5 as Escrow.record;
    cast self.caller into r6 as address;
    sub r2.balance r1 into r7;
    cast r6 r7 into r8 as Fund.record;
    output r5 as Escrow.record;
    output r8 as Fund.record;

function release:
    input r0 as Escrow.record;
    input r1 as Fund.record;
    assert.eq r0.owner self.caller;
    assert.eq r1.owner self.caller;
    cast r0.owner r0.payee r0.amount true into r2 as Escrow.record;
    sub r1.balance r0.amount into r3;
    cast r1.owner r3 into r4 as Fund.record;
    cast r0.payee r0.amount into r5 as Fund.record;
    output r2 as Escrow.record;
    output r4 as Fund.record;
    output r5 as Fund.record;

constructor:
    assert.eq edition 0u16;
