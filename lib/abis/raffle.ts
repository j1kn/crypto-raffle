export const RAFFLE_ABI = [
  {
    type: 'function',
    name: 'enterRaffle',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'raffleId',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
] as const;


