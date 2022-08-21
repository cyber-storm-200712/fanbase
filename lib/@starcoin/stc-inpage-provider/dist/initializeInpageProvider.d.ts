/// <reference types="node" />
import { Duplex } from 'stream';
import MetaMaskInpageProvider, { MetaMaskInpageProviderOptions } from './MetaMaskInpageProvider';
interface InitializeProviderOptions extends MetaMaskInpageProviderOptions {
    /**
     * The stream used to connect to the wallet.
     */
    connectionStream: Duplex;
    /**
     * Whether the provider should be set as window.ethereum.
     */
    shouldSetOnWindow?: boolean;
}
/**
 * Initializes a MetaMaskInpageProvider and (optionally) assigns it as window.ethereum.
 *
 * @param options - An options bag.
 * @param options.connectionStream - A Node.js stream.
 * @param options.jsonRpcStreamName - The name of the internal JSON-RPC stream.
 * @param options.maxEventListeners - The maximum number of event listeners.
 * @param options.shouldSendMetadata - Whether the provider should send page metadata.
 * @param options.shouldSetOnWindow - Whether the provider should be set as window.ethereum.
 * @returns The initialized provider (whether set or not).
 */
export declare function initializeProvider({ connectionStream, jsonRpcStreamName, logger, maxEventListeners, shouldSendMetadata, shouldSetOnWindow, }: InitializeProviderOptions): MetaMaskInpageProvider;
/**
 * Sets the given provider instance as window.starcoin and dispatches the
 * 'starcoin#initialized' event on window.
 *
 * @param providerInstance - The provider instance.
 */
export declare function setGlobalProvider(providerInstance: MetaMaskInpageProvider): void;
export {};
