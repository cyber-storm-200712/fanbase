/// <reference types="node" />
/**
 * `sign` builds and sends a request for signing to the device.
 * @category Lattice
 * @returns The response from the device.
 */
export declare function sign({ data, currency, cachedData, nextCode, client, }: SignRequestFunctionParams): Promise<SignData>;
export declare const validateSignRequest: ({ url, fwConstants, sharedSecret, wallet, }: ValidateSignRequestParams) => {
    url: string;
    fwConstants: FirmwareConstants;
    sharedSecret: Buffer;
    wallet: Wallet;
};
export declare const encodeSignRequest: ({ request, fwConstants, wallet, cachedData, nextCode, }: EncodeSignRequestParams) => {
    payload: Buffer;
    hasExtraPayloads: number;
};
export declare const encryptSignRequest: ({ payload, sharedSecret, }: EncrypterParams) => Buffer;
export declare const requestSign: (payload: Buffer, url: string) => Promise<any>;
export declare const decodeSignResponse: ({ data, request, isGeneric, currency, }: DecodeSignResponseParams) => SignData;
export declare const decryptSignResponse: (response: Buffer, sharedSecret: Buffer) => {
    decryptedData: Buffer;
    newEphemeralPub: Buffer;
};
//# sourceMappingURL=sign.d.ts.map