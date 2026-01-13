// The 'test_escrow' program.
program test_escrow.aleo {

   record Escrow {
    owner: address,
    payee: address,
    amount: u64,
    released: bool,
}

    @noupgrade
    async constructor() {}

transition create (payee:address, amount:u64) ->Escrow  {
    let escrow : Escrow = Escrow {
        owner : self.caller as address,
        payee : payee,
        amount : amount,
        released :  false
    };

        return escrow;
   }
}
