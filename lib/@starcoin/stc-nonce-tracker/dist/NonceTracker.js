"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonceTracker = void 0;
const assert_1 = __importDefault(require("assert"));
const await_semaphore_1 = require("await-semaphore");
const bignumber_1 = require("@ethersproject/bignumber");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const EthQuery = require('@starcoin/stc-query');
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const BlockTracker = require('@starcoin/stc-block-tracker');
class NonceTracker {
    constructor(opts) {
        this.provider = opts.provider;
        this.blockTracker = opts.blockTracker;
        this.ethQuery = new EthQuery(opts.provider);
        this.getPendingTransactions = opts.getPendingTransactions;
        this.getConfirmedTransactions = opts.getConfirmedTransactions;
        this.lockMap = {};
    }
    /**
     * @returns Promise<{ releaseLock: VoidFunction }> with the key releaseLock (the global mutex)
     */
    async getGlobalLock() {
        const globalMutex = this._lookupMutex('global');
        // await global mutex free
        const releaseLock = await globalMutex.acquire();
        return { releaseLock };
    }
    /**
     * this will return an object with the `nextNonce` `nonceDetails`, and the releaseLock
     * Note: releaseLock must be called after adding a signed tx to pending transactions (or discarding).
     *
     * @param address the hex string for the address whose nonce we are calculating
     * @returns {Promise<NonceLock>}
     */
    async getNonceLock(address) {
        // await global mutex free
        await this._globalMutexFree();
        // await lock free, then take lock
        const releaseLock = await this._takeMutex(address);
        try {
            // evaluate multiple nextNonce strategies
            const networkNonceResult = await this._getNetworkNextNonce(address);
            const highestLocallyConfirmed = this._getHighestLocallyConfirmed(address);
            const nextNetworkNonce = networkNonceResult.nonce;
            const highestSuggested = Math.max(nextNetworkNonce, highestLocallyConfirmed);
            const pendingTxs = this.getPendingTransactions(address);
            const localNonceResult = this._getHighestContinuousFrom(pendingTxs, highestSuggested);
            const nonceDetails = {
                params: {
                    highestLocallyConfirmed,
                    nextNetworkNonce,
                    highestSuggested,
                },
                local: localNonceResult,
                network: networkNonceResult,
            };
            const nextNonce = Math.max(networkNonceResult.nonce, localNonceResult.nonce);
            assert_1.default(Number.isInteger(nextNonce), `nonce-tracker - nextNonce is not an integer - got: (${typeof nextNonce}) "${nextNonce}"`);
            // return nonce and release cb
            return { nextNonce, nonceDetails, releaseLock };
        }
        catch (err) {
            // release lock if we encounter an error
            releaseLock();
            throw err;
        }
    }
    async _globalMutexFree() {
        const globalMutex = this._lookupMutex('global');
        const releaseLock = await globalMutex.acquire();
        releaseLock();
    }
    async _takeMutex(lockId) {
        const mutex = this._lookupMutex(lockId);
        const releaseLock = await mutex.acquire();
        return releaseLock;
    }
    _lookupMutex(lockId) {
        let mutex = this.lockMap[lockId];
        if (!mutex) {
            mutex = new await_semaphore_1.Mutex();
            this.lockMap[lockId] = mutex;
        }
        return mutex;
    }
    /**
     * Function returns the nonce details from teh network based on the latest block
     * and eth_getTransactionCount method
     *
     * @param address the hex string for the address whose nonce we are calculating
     * @returns {Promise<NetworkNextNonce>}
     */
    async _getNetworkNextNonce(address) {
        // calculate next nonce
        // we need to make sure our base count
        // and pending count are from the same block
        const blockNumber = await new Promise((resolve, reject) => {
            return this.ethQuery.getChainInfo((err, res) => {
                if (err) {
                    return reject(err);
                }
                const number = res && res.head.number || "";
                return resolve(number);
            });
        });
        const baseCountBN = await new Promise((resolve, reject) => {
            return this.ethQuery.getResource(address, '0x1::Account::Account', (err, res) => {
                if (err) {
                    return reject(err);
                }
                const sequence_number = res && res.value[6][1].U64 || "";
                return resolve(bignumber_1.BigNumber.from(sequence_number));
            });
        });
        const baseCount = baseCountBN.toNumber();
        assert_1.default(Number.isInteger(baseCount), `nonce-tracker - baseCount is not an integer - got: (${typeof baseCount}) "${baseCount}"`);
        return { name: 'network', nonce: baseCount, details: { blockNumber, baseCount } };
    }
    /**
     * Function returns the highest of the confirmed transaction from the address.
     * @param address the hex string for the address whose nonce we are calculating
     */
    _getHighestLocallyConfirmed(address) {
        const confirmedTransactions = this.getConfirmedTransactions(address);
        const highest = this._getHighestNonce(confirmedTransactions);
        return Number.isInteger(highest) ? highest : 0;
    }
    /**
     * Function returns highest nonce value from the transcation list provided
     * @param txList list of transactions
     */
    _getHighestNonce(txList) {
        const nonces = txList.map((txMeta) => {
            const { nonce } = txMeta.txParams;
            assert_1.default(typeof nonce === 'string', 'nonces should be hex strings');
            return parseInt(nonce, 16);
        });
        const highestNonce = Math.max.apply(null, nonces);
        return highestNonce;
    }
    /**
     * Function return the nonce value higher than the highest nonce value from the transaction list
     * starting from startPoint
     * @param txList {array} - list of txMeta's
     * @param startPoint {number} - the highest known locally confirmed nonce
     */
    _getHighestContinuousFrom(txList, startPoint) {
        const nonces = txList.map((txMeta) => {
            const { nonce } = txMeta.txParams;
            assert_1.default(typeof nonce === 'string', 'nonces should be hex strings');
            return parseInt(nonce, 16);
        });
        let highest = startPoint;
        while (nonces.includes(highest)) {
            highest += 1;
        }
        return { name: 'local', nonce: highest, details: { startPoint, highest } };
    }
}
exports.NonceTracker = NonceTracker;
//# sourceMappingURL=NonceTracker.js.map