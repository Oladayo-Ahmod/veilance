program test_escrow.aleo;

record Escrow:
    owner as address.private;
    payee as address.private;
    amount as u64.private;
    released as boolean.private;

function create:
    input r0 as address.private;
    input r1 as u64.private;
    cast self.caller into r2 as address;
    cast r2 r0 r1 false into r3 as Escrow.record;
    output r3 as Escrow.record;

constructor:
    assert.eq edition 0u16;
