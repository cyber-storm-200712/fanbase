/// <reference types="node" />
/**
 * `removeKvRecords` takes in an array of ids and sends a request to remove them from the Lattice.
 * @category Lattice
 * @returns A callback with an error or null.
 */
export declare function removeKvRecords({ type: _type, ids: _ids, client, }: RemoveKvRecordsRequestFunctionParams): Promise<Buffer>;
export declare const validateRemoveKvRequest: ({ url, fwConstants, sharedSecret, ids, type, }: ValidateRemoveKvRequestParams) => ValidatedRemoveKvRequest;
export declare const encodeRemoveKvRecordsRequest: ({ type, ids, fwConstants, }: EncodeRemoveKvRecordsRequestParams) => Buffer;
export declare const encryptRemoveKvRecordsRequest: ({ payload, sharedSecret, }: EncrypterParams) => Buffer;
export declare const requestRemoveKvRecords: (payload: Buffer, url: string) => Promise<any>;
export declare const decryptRemoveKvRecordsResponse: (response: Buffer, sharedSecret: Buffer) => {
    decryptedData: Buffer;
    newEphemeralPub: Buffer;
};
//# sourceMappingURL=removeKvRecords.d.ts.map