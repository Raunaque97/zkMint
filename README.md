# ZK - Mint

### 🏗 Build Using Scaffold-ETH 2

🧪 A new revolutionary way to mint NFTs. Currently for permissioned minting (allowing only some people to mint), ie white/allow listing. All sorts of techniques are used like merkel proof based, signature based etc or simply storing map of addresses etc.
But with all the above method one needs to collect the `receiver` addresses which is cumbersome & lengthly process.

> But What if you can just send a link and anyone can mint using the link only once to a address of their choosing !!

## Demo

https://zk-mint.vercel.app/

## How It works

- The idea is to use a **secret** value and only some one who knows the secret should be able to mint.
- A issuer/project owner creates the links to be shared. Each links contain a secret encoded in it.
- But we cannot just simply include the secret in a blockchain transaction. **You will get frontrunned**. This is where _zk-Proofs_ come it.
- the user **proofs** they knows a valid secret without revealing it.
- For the secrets I used a eddsa signature of a random number. This way one can generate a unlimited amount of unque "secrets" with just storing a single eddsa public key in the contract. Also one can easily add metadata to the signature to create more interesting/complex minting (like encoding gurrantted traits in the mint)

In this demo the eddsa keys are hardcoded, Use the code inside `coupon.test.js` to create your own secret eddsa keys.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, and Typescript.

### Requirements

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart / run locally

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/Raunaque97/zkMint
cd zkMint && yarn install
```

2. Run `yarn circuit:compile` to compile the circom circuits and auto generate the `.wasm`, `*.zkey` & solidity `verifier.sol`.
   But first copy a `*.ptau` file inside `packages/circuits`, Follow [Link](https://github.com/iden3/snarkjs) for details
3. Run `yarn chain` to start a local dev network
4. Run `yarn deploy` to deploy the contracts
5. Finaly run `yarn start` to start NextJS dev server

### Testing

- Run smart contract test with `yarn test`
- Run zk circuit test script using with `yarn circuit:test`. runs the tests inside `./packages/circuits/test/coupon.test.js`
