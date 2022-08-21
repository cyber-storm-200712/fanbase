/// <reference types="node" />
/**
 * Fetch the active wallet in the device.
 *
 * The Lattice has two wallet interfaces: internal and external. If a SafeCard is inserted and
 * unlocked, the external interface is considered "active" and this will return its {@link Wallet}
 * data. Otherwise it will return the info for the internal Lattice wallet.
 */
export declare function fetchActiveWallet({ client, }: FetchActiveWalletRequestFunctionParams): Promise<ActiveWallets>;
export declare const validateFetchActiveWallet: ({ url, sharedSecret, }: ValidateFetchActiveWalletRequestParams) => {
    url: string;
    sharedSecret: Buffer;
};
export declare const encryptFetchActiveWalletRequest: ({ sharedSecret, }: ValidatedFetchActiveWalletRequest) => Buffer;
export declare const requestFetchActiveWallet: (payload: Buffer, url: string) => Promise<any>;
export declare const decodeFetchActiveWalletResponse: (data: Buffer) => ActiveWallets;
export declare const decryptFetchActiveWalletResponse: (response: Buffer, sharedSecret: Buffer) => {
    decryptedData: Buffer;
    newEphemeralPub: Buffer;
};
//# sourceMappingURL=fetchActiveWallet.d.ts.map