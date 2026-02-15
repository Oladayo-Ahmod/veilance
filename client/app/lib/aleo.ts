export const fetchTransactionDetails = async (finalTxId: string) => {
  const response = await fetch(
    `https://api.provable.com/v2/testnet/transaction/${finalTxId}`,
    {
      headers: { 'Accept': 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch transaction: ${response.statusText}`);
  }

  return response.json();
};

export const extractEscrowIdFromTxDetails = (txDetails: any): string => {
  const transitions = txDetails?.execution?.transitions || [];
  
  for (const transition of transitions) {
    if (transition.function === "create_escrow") {
      const futureOutput = transition.outputs?.find((output: any) => output.type === "future");
      
      if (futureOutput?.value?.arguments?.[0]) {
        // Remove "field" suffix if present
        return futureOutput.value.arguments[0].replace('field', '');
      }
    }
  }
  
  throw new Error("Escrow ID not found in transaction");
};