/// <reference types="node" />
import { Client } from '..';
/**
 * Build a request to send to the device.
 * @internal
 * @param request_code {uint8} - 8-bit unsigned integer representing the message request code
 * @param id {buffer} - 4 byte identifier (comes from HSM for subsequent encrypted reqs)
 * @param payload {buffer} - serialized payload
 * @returns {buffer}
 */
export declare const buildRequest: (request_code: number, payload: Buffer) => Buffer;
/**
 * Builds an encrypted request
 * @internal
 */
export declare const encryptRequest: ({ payload, requestCode, sharedSecret, }: EncryptRequestParams) => Buffer;
export declare const buildTransaction: ({ data, currency, fwConstants, }: {
    data: any;
    currency?: Currency;
    fwConstants: FirmwareConstants;
}) => {
    request: any;
    isGeneric: boolean;
};
export declare const request: ({ url, payload, timeout, }: RequestParams) => Promise<any>;
/**
 * Takes a function and a set of parameters, and returns a function that will retry the original
 * function with the given parameters a number of times
 *
 * @param client - a {@link Client} instance that is passed to the {@link retryWrapper}
 * @param retries - the number of times to retry the function before giving up
 * @returns a {@link retryWrapper} function for handing retry logic
 */
export declare const buildRetryWrapper: (client: Client, retries: number) => (fn: any, params?: any) => Promise<any>;
/**
 * Retries a function call if the error message or response code is present and the number of
 * retries is greater than 0.
 *
 * @param fn - The function to retry
 * @param params - The parameters to pass to the function
 * @param retries - The number of times to retry the function
 * @param client - The {@link Client} to use for side-effects
 */
export declare const retryWrapper: ({ fn, params, retries, client }: {
    fn: any;
    params: any;
    retries: any;
    client: any;
}) => Promise<any>;
/**
 * All encrypted responses must be decrypted with the previous shared secret. Per specification,
 * decrypted responses will all contain a 65-byte public key as the prefix, which becomes the new
 * `ephemeralPub`.
 * @category Device Response
 * @internal
 */
export declare const decryptResponse: (encryptedResponse: Buffer, length: number, sharedSecret: Buffer) => DecryptedResponse;
/**
 * Get the ephemeral id, which is the first 4 bytes of the shared secret generated from the local
 * private key and the ephemeral public key from the device.
 * @internal
 * @returns Buffer
 */
export declare const getEphemeralId: (sharedSecret: Buffer) => number;
//# sourceMappingURL=functions.d.ts.map