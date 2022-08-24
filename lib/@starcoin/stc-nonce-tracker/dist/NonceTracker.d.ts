import { Mutex } from 'await-semaphore';
declare const BlockTracker: any;
/**
 *  @property opts.provider - An ethereum provider
 *  @property opts.blockTracker - An instance of eth-block-tracker
 *  @property opts.getPendingTransactions - A function that returns an array of txMeta
 *  whose status is `submitted`
 *  @property opts.getConfirmedTransactions - A function that returns an array of txMeta
 *  whose status is `confirmed`
 */
export interface NonceTrackerOptions {
    provider: Record<string, unknown>;
    blockTracker: typeof BlockTracker;
    getPendingTransactions: (address: string) => Transaction[];
    getConfirmedTransactions: (address: string) => Transaction[];
}
/**
 * @property highestLocallyConfirmed - A hex string of the highest nonce on a confirmed transaction.
 * @property nextNetworkNonce - The next nonce suggested by the eth_getTransactionCount method.
 * @property highestSuggested - The maximum between the other two, the number returned.
 * @property local - Nonce details derived from pending transactions and highestSuggested
 * @property network - Nonce details from the eth_getTransactionCount method
 */
export interface NonceDetails {
    params: {
        highestLocallyConfirmed: number;
        nextNetworkNonce: number;
        highestSuggested: number;
    };
    local: HighestContinuousFrom;
    network: NetworkNextNonce;
}
/**
 * @property nextNonce - The highest of the nonce values derived based on confirmed and pending transactions and eth_getTransactionCount method
 * @property nonceDetails - details of nonce value derivation.
 * @property releaseLock
 */
export interface NonceLock {
    nextNonce: number;
    nonceDetails: NonceDetails;
    releaseLock: VoidFunction;
}
/**
 * @property name - The name for how the nonce was calculated based on the data used
 * @property nonce - The next nonce value suggested by the eth_getTransactionCount method.
 * @property blockNumber - The latest block from the network
 * @property baseCount - Transaction count from the network suggested by eth_getTransactionCount method
 */
export interface NetworkNextNonce {
    name: string;
    nonce: number;
    details: {
        blockNumber: string;
        baseCount: number;
    };
}
/**
 * @property name - The name for how the nonce was calculated based on the data used
 * @property nonce - The next suggested nonce
 * @property details{startPoint, highest} - the provided starting nonce that was used and highest derived from it (for debugging)
 */
export interface HighestContinuousFrom {
    name: string;
    nonce: number;
    details: {
        startPoint: number;
        highest: number;
    };
}
export interface Transaction {
    status: string;
    history: [Record<string, unknown>];
    txParams: {
        from: string;
        gas: string;
        value: string;
        nonce: string;
    };
}
export declare class NonceTracker {
    private provider;
    private blockTracker;
    private ethQuery;
    private getPendingTransactions;
    private getConfirmedTransactions;
    private lockMap;
    constructor(opts: NonceTrackerOptions);
    /**
     * @returns Promise<{ releaseLock: VoidFunction }> with the key releaseLock (the global mutex)
     */
    getGlobalLock(): Promise<{
        releaseLock: VoidFunction;
    }>;
    /**
     * this will return an object with the `nextNonce` `nonceDetails`, and the releaseLock
     * Note: releaseLock must be called after adding a signed tx to pending transactions (or discarding).
     *
     * @param address the hex string for the address whose nonce we are calculating
     * @returns {Promise<NonceLock>}
     */
    getNonceLock(address: string): Promise<NonceLock>;
    _globalMutexFree(): Promise<void>;
    _takeMutex(lockId: string): Promise<VoidFunction>;
    _lookupMutex(lockId: string): Mutex;
    /**
     * Function returns the nonce details from teh network based on the latest block
     * and eth_getTransactionCount method
     *
     * @param address the hex string for the address whose nonce we are calculating
     * @returns {Promise<NetworkNextNonce>}
     */
    _getNetworkNextNonce(address: string): Promise<NetworkNextNonce>;
    /**
     * Function returns the highest of the confirmed transaction from the address.
     * @param address the hex string for the address whose nonce we are calculating
     */
    _getHighestLocallyConfirmed(address: string): number;
    /**
     * Function returns highest nonce value from the transcation list provided
     * @param txList list of transactions
     */
    _getHighestNonce(txList: Transaction[]): number;
    /**
     * Function return the nonce value higher than the highest nonce value from the transaction list
     * starting from startPoint
     * @param txList {array} - list of txMeta's
     * @param startPoint {number} - the highest known locally confirmed nonce
     */
    _getHighestContinuousFrom(txList: Transaction[], startPoint: number): HighestContinuousFrom;
}
export {};
