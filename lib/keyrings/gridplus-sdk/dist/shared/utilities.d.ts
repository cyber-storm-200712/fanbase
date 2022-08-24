/// <reference types="node" />
/**
 * Get 64 bytes representing the public key This is the uncompressed key without the leading 04
 * byte
 * @param KeyPair - //TODO Describe the keypair
 * @param LE - Whether to return the public key in little endian format.
 * @returns A Buffer containing the public key.
 */
export declare const getPubKeyBytes: (key: ec.KeyPair, LE?: boolean) => Buffer;
/**
 * Get the shared secret, derived via ECDH from the local private key and the ephemeral public key
 * @internal
 * @returns Buffer
 */
export declare const getSharedSecret: (key: ec.KeyPair, ephemeralPub: ec.KeyPair) => Buffer;
export declare const parseWallets: (walletData: any) => ActiveWallets;
export declare const isFWSupported: (fwVersion: FirmwareVersion, versionSupported: FirmwareVersion) => boolean;
//# sourceMappingURL=utilities.d.ts.map