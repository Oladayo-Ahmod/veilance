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

record TimeLockedEscrow {
    owner: address,
    payee: address,
    amount: u64,
    unlock_height: u32,
}


    @noupgrade
    async constructor() {}

    transition createFund (amount :u64) ->  Fund{
        let fund : Fund = Fund{
            owner :self.caller as address,
            balance : amount
        };

       return fund;
    }

   async transition create (payee:address, amount:u64,fund:Fund,unlock_height:u32) ->(Escrow, Fund,Future)  {
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

        return (escrow,funding,create_finalize(unlock_height));
   }
   

   async function create_finalize (unlock_height:u32) {
     assert(unlock_height > block.height);
     assert(1u64 > 5u64);
   }

    transition release (escrow :Escrow, fund : Fund) -> (Escrow,Fund) {
        assert_eq(escrow.owner, self.caller);
        assert(escrow.amount > 0u64);
        assert_eq(fund.owner, self.caller);

        let updatedEscrow : Escrow = Escrow{
            owner :  escrow.owner,
            payee : escrow.payee,
            amount : escrow.amount,
            released : true,
        };


        let payeeFund : Fund = Fund{
            owner:escrow.payee,
            balance : escrow.amount
        };

        return (updatedEscrow,payeeFund);
    }

    transition refund (escrow : Escrow, fund:Fund) -> Fund {
        assert_neq(escrow.released,true);
        assert_eq(escrow.owner, self.caller);

        let updatedFund : Fund = Fund{
            owner : fund.owner,
            balance : fund.balance + escrow.amount
        };

        return updatedFund;
    }   



}
