/// <reference types="node" />
/**
 * If a pairing secret is provided, `pair` uses it to sign a hash of the public key, name, and
 * pairing secret. It then sends the name and signature to the device. If no pairing secret is
 * provided, `pair` sends a zero-length name buffer to the device.
 * @category Lattice
 * @returns The active wallet object.
 */
export declare function pair({ pairingSecret, client }: PairRequestParams): Promise<any>;
export declare const encodePairRequest: (key: ec.KeyPair, pairingSecret: string, name: string) => Buffer;
export declare const encryptPairRequest: ({ payload, sharedSecret, }: EncrypterParams) => Buffer;
export declare const requestPair: (payload: Buffer, url: string) => Promise<any>;
/**
 * Pair will create a new pairing if the user successfully enters the secret into the device in
 * time. If successful (`status=0`), the device will return a new ephemeral public key, which is
 * used to derive a shared secret for the next request
 * @category Device Response
 * @internal
 * @returns error (or null)
 */
export declare const decryptPairResponse: (encryptedResponse: any, sharedSecret: Buffer) => DecryptedResponse;
//# sourceMappingURL=pair.d.ts.map