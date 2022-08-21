/// <reference types="node" />
export declare function connect({ id, client, }: ConnectRequestFunctionParams): Promise<boolean>;
export declare const validateConnectRequest: ({ deviceId, key, baseUrl, }: ValidateConnectRequestParams) => ValidatedConnectRequest;
export declare const encodeConnectRequest: (key: ec.KeyPair) => Buffer;
export declare const requestConnect: (payload: Buffer, url: string) => Promise<Buffer>;
/**
 * `decodeConnectResponse` will call `StartPairingMode` on the device, which gives the user 60 seconds to
 * finalize the pairing. This will return an ephemeral public key, which is needed for the next
 * request.
 * - If the device is already paired, this ephemPub is simply used to encrypt the next request.
 * - If the device is not paired, it is needed to pair the device within 60 seconds.
 * @category Device Response
 * @internal
 * @returns true if we are paired to the device already
 */
export declare const decodeConnectResponse: (response: Buffer, key: ec.KeyPair) => {
    isPaired: boolean;
    fwVersion: Buffer;
    activeWallets: ActiveWallets | undefined;
    ephemeralPub: Buffer;
};
//# sourceMappingURL=connect.d.ts.map