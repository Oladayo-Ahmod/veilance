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
  try {
    const transitions = txDetails?.execution?.transitions || [];
    
    for (const transition of transitions) {
      if (transition.function === "create_escrow") {
        const futureOutput = transition.outputs?.find((output: any) => output.type === "future");
        console.log("Future output:", futureOutput);
        
        if (futureOutput) {
          // Parse the value string to extract the argument
          const valueStr = futureOutput.value;
          console.log("Value string:", valueStr);
          
          const regex = /arguments:\s*\[\s*(\d+)field\s*\]/;
          const match = valueStr.match(regex);
          
          if (match && match[1]) {
            console.log("Extracted escrow_id via regex:", match[1]);
            return match[1];
          }
          
          try {
            // Remove newlines and extra spaces
            const cleaned = valueStr.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
            console.log("Cleaned string:", cleaned);
            
            // Extract the number between [ and ]field
            const numberMatch = cleaned.match(/\[\s*(\d+)field\s*\]/);
            if (numberMatch && numberMatch[1]) {
              console.log("Extracted escrow_id via number match:", numberMatch[1]);
              return numberMatch[1];
            }
          } catch (e) {
            console.log("JSON parse attempt failed:", e);
          }
        }
      }
    }
    
    throw new Error("Escrow ID not found in transaction");
  } catch (error) {
    console.error("Error extracting escrow_id:", error);
    return "";
  }
};