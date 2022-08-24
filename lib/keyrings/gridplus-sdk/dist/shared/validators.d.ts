/// <reference types="node" />
import { UInt4 } from 'bitwise/types';
import { encReqCodes } from '../constants';
export declare const validateValueExists: (arg: {
    [key: string]: any;
}) => void;
export declare const validateIsUInt4: (n?: number) => UInt4;
export declare const validateNAddresses: (n: number) => void;
export declare const validateStartPath: (startPath: number[]) => void;
export declare const validateDeviceId: (deviceId?: string) => string;
export declare const validateEncryptRequestCode: (code: keyof typeof encReqCodes) => void;
export declare const validateAppName: (name?: string) => string;
export declare const validateResponse: (res: Buffer) => void;
export declare const validateUrl: (url?: string) => string;
export declare const validateBaseUrl: (baseUrl?: string) => string;
export declare const validateFwConstants: (fwConstants?: FirmwareConstants) => FirmwareConstants;
export declare const validateFwVersion: (fwVersion?: Buffer) => Buffer;
/**
 * Validate checksum. It will be the last 4 bytes of the decrypted payload. The length of the
 * decrypted payload will be fixed for each given message type.
 */
export declare const validateChecksum: (res: Buffer, length: number) => void;
export declare const validateRequestError: (err: LatticeError) => never;
export declare const validateWallet: (wallet?: Wallet) => Wallet;
export declare const validateEphemeralPub: (ephemeralPub?: Buffer) => Buffer;
export declare const validateSharedSecret: (sharedSecret?: Buffer) => Buffer;
export declare const validateKey: (key?: ec.KeyPair) => ec.KeyPair;
export declare const validateActiveWallets: (activeWallets?: ActiveWallets) => ActiveWallets;
export declare const validateKvRecords: (records?: KVRecords, fwConstants?: FirmwareConstants) => KVRecords;
export declare const validateKvRecord: ({ key, val }: KVRecords, fwConstants: FirmwareConstants) => {
    key: string;
    val: string;
};
export declare const validateRequestLength: (req: any, fwConstants: FirmwareConstants) => void;
//# sourceMappingURL=validators.d.ts.map