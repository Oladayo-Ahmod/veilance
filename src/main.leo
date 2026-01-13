// The 'test_escrow' program.
program test_escrow.aleo {

    record Fund {
        owner: address,
        balance: u64,
    }
   record Escrow {
    owner: address,
    payee: address,
    amount: u64,
    released: bool,
}

    @noupgrade
    async constructor() {}

    transition addFund (amount :u64) ->  Fund{
        let fund : Fund = Fund{
            owner :self.caller as address,
            balance : amount
        };

       return fund;
    }

  transition create (payee:address, amount:u64,fund:Fund) ->(Escrow, Fund)  {
    assert_eq(fund.owner,self.caller);
    assert(fund.balance >= amount);

    let escrow : Escrow = Escrow {
        owner : self.caller as address,
        payee : payee,
        amount : amount,
        released :  false
    };

    let funding : Fund = Fund{
        owner : self.caller as address,
        balance : fund.balance - amount
    };

        return escrow;
   }




}
