/// <reference types="node" />
import BN = require('bn.js');
import rlp = require('rlp');
declare const secp256k1: any;
declare const Buffer: any;
export interface ECDSASignature {
    v: number;
    r: Buffer;
    s: Buffer;
}
/**
 * The max integer that this VM can handle
 */
export declare const MAX_INTEGER: BN;
/**
 * 2^256
 */
export declare const TWO_POW256: BN;
/**
 * Keccak-256 hash of null
 */
export declare const KECCAK256_NULL_S: string;
/**
 * Keccak-256 hash of null
 */
export declare const KECCAK256_NULL: Buffer;
/**
 * Keccak-256 of an RLP of an empty array
 */
export declare const KECCAK256_RLP_ARRAY_S: string;
/**
 * Keccak-256 of an RLP of an empty array
 */
export declare const KECCAK256_RLP_ARRAY: Buffer;
/**
 * Keccak-256 hash of the RLP of null
 */
export declare const KECCAK256_RLP_S: string;
/**
 * Keccak-256 hash of the RLP of null
 */
export declare const KECCAK256_RLP: Buffer;
/**
 * [`BN`](https://github.com/indutny/bn.js)
 */
export { BN };
/**
 * [`rlp`](https://github.com/ethereumjs/rlp)
 */
export { rlp };
/**
 * [`secp256k1`](https://github.com/cryptocoinjs/secp256k1-node/)
 */
export { secp256k1 };
/**
 * Returns a buffer filled with 0s.
 * @param bytes the number of bytes the buffer should be
 */
export declare const zeros: (bytes: number) => Buffer;
/**
 * Returns a zero address.
 */
export declare const zeroAddress: () => string;
/**
 * Left Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 * @param msg the value to pad (Buffer|Array)
 * @param length the number of bytes the output should be
 * @param right whether to start padding form the left or right
 * @return (Buffer|Array)
 */
export declare const setLengthLeft: (msg: any, length: number, right?: boolean) => any;
export declare const setLength: (msg: any, length: number, right?: boolean) => any;
/**
 * Right Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 * @param msg the value to pad (Buffer|Array)
 * @param length the number of bytes the output should be
 * @return (Buffer|Array)
 */
export declare const setLengthRight: (msg: any, length: number) => any;
/**
 * Trims leading zeros from a `Buffer` or an `Array`.
 * @param a (Buffer|Array|String)
 * @return (Buffer|Array|String)
 */
export declare const unpad: (a: any) => any;
export declare const stripZeros: (a: any) => any;
/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 * @param v the value
 */
export declare const toBuffer: (v: any) => Buffer;
/**
 * Converts a `Buffer` to a `Number`.
 * @param buf `Buffer` object to convert
 * @throws If the input number exceeds 53 bits.
 */
export declare const bufferToInt: (buf: Buffer) => number;
/**
 * Converts a `Buffer` into a hex `String`.
 * @param buf `Buffer` object to convert
 */
export declare const bufferToHex: (buf: Buffer) => string;
/**
 * Interprets a `Buffer` as a signed integer and returns a `BN`. Assumes 256-bit numbers.
 * @param num Signed integer value
 */
export declare const fromSigned: (num: Buffer) => BN;
/**
 * Converts a `BN` to an unsigned integer and returns it as a `Buffer`. Assumes 256-bit numbers.
 * @param num
 */
export declare const toUnsigned: (num: BN) => Buffer;
/**
 * Creates Keccak hash of the input
 * @param a The input data (Buffer|Array|String|Number)
 * @param bits The Keccak width
 */
export declare const keccak: (a: any, bits?: number) => Buffer;
/**
 * Creates Keccak-256 hash of the input, alias for keccak(a, 256).
 * @param a The input data (Buffer|Array|String|Number)
 */
export declare const keccak256: (a: any) => Buffer;
/**
 * Creates SHA256 hash of the input.
 * @param a The input data (Buffer|Array|String|Number)
 */
export declare const sha256: (a: any) => Buffer;
/**
 * Creates RIPEMD160 hash of the input.
 * @param a The input data (Buffer|Array|String|Number)
 * @param padded Whether it should be padded to 256 bits or not
 */
export declare const ripemd160: (a: any, padded: boolean) => Buffer;
/**
 * Creates SHA-3 hash of the RLP encoded version of the input.
 * @param a The input data
 */
export declare const rlphash: (a: rlp.Input) => Buffer;
/**
 * Checks if the private key satisfies the rules of the curve secp256k1.
 */
export declare const isValidPrivate: (privateKey: Buffer) => boolean;
/**
 * Checks if the public key satisfies the rules of the curve secp256k1
 * and the requirements of Ethereum.
 * @param publicKey The two points of an uncompressed key, unless sanitize is enabled
 * @param sanitize Accept public keys in other formats
 */
export declare const isValidPublic: (publicKey: Buffer, sanitize?: boolean) => boolean;
/**
 * Returns the ethereum address of a given public key.
 * Accepts "Ethereum public keys" and SEC1 encoded keys.
 * @param pubKey The two points of an uncompressed key, unless sanitize is enabled
 * @param sanitize Accept public keys in other formats
 */
export declare const pubToAddress: (pubKey: Buffer, sanitize?: boolean) => Buffer;
export declare const publicToAddress: (pubKey: Buffer, sanitize?: boolean) => Buffer;
export declare const pubToAddressED: (pubKey: Buffer, sanitize?: boolean) => Buffer;
export declare const publicToAddressED: (pubKey: Buffer, sanitize?: boolean) => Buffer;
/**
 * Returns the ethereum public key of a given private key.
 * @param privateKey A private key must be 256 bits wide
 */
export declare const privateToPublic: (privateKey: Buffer) => Buffer;
/**
 * Returns the ethereum public key of a given private key.
 * @param privateKey A private key must be 256 bits wide
 */
export declare const privateToPublicED: (privateKey: Buffer) => Buffer;
/**
 * Converts a public key to the Ethereum format.
 */
export declare const importPublic: (publicKey: Buffer) => Buffer;
/**
 * Returns the ECDSA signature of a message hash.
 */
export declare const ecsign: (msgHash: Buffer, privateKey: Buffer, chainId?: number | undefined) => ECDSASignature;
/**
 * Returns the keccak-256 hash of `message`, prefixed with the header used by the `eth_sign` RPC call.
 * The output of this function can be fed into `ecsign` to produce the same signature as the `eth_sign`
 * call for a given `message`, or fed to `ecrecover` along with a signature to recover the public key
 * used to produce the signature.
 */
export declare const hashPersonalMessage: (message: any) => Buffer;
/**
 * ECDSA public key recovery from signature.
 * @returns Recovered public key
 */
export declare const ecrecover: (msgHash: Buffer, v: number, r: Buffer, s: Buffer, chainId?: number | undefined) => Buffer;
/**
 * Convert signature parameters into the format of `eth_sign` RPC method.
 * @returns Signature
 */
export declare const toRpcSig: (v: number, r: Buffer, s: Buffer, chainId?: number | undefined) => string;
/**
 * Convert signature format of the `eth_sign` RPC method to signature parameters
 * NOTE: all because of a bug in geth: https://github.com/ethereum/go-ethereum/issues/2053
 */
export declare const fromRpcSig: (sig: string) => ECDSASignature;
/**
 * Returns the ethereum address of a given private key.
 * @param privateKey A private key must be 256 bits wide
 */
export declare const privateToAddress: (privateKey: Buffer) => Buffer;
export declare const privateToAddressED: (privateKey: Buffer) => Buffer;
/**
 * Checks if the address is a valid. Accepts checksummed addresses too.
 */
export declare const isValidAddress: (address: string) => boolean;
/**
 * Checks if the value is a valid receiptIdentifier, more in SIP#22.
 */
export declare const isValidReceiptIdentifier: (value: string) => boolean;
/**
 * Checks if a given address is a zero address.
 */
export declare const isZeroAddress: (address: string) => boolean;
/**
 * Returns a checksummed address.
 */
export declare const toChecksumAddress: (address: string) => string;
/**
 * Checks if the address is a valid checksummed address.
 */
export declare const isValidChecksumAddress: (address: string) => boolean;
/**
 * Generates an address of a newly created contract.
 * @param from The address which is creating this new address
 * @param nonce The nonce of the from account
 */
export declare const generateAddress: (from: Buffer, nonce: Buffer) => Buffer;
/**
 * Generates an address for a contract created using CREATE2.
 * @param from The address which is creating this new address
 * @param salt A salt
 * @param initCode The init code of the contract being created
 */
export declare const generateAddress2: (from: Buffer | string, salt: Buffer | string, initCode: Buffer | string) => Buffer;
/**
 * Returns true if the supplied address belongs to a precompiled account (Byzantium).
 */
export declare const isPrecompiled: (address: Buffer | string) => boolean;
/**
 * Adds "0x" to a given `String` if it does not already start with "0x".
 */
export declare const addHexPrefix: (str: string) => string;
/**
 * Validate a ECDSA signature.
 * @param homesteadOrLater Indicates whether this is being used on either the homestead hardfork or a later one
 */
export declare const isValidSignature: (v: number, r: Buffer, s: Buffer, homesteadOrLater?: boolean, chainId?: number | undefined) => boolean;
/**
 * Converts a `Buffer` or `Array` to JSON.
 * @param ba (Buffer|Array)
 * @return (Array|String|null)
 */
export declare const baToJSON: (ba: any) => string | any[] | undefined;
/**
 * Defines properties on a `Object`. It make the assumption that underlying data is binary.
 * @param self the `Object` to define properties on
 * @param fields an array fields to define. Fields can contain:
 * * `name` - the name of the properties
 * * `length` - the number of bytes the field can have
 * * `allowLess` - if the field can be less than the length
 * * `allowEmpty`
 * @param data data to be validated against the definitions
 */
export declare const defineProperties: (self: any, fields: any, data: any) => void;
