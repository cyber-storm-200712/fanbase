/// <reference types="node" />
export declare function getKvRecords({ type: _type, n: _n, start: _start, client, }: GetKvRecordsRequestFunctionParams): Promise<GetKvRecordsData>;
export declare const validateGetKvRequest: ({ url, fwConstants, sharedSecret, n, type, start, }: ValidateGetKvRequestParams) => {
    url: string;
    fwConstants: FirmwareConstants;
    sharedSecret: Buffer;
    type: number;
    n: number;
    start: number;
};
export declare const encodeGetKvRecordsRequest: ({ type, n, start, }: EncodeGetKvRecordsRequestParams) => Buffer;
export declare const encryptGetKvRecordsRequest: ({ payload, sharedSecret, }: EncrypterParams) => Buffer;
export declare const requestGetKvRecords: (payload: Buffer, url: string) => Promise<any>;
export declare const decryptGetKvRecordsResponse: (response: Buffer, sharedSecret: Buffer) => {
    decryptedData: Buffer;
    newEphemeralPub: Buffer;
};
export declare const decodeGetKvRecordsResponse: (data: Buffer, fwConstants: FirmwareConstants) => {
    records: any;
    total: number;
    fetched: number;
};
//# sourceMappingURL=getKvRecords.d.ts.map