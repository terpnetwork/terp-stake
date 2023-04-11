import { REST_URL, RPC_URL } from './constants/url';
import { SigningStargateClient } from '@cosmjs/stargate';
import { SigningCosmosClient } from '@cosmjs/launchpad';
import { makeSignDoc } from '@cosmjs/amino';
import { config } from './config';

const chainId = config.CHAIN_ID;
const chainName = config.CHAIN_NAME;
const govcoinDenom = config.GOV_COIN_DENOM;
const govcoinMinimalDenom = config.GOV_COIN_MINIMAL_DENOM;
const gascoinDenom = config.GAS_COIN_DENOM;
const gascoinMinimalDenom = config.GAS_COIN_MINIMAL_DENOM;
const coinDecimals = config.COIN_DECIMALS;
const prefix = config.PREFIX;
const govcoinGeckoId = config.GOV_COINGECKO_ID;
const gascoinGeckoId = config.GAS_COINGECKO_ID;

const chainConfig = {
    chainId: chainId,
    chainName,
    rpc: RPC_URL,
    rest: REST_URL,
    stakeCurrency: {
        govcoinDenom: 'TERP',
        govcoinMinimalDenom: 'uterp',
        coinDecimals,
        coinGeckoId: config.COINGECKO_ID,
    },
    bip44: {
        coinType: 118,
    },
    bech32Config: {
        bech32PrefixAccAddr: `${prefix}`,
        bech32PrefixAccPub: `${prefix}pub`,
        bech32PrefixValAddr: `${prefix}valoper`,
        bech32PrefixValPub: `${prefix}valoperpub`,
        bech32PrefixConsAddr: `${prefix}valcons`,
        bech32PrefixConsPub: `${prefix}valconspub`,
    },
    currencies: [
        {
            govcoinDenom,
            govcoinMinimalDenom,
            coinDecimals,
            govcoinGeckoId,
        },
        {
            gascoinDenom,
            gascoinMinimalDenom,
            coinDecimals,
            gascoinGeckoId,
        },
    ],
    feeCurrencies: [
        {
            gascoinDenom: 'THIOL',
            gascoinMinimalDenom: 'uthiol',
            coinDecimals,
            gascoinGeckoId,
        },
     ],
    coinType: config.COIN_TYPE,
    gasPriceStep: {
        low: config.GAS_PRICE_STEP_LOW,
        average: config.GAS_PRICE_STEP_AVERAGE,
        high: config.GAS_PRICE_STEP_HIGH,
    },
    features: config.FEATURES,
    walletUrlForStaking: config.STAKING_URL,
};

export const initializeChain = (cb) => {
    (async () => {
        if (!window.getOfflineSignerOnlyAmino || !window.keplr) {
            const error = 'Please install keplr extension';
            cb(error);
        } else {
            if (window.keplr.experimentalSuggestChain) {
                try {
             await window.keplr.experimentalSuggestChain({
                   rpc: "https://rpc.terp.network/",
    rest: "https://rpc.terp.nodestake.top/",
    chainId: "morocco-1",
    chainName: "Terp Network",
    stakeCurrency: {
        govcoinDenom: "TERP",
      govcoinMinimalDenom: "uterp",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
        bech32PrefixAccAddr: "terp",
        bech32PrefixAccPub: "terppub",
        bech32PrefixValAddr: "terpvaloper",
        bech32PrefixValPub: "terpvaloperpub",
        bech32PrefixConsAddr: "terpcvalcons",
        bech32PrefixConsPub: "terpvalconspub"
    },
    currencies: [
      {
        govcoinDenom: "TERP",
        govcoinMinimalDenom: "uterp",
        coinDecimals: 6,
      },
      {
        govcoinDenom: "THIOL",
        govcoinMinimalDenom: "uthiol",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        gascoinDenom: "THIOL",
        gascoinMinimalDenom: "uthiol",
        coinDecimals: 6,
      },
    ],
    gasPriceStep: {
      low: 0.001,
      average: 0.0025,
      high: 0.003,
    },
    features: ["ibc-go, stargate"],
   });                  
                await window.keplr.experimentalSuggestChain(chainConfig);
                } catch (error) {
                    const chainError = 'Failed to suggest the chain';
                    cb(chainError);
                }
            } else {
                const versionError = 'Please use the recent version of keplr extension';
                cb(versionError);
            }
        }

        if (window.keplr) {
            await window.keplr.enable(chainId);

            const offlineSigner = window.getOfflineSignerOnlyAmino(chainId);
            const accounts = await offlineSigner.getAccounts();
            cb(null, accounts);
        } else {
            return null;
        }
    })();
};

export const signTxAndBroadcast = (tx, address, cb) => {
    (async () => {
        await window.keplr && window.keplr.enable(chainId);
        const offlineSigner = window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(chainId);
        const client = await SigningStargateClient.connectWithSigner(
            RPC_URL,
            offlineSigner,
        );
        client.signAndBroadcast(
            address,
            tx.msgs ? tx.msgs : [tx.msg],
            tx.fee,
            tx.memo,
        ).then((result) => {
            if (result && result.code !== undefined && result.code !== 0) {
                cb(result.log || result.rawLog);
            } else {
                cb(null, result);
            }
        }).catch((error) => {
            cb(error && error.message);
        });
    })();
};

export const cosmosSignTxAndBroadcast = (tx, address, cb) => {
    (async () => {
        await window.keplr && window.keplr.enable(chainId);
        const offlineSigner = window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(chainId);
        const cosmJS = new SigningCosmosClient(
            REST_URL,
            address,
            offlineSigner,
        );

        cosmJS.signAndBroadcast(tx.msg, tx.fee, tx.memo).then((result) => {
            if (result && result.code !== undefined && result.code !== 0) {
                cb(result.log || result.rawLog);
            } else {
                cb(null, result);
            }
        }).catch((error) => {
            cb(error && error.message);
        });
    })();
};

export const aminoSignTxAndBroadcast = (tx, address, cb) => {
    (async () => {
        await window.keplr && window.keplr.enable(chainId);
        const offlineSigner = window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(chainId);

        const client = new SigningCosmosClient(
            REST_URL,
            address,
            offlineSigner,
        );

        const client2 = await SigningStargateClient.connectWithSigner(
            RPC_URL,
            offlineSigner,
        );
        const account = {};
        try {
            const {
                accountNumber,
                sequence,
            } = await client2.getSequence(address);
            account.accountNumber = accountNumber;
            account.sequence = sequence;
        } catch (e) {
            account.accountNumber = 0;
            account.sequence = 0;
        }

        const signDoc = makeSignDoc(
            tx.msgs ? tx.msgs : [tx.msg],
            tx.fee,
            chainId,
            tx.memo,
            account.accountNumber,
            account.sequence,
        );

        const {
            signed,
            signature,
        } = await offlineSigner.signAmino(address, signDoc);

        const msg = signed.msgs ? signed.msgs : [signed.msg];
        const fee = signed.fee;
        const memo = signed.memo;

        const voteTx = {
            msg,
            fee,
            memo,
            signatures: [signature],
        };

        client.broadcastTx(voteTx).then((result) => {
            if (result && result.code !== undefined && result.code !== 0) {
                cb(result.log || result.rawLog);
            } else {
                cb(null, result);
            }
        }).catch((error) => {
            cb(error && error.message);
        });
    })();
};

export const aminoSignTx = (tx, address, cb) => {
    (async () => {
        await window.keplr && window.keplr.enable(chainId);
        const offlineSigner = window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(chainId);

        const client = await SigningStargateClient.connectWithSigner(
            RPC_URL,
            offlineSigner,
        );

        const account = {};
        try {
            const {
                accountNumber,
                sequence,
            } = await client.getSequence(address);
            account.accountNumber = accountNumber;
            account.sequence = sequence;
        } catch (e) {
            account.accountNumber = 0;
            account.sequence = 0;
        }
        const signDoc = makeSignDoc(
            tx.msgs ? tx.msgs : [tx.msg],
            tx.fee,
            chainId,
            tx.memo,
            account.accountNumber,
            account.sequence,
        );

        offlineSigner.signAmino(address, signDoc).then((result) => {
            if (result && result.code !== undefined && result.code !== 0) {
                cb(result.log || result.rawLog);
            } else {
                cb(null, result);
            }
        }).catch((error) => {
            cb(error && error.message);
        });
    })();
};
