/// <reference types="node" />
import { DataItem, RegistryItem } from "@keystonehq/bc-ur-registry";
export declare class ETHSignature extends RegistryItem {
    private requestId?;
    private origin?;
    private signature;
    getRegistryType: () => import("@keystonehq/bc-ur-registry").RegistryType;
    constructor(signature: Buffer, requestId?: Buffer, origin?: string);
    getRequestId: () => Buffer | undefined;
    getSignature: () => Buffer;
    getOrigin: () => string | undefined;
    toDataItem: () => DataItem;
    static fromDataItem: (dataItem: DataItem) => ETHSignature;
    static fromCBOR: (_cborPayload: Buffer) => ETHSignature;
}
