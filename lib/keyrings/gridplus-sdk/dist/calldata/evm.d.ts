/// <reference types="node" />
/**
 * Look through an ABI definition to see if there is a function that matches the signature provided.
 * @param sig    a 0x-prefixed hex string containing 4 bytes of info
 * @param abi    a Solidity JSON ABI structure ([external link](https://docs.ethers.io/v5/api/utils/abi/formats/#abi-formats--solidity))
 * @returns      Buffer containing RLP-serialized array of calldata info to pass to signing request
 * @public
 */
export declare const parseSolidityJSONABI: (sig: string, abi: any[]) => Buffer;
/**
 * Convert a canonical name into an ABI definition that can be included with calldata to a general
 * signing request. Parameter names will be encoded in order that they are discovered (e.g. "1",
 * "2", "2.1", "3")
 * @param sig    a 0x-prefixed hex string containing 4 bytes of info
 * @param name   canonical name of the function
 * @returns      Buffer containing RLP-serialized array of calldata info to pass to signing request
 * @public
 */
export declare const parseCanonicalName: (sig: string, name: string) => Buffer;
//# sourceMappingURL=evm.d.ts.map