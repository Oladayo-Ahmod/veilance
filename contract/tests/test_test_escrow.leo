// // The 'test_test_escrow' test program.
// import test_escrow.aleo;
// program test_test_escrow.aleo {
//     @test
//     script test_it() {
//         let result: u32 = test_escrow.aleo/main(1u32, 2u32);
//         assert_eq(result, 3u32);
//     }

//     @test
//     @should_fail
//     transition do_nothing() {
//         let result: u32 = test_escrow.aleo/main(2u32, 3u32);
//         assert_eq(result, 3u32);
//     }

//     @noupgrade
//     async constructor() {}
// }
