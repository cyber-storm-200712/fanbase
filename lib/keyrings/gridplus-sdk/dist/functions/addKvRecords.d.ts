/// <reference types="node" />
/**
 * `addKvRecords` takes in a set of key-value records and sends a request to add them to the
 * Lattice.
 * @category Lattice
 * @returns A callback with an error or null.
 */
export declare function addKvRecords({ type, records, caseSensitive, client, }: AddKvRecordsRequestFunctionParams): Promise<Buffer>;
export declare const validateAddKvRequest: ({ url, fwConstants, sharedSecret, records, }: ValidateAddKvRequestParams) => {
    url: string;
    fwConstants: FirmwareConstants;
    sharedSecret: Buffer;
    validRecords: KVRecords;
};
export declare const encodeAddKvRecordsRequest: ({ records, fwConstants, type, caseSensitive, }: EncodeAddKvRecordsRequestParams) => Buffer;
export declare const encryptAddKvRecordsRequest: ({ payload, sharedSecret, }: EncrypterParams) => Buffer;
export declare const requestAddKvRecords: (payload: Buffer, url: string) => Promise<any>;
export declare const decryptAddKvRecordsResponse: (response: Buffer, sharedSecret: Buffer) => {
    decryptedData: Buffer;
    newEphemeralPub: Buffer;
};
//# sourceMappingURL=addKvRecords.d.ts.map