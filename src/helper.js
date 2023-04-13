import { REST_URL, RPC_URL } from './constants/url';
import { SigningStargateClient } from '@cosmjs/stargate';
import { config } from './config';
import { cosmos, InstallError } from '@cosmostation/extension-client';
import { getOfflineSigner } from '@cosmostation/cosmos-client';

const chainId = config.CHAIN_ID;
const chainName = config.CHAIN_NAME;
const govcoinDenom = config.GOV_COIN_DENOM;
const gascoinDenom = config.GAS_COIN_DENOM;
const govcoinMinimalDenom = config.GOV_COIN_MINIMAL_DENOM;
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
        coinDenom: govcoinDenom,
        coinMinimalDenom: govcoinMinimalDenom,
        coinDecimals: coinDecimals,
        coinGeckoId: govcoinGeckoId,
    },
    bip44: {
        coinType: config.COIN_TYPE,
    },
    bech32Config: {
        bech32PrefixAccAddr: `${prefix}`,
        bech32PrefixAccPub: `${prefix}pub`,
        bech32PrefixValAddr: `${prefix}valoper`,
        bech32PrefixValPub: `${prefix}valoperpub`,
        bech32PrefixConsAddr: `${prefix}valcons`,
        bech32PrefixConsPub: `${prefix}valconspub`,
    },
    currencies: [{
        coinDenom: govcoinDenom,
        coinMinimalDenom: govcoinMinimalDenom,
        coinDecimals: coinDecimals,
        coinGeckoId: govcoinGeckoId,
    }, {
        coinDenom: gascoinDenom,
        coinMinimalDenom: gascoinMinimalDenom,
        coinDecimals: coinDecimals,
        coinGeckoId: gascoinGeckoId,
    }],
    feeCurrencies: [{
        coinDenom: gascoinDenom,
        coinMinimalDenom: gascoinMinimalDenom,
        coinDecimals: coinDecimals,
        coinGeckoId: gascoinGeckoId,
        gasPriceStep: {
            low: config.GAS_PRICE_STEP_LOW,
            average: config.GAS_PRICE_STEP_AVERAGE,
            high: config.GAS_PRICE_STEP_HIGH,
        },
    }],
    coinType: config.COIN_TYPE,
    features: config.FEATURES,
    walletUrlForStaking: config.STAKING_URL,
};

export const initializeChain = (cb) => {
    (async () => {
        if (!window.getOfflineSignerOnlyAmino || !window.keplr) {
            const error = 'Download the Keplr Extension';
            cb(error);
        } else {
            if (window.keplr.experimentalSuggestChain) {
                try {
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

export const initializeCosmoStation = (cb) => {
    (async () => {
        try {
            const provider = await cosmos();
            const account = await provider.requestAccount(config.COSMOSTAION);
            cb(null, account);
        } catch (error) {
            if (error instanceof InstallError) {
                const error = 'Download the Cosmostation Extension';
                cb(error);
            } else if (error.code === 4001) {
                const error = 'user rejected request';
                cb(error);
            } else {
                cb(error.message);
            }
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

export const cosmoStationSign = (tx, address, cb) => {
    (async () => {
        const offlineSigner = await getOfflineSigner(chainId);
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
