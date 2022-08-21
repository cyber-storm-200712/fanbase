/// <reference types="node" />
export declare const buildGenericSigningMsgRequest: (req: any) => {
    payload: Buffer;
    extraDataPayloads: any[];
    schema: number;
    curveType: any;
    encodingType: any;
    hashType: any;
    omitPubkey: any;
    origPayloadBuf: any;
};
export declare const parseGenericSigningResponse: (res: any, off: any, req: any) => {
    pubkey: any;
    sig: any;
};
export declare const getEncodedPayload: (payload: any, encoding: any, allowedEncodings: any) => {
    payloadBuf: any;
    encoding: any;
};
//# sourceMappingURL=genericSigning.d.ts.map