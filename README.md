Terp-Stake (for Communities)
===

Terp-Stake is a collaborative interface for an entire community (or) blockchain network to:

- identify stakeholders such as validator node hosts (will expand to other types of node hosts depending on the network)
- discover proposals & more!

Currently, the aim of Terp-Stake is to be the default/defacto interface when bootstrapping community activities of a
specific chain (on testnet or mainnet).

# Requirements

yarn

# Instructions

1. clone repository and install packages

  ```sh
  git clone https://github.com/terpnetwork/terp-stake.git
  cd terp-stake
  yarn
  ```

2. update chain config

`NOTE:` below is the chain config for Terp TestNet

`src/config.js`

 ```js
export const config = {
    RPC_URL: 'https://',
    REST_URL: 'https://',
    EXPLORER_URL: 'https://',
    STAKING_URL: 'https://',
    NETWORK_NAME: 'Terp-Network',
    NETWORK_TYPE: 'testnet',
    CHAIN_ID: 'morocco-1',
    CHAIN_NAME: 'Terp-Network',
    COIN_DENOM: 'TERPX',
    COIN_MINIMAL_DENOM: 'uterpx',
    COIN_DECIMALS: 6,
    FEE_CURRENCY: 'upersyx'
    PREFIX: 'terp',
    COIN_TYPE: 118,
    COINGECKO_ID: '-',
    GAS_PRICE_STEP_LOW: 0.0025,
    GAS_PRICE_STEP_AVERAGE: 0.025,
    GAS_PRICE_STEP_HIGH: 0.04,
    FEATURES: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
};
 ```

3. start app

 ```sh
 yarn start
 ```
