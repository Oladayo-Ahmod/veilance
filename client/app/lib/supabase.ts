import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Helper functions
export const supabaseHelpers = {
  async getUser(address: string) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('address', address)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async createEscrowTransaction(
    escrowId: string,
    txId: string,
    caller: string,
    functionName: string,
    inputs: any
  ) {
    const supabase = createSupabaseClient();
    const { error } = await supabase.from('transactions').insert({
      transaction_id: txId,
      function_name: functionName,
      caller_address: caller,
      related_escrow_id: escrowId,
      inputs: JSON.stringify(inputs),
      status: 'pending'
    });
    
    
    if (error) throw error;
  },
  
  async updateTransactionStatus(txId: string, status: string, blockHeight?: number) {
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from('transactions')
      .update({ 
        status,
        block_height: blockHeight,
        confirmed_at: new Date().toISOString()
      })
      .eq('transaction_id', txId);
    
    if (error) throw error;
  }
};