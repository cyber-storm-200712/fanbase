/// <reference types="node" />
import { Duplex } from 'stream';
import { JsonRpcRequest, JsonRpcResponse } from 'json-rpc-engine';
import BaseProvider, { BaseProviderOptions, UnvalidatedJsonRpcRequest } from './BaseProvider';
export interface SendSyncJsonRpcRequest extends JsonRpcRequest<unknown> {
    method: 'contract.call' | 'stc_accounts' | 'stc_coinbase' | 'stc_uninstallFilter' | 'net_version';
}
export interface MetaMaskInpageProviderOptions extends BaseProviderOptions {
    /**
     * Whether the provider should send page metadata.
     */
    shouldSendMetadata?: boolean;
}
interface SentWarningsState {
    enable: boolean;
    experimentalMethods: boolean;
    send: boolean;
    events: {
        close: boolean;
        data: boolean;
        networkChanged: boolean;
        notification: boolean;
    };
}
export default class MetaMaskInpageProvider extends BaseProvider {
    protected _sentWarnings: SentWarningsState;
    /**
     * Experimental methods can be found here.
     */
    readonly _fanbase: ReturnType<MetaMaskInpageProvider['_getExperimentalApi']>;
    networkVersion: string | null;
    /**
     * Indicating that this provider is a MetaMask provider.
     */
    readonly isFanbase: true;
    /**
     * @param connectionStream - A Node.js duplex stream
     * @param options - An options bag
     * @param options.jsonRpcStreamName - The name of the internal JSON-RPC stream.
     * Default: metamask-provider
     * @param options.logger - The logging API to use. Default: console
     * @param options.maxEventListeners - The maximum number of event
     * listeners. Default: 100
     * @param options.shouldSendMetadata - Whether the provider should
     * send page metadata. Default: true
     */
    constructor(connectionStream: Duplex, { jsonRpcStreamName, logger, maxEventListeners, shouldSendMetadata, }?: MetaMaskInpageProviderOptions);
    /**
     * Submits an RPC request per the given JSON-RPC request object.
     *
     * @param payload - The RPC request object.
     * @param cb - The callback function.
     */
    sendAsync(payload: JsonRpcRequest<unknown>, callback: (error: Error | null, result?: JsonRpcResponse<unknown>) => void): void;
    /**
     * We override the following event methods so that we can warn consumers
     * about deprecated events:
     *   addListener, on, once, prependListener, prependOnceListener
     */
    addListener(eventName: string, listener: (...args: unknown[]) => void): this;
    on(eventName: string, listener: (...args: unknown[]) => void): this;
    once(eventName: string, listener: (...args: unknown[]) => void): this;
    prependListener(eventName: string, listener: (...args: unknown[]) => void): this;
    prependOnceListener(eventName: string, listener: (...args: unknown[]) => void): this;
    /**
     * When the provider becomes disconnected, updates internal state and emits
     * required events. Idempotent with respect to the isRecoverable parameter.
     *
     * Error codes per the CloseEvent status codes as required by EIP-1193:
     * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
     *
     * @param isRecoverable - Whether the disconnection is recoverable.
     * @param errorMessage - A custom error message.
     * @emits MetaMaskInpageProvider#disconnect
     */
    protected _handleDisconnect(isRecoverable: boolean, errorMessage?: string): void;
    /**
     * Warns of deprecation for the given event, if applicable.
     */
    protected _warnOfDeprecation(eventName: string): void;
    /**
     * Equivalent to: ethereum.request('stc_requestAccounts')
     *
     * @deprecated Use request({ method: 'stc_requestAccounts' }) instead.
     * @returns A promise that resolves to an array of addresses.
     */
    enable(): Promise<string[]>;
    /**
     * Submits an RPC request for the given method, with the given params.
     *
     * @deprecated Use "request" instead.
     * @param method - The method to request.
     * @param params - Any params for the method.
     * @returns A Promise that resolves with the JSON-RPC response object for the
     * request.
     */
    send<T>(method: string, params?: T[]): Promise<JsonRpcResponse<T>>;
    /**
     * Submits an RPC request per the given JSON-RPC request object.
     *
     * @deprecated Use "request" instead.
     * @param payload - A JSON-RPC request object.
     * @param callback - An error-first callback that will receive the JSON-RPC
     * response object.
     */
    send<T>(payload: JsonRpcRequest<unknown>, callback: (error: Error | null, result?: JsonRpcResponse<T>) => void): void;
    /**
     * Accepts a JSON-RPC request object, and synchronously returns the cached result
     * for the given method. Only supports 4 specific RPC methods.
     *
     * @deprecated Use "request" instead.
     * @param payload - A JSON-RPC request object.
     * @returns A JSON-RPC response object.
     */
    send<T>(payload: SendSyncJsonRpcRequest): JsonRpcResponse<T>;
    /**
     * Internal backwards compatibility method, used in send.
     *
     * @deprecated
     */
    protected _sendSync(payload: SendSyncJsonRpcRequest): {
        id: import("json-rpc-engine").JsonRpcId;
        jsonrpc: "2.0";
        result: string | boolean | string[] | null;
    };
    /**
     * Constructor helper.
     * Gets experimental _fanbase API as Proxy, so that we can warn consumers
     * about its experiment nature.
     */
    protected _getExperimentalApi(): {
        /**
         * Determines if MetaMask is unlocked by the user.
         *
         * @returns Promise resolving to true if MetaMask is currently unlocked
         */
        isUnlocked: () => Promise<boolean>;
        /**
         * Make a batch RPC request.
         */
        requestBatch: (requests: UnvalidatedJsonRpcRequest[]) => Promise<unknown>;
    };
    /**
     * Upon receipt of a new chainId and networkVersion, emits corresponding
     * events and sets relevant public state.
     * Does nothing if neither the chainId nor the networkVersion are different
     * from existing values.
     *
     * @emits MetamaskInpageProvider#chainChanged
     * @emits MetamaskInpageProvider#networkChanged
     * @param networkInfo - An object with network info.
     * @param networkInfo.chainId - The latest chain ID.
     * @param networkInfo.networkVersion - The latest network ID.
     */
    protected _handleChainChanged({ chainId, networkVersion, }?: {
        chainId?: string;
        networkVersion?: string;
    }): void;
}
export {};
