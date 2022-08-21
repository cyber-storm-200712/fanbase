/// <reference types="node" />
/**
 * `getAddresses` takes a starting path and a number to get the addresses or public keys associated
 * with the active wallet.
 * @category Lattice
 * @returns An array of addresses or public keys.
 */
export declare function getAddresses({ startPath, n, flag, client, }: GetAddressesRequestFunctionParams): Promise<Buffer[]>;
export declare const validateGetAddressesRequest: ({ startPath, n, flag, url, fwVersion, wallet, sharedSecret, }: ValidateGetAddressesRequestParams) => {
    url: string;
    fwVersion: Buffer;
    wallet: Wallet;
    sharedSecret: Buffer;
};
export declare const encodeGetAddressesRequest: ({ fwVersion, startPath, n, wallet, flag, }: EncodeGetAddressesRequestParams) => Buffer;
export declare const encryptGetAddressesRequest: ({ payload, sharedSecret, }: EncrypterParams) => Buffer;
export declare const requestGetAddresses: (payload: Buffer, url: string) => Promise<any>;
/**
 * @internal
 * @return an array of address strings or pubkey buffers
 */
export declare const decodeGetAddresses: (data: any, flag: number) => Buffer[];
export declare const decryptGetAddressesResponse: (response: Buffer, sharedSecret: Buffer) => {
    decryptedData: Buffer;
    newEphemeralPub: Buffer;
};
//# sourceMappingURL=getAddresses.d.ts.map