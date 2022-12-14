import { JsonRpcProvider } from './jsonrpc-provider';
import { Networkish } from '../networks';
export declare type ExternalProvider = {
    isStarMask?: boolean;
    host?: string;
    path?: string;
    sendAsync?: (request: {
        method: string;
        params?: Array<any>;
    }, callback: (error: any, response: any) => void) => void;
    send?: (request: {
        method: string;
        params?: Array<any>;
    }, callback: (error: any, response: any) => void) => void;
    request?: (request: {
        method: string;
        params?: Array<any>;
    }) => Promise<any>;
};
export declare type JsonRpcFetchFunc = (method: string, params?: Array<any>) => Promise<any>;
export declare class Web3Provider extends JsonRpcProvider {
    readonly provider: ExternalProvider;
    readonly jsonRpcFetchFunc: JsonRpcFetchFunc;
    constructor(provider: ExternalProvider | JsonRpcFetchFunc, network?: Networkish);
    send(method: string, params: Array<any>): Promise<any>;
}
