import { bytes } from '../lib/runtime/serde/types';
export declare function encodeTransactionAuthenticator(msgBytes: bytes, publicKeyBytes: bytes): string;
export declare function decodeTransactionAuthenticator(signatureHex: string): {
    publicKey: bytes;
    signature: bytes;
};
export declare function signPersonalMessage(msgBytes: bytes, privateKeyBytes: bytes): Promise<string>;
export declare function verifyPersonalMessage(signature: string, msgBytes: bytes, publicKeyBytes: bytes): Promise<boolean>;
