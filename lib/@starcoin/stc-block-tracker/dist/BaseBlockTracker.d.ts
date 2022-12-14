import SafeEventEmitter from '@metamask/safe-event-emitter';
import { JsonRpcRequest, JsonRpcResponse } from 'json-rpc-engine';
export interface Provider extends SafeEventEmitter {
    sendAsync: <T, U>(req: JsonRpcRequest<T>, cb: (err: Error, response: JsonRpcResponse<U>) => void) => void;
}
interface BaseBlockTrackerArgs {
    blockResetDuration?: number;
}
export declare class BaseBlockTracker extends SafeEventEmitter {
    protected _isRunning: boolean;
    private _blockResetDuration;
    private _currentBlock;
    private _blockResetTimeout?;
    constructor(opts?: BaseBlockTrackerArgs);
    isRunning(): boolean;
    getCurrentBlock(): string | null;
    getLatestBlock(): Promise<string>;
    removeAllListeners(eventName: string | symbol): this;
    /**
     * To be implemented in subclass.
     */
    protected _start(): void;
    /**
     * To be implemented in subclass.
     */
    protected _end(): void;
    private _setupInternalEvents;
    private _onNewListener;
    private _onRemoveListener;
    private _maybeStart;
    private _maybeEnd;
    private _getBlockTrackerEventCount;
    protected _newPotentialLatest(newBlock: string): void;
    private _setCurrentBlock;
    private _setupBlockResetTimeout;
    private _cancelBlockResetTimeout;
    private _resetCurrentBlock;
}
export {};
