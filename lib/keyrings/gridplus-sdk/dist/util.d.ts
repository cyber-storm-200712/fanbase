/// <reference types="node" />
/** @internal Parse a response from the Lattice1 */
export declare const parseLattice1Response: (r: any) => {
    errorMessage?: string;
    responseCode?: number;
    data?: any;
};
/** @internal */
export declare const checksum: (x: any) => number;
/** @internal */
export declare const toPaddedDER: (sig: any) => Buffer;
/** @internal */
export declare const isValidAssetPath: (path: any, fwConstants: any) => boolean;
/** @internal */
export declare const splitFrames: (data: any, frameSz: any) => any[];
/** @internal Ensure a param is represented by a buffer */
export declare const ensureHexBuffer: (x: any, zeroIsNull?: boolean) => Buffer;
/** @internal */
export declare const fixLen: (msg: any, length: any) => any;
/** @internal */
export declare const aes256_encrypt: (data: any, key: any) => Buffer;
/** @internal */
export declare const aes256_decrypt: (data: any, key: any) => Buffer;
/** @internal */
export declare const parseDER: (sigBuf: Buffer) => {
    r: Buffer;
    s: Buffer;
};
/** @internal */
export declare const getP256KeyPair: (priv: any) => any;
/** @internal */
export declare const getP256KeyPairFromPub: (pub: any) => any;
/** @internal */
export declare const buildSignerPathBuf: (signerPath: any, varAddrPathSzAllowed: any) => Buffer;
/** @internal */
export declare const isAsciiStr: (str: any, allowFormatChars?: boolean) => boolean;
/** @internal Check if a value exists in an object. Only checks first level of keys. */
export declare const existsIn: (val: any, obj: any) => boolean;
/** @internal Create a buffer of size `n` and fill it with random data */
export declare const randomBytes: (n: any) => Buffer;
/** @internal `isUInt4` accepts a number and returns true if it is a UInt4 */
export declare const isUInt4: (n: number) => boolean;
/**
 * Generates an application secret for use in maintaining connection to device.
 * @param {Buffer} deviceId - The device ID of the device you want to generate a token for.
 * @param {Buffer} password - The password entered when connecting to the device.
 * @param {Buffer} appName - The name of the application.
 * @returns an application secret as a Buffer
 * @public
 */
export declare const generateAppSecret: (deviceId: Buffer, password: Buffer, appName: Buffer) => Buffer;
/**
 * Generic signing does not return a `v` value like legacy ETH signing requests did.
 * Get the `v` component of the signature as well as an `initV`
 * parameter, which is what you need to use to re-create an `@ethereumjs/tx`
 * object. There is a lot of tech debt in `@ethereumjs/tx` which also
 * inherits the tech debt of ethereumjs-util.
 * 1.  The legacy `Transaction` type can call `_processSignature` with the regular
 *     `v` value.
 * 2.  Newer transaction types such as `FeeMarketEIP1559Transaction` will subtract
 *     27 from the `v` that gets passed in, so we need to add `27` to create `initV`
 * @param tx - An @ethereumjs/tx Transaction object or Buffer (serialized tx)
 * @param resp - response from Lattice. Can be either legacy or generic signing variety
 * @returns bn.js BN object containing the `v` param
 */
export declare const getV: (tx: any, resp: any) => any;
/**
 * Takes a list of ABI data objects and a selector, and returns the earliest ABI data object that
 * matches the selector.
 */
export declare function selectDefFrom4byteABI(abiData: any[], selector: string): any;
/**
 *  Fetches calldata from a remote scanner based on the transaction's `chainId`
 */
export declare function fetchCalldataDecoder(_data: Uint8Array | string, to: string, _chainId: number | string): Promise<{
    abi: any;
    def: any;
}>;
/** @internal */
export declare const EXTERNAL: {
    getV: (tx: any, resp: any) => any;
    generateAppSecret: (deviceId: Buffer, password: Buffer, appName: Buffer) => Buffer;
    fetchCalldataDecoder: typeof fetchCalldataDecoder;
};
//# sourceMappingURL=util.d.ts.map