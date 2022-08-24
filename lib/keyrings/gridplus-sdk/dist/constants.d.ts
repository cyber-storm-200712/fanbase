/// <reference types="node" />
/** @internal Consistent with Lattice's IV */
declare const AES_IV: number[];
/** @internal 128-char strings (null terminated) */
declare const ADDR_STR_LEN = 129;
/**
 * Decrypted response lengths will be fixed for any given message type.
 * These are defined in the Lattice spec.
 * Every decrypted response should have a 65-byte pubkey prefixing it (and a 4-byte request ID)
 * These are NOT counted in `decResLengths`, meaning these values are 69-bytes smaller than the
 * corresponding structs in firmware.
 * @internal
 */
declare const decResLengths: {
    empty: number;
    getAddresses: number;
    sign: number;
    getWallets: number;
    getKvRecords: number;
    getDecoders: number;
    removeDecoders: number;
    test: number;
};
/**
 * Per Lattice spec, all encrypted messages must fit in a buffer of this size.
 * The length comes from the largest request/response data type size
 * We also add the prefix length
 * @internal
 */
declare let ENC_MSG_LEN: number;
/** @internal */
declare const deviceCodes: {
    CONNECT: number;
    ENCRYPTED_REQUEST: number;
};
/** @internal */
declare const encReqCodes: {
    readonly FINALIZE_PAIRING: 0;
    readonly GET_ADDRESSES: 1;
    readonly ADD_PERMISSION: 2;
    readonly SIGN_TRANSACTION: 3;
    readonly GET_WALLETS: 4;
    readonly ADD_PERMISSION_V0: 5;
    readonly ADD_DECODERS: 6;
    readonly GET_KV_RECORDS: 7;
    readonly ADD_KV_RECORDS: 8;
    readonly REMOVE_KV_RECORDS: 9;
    readonly GET_DECODERS: 10;
    readonly REMOVE_DECODERS: 11;
    readonly TEST: 12;
};
/** @internal */
declare const messageConstants: {
    NOT_PAIRED: number;
    PAIRED: number;
};
/** @internal */
declare const addressSizes: {
    BTC: number;
    ETH: number;
};
/** @internal */
declare const responseCodes: {
    RESP_SUCCESS: number;
    RESP_ERR_INVALID_MSG: number;
    RESP_ERR_UNSUPPORTED_VER: number;
    RESP_ERR_DEV_BUSY: number;
    RESP_ERR_USER_TIMEOUT: number;
    RESP_ERR_USER_DECLINED: number;
    RESP_ERR_PAIR_FAIL: number;
    RESP_ERR_PAIR_DISABLED: number;
    RESP_ERR_PERMISSION_DISABLED: number;
    RESP_ERR_INTERNAL: number;
    RESP_ERR_GCE_TIMEOUT: number;
    RESP_ERR_WRONG_WALLET: number;
    RESP_ERR_DEV_LOCKED: number;
    RESP_ERR_DISABLED: number;
    RESP_ERR_ALREADY: number;
    RESP_ERR_INVALID_EPHEM_ID: number;
};
/** @internal */
declare const CURRENCIES: {
    ETH: string;
    BTC: string;
    ETH_MSG: string;
};
/** @internal */
declare const responseMsgs: {
    [x: number]: string | number;
};
/** @internal */
declare const signingSchema: {
    BTC_TRANSFER: number;
    ETH_TRANSFER: number;
    ERC20_TRANSFER: number;
    ETH_MSG: number;
    EXTRA_DATA: number;
    GENERAL_SIGNING: number;
};
/** @internal */
declare const HARDENED_OFFSET = 2147483648;
/** @internal */
declare const BIP_CONSTANTS: {
    PURPOSES: {
        ETH: number;
        BTC_LEGACY: number;
        BTC_WRAPPED_SEGWIT: number;
        BTC_SEGWIT: number;
    };
    COINS: {
        ETH: number;
        BTC: number;
        BTC_TESTNET: number;
    };
};
/** @internal For all HSM-bound requests */
declare const REQUEST_TYPE_BYTE = 2;
/** @internal */
declare const VERSION_BYTE = 1;
/** @internal ChainId value to signify larger chainID is in data buffer */
declare const HANDLE_LARGER_CHAIN_ID = 255;
/** @internal Max number of bytes to contain larger chainID in data buffer */
declare const MAX_CHAIN_ID_BYTES = 8;
/** @internal */
declare const BASE_URL = "https://signing.gridpl.us";
/** @internal */
declare const ETH_ABI_LATTICE_FW_TYPE_MAP: {
    tuple1: number;
    tuple2: number;
    tuple3: number;
    tuple4: number;
    tuple5: number;
    tuple6: number;
    tuple7: number;
    tuple8: number;
    tuple9: number;
    tuple10: number;
    tuple11: number;
    tuple12: number;
    tuple13: number;
    tuple14: number;
    tuple15: number;
    tuple16: number;
    tuple17: number;
    address: number;
    bool: number;
    uint8: number;
    uint16: number;
    uint24: number;
    uint32: number;
    uint40: number;
    uint48: number;
    uint56: number;
    uint64: number;
    uint72: number;
    uint80: number;
    uint88: number;
    uint96: number;
    uint104: number;
    uint112: number;
    uint120: number;
    uint128: number;
    uint136: number;
    uint144: number;
    uint152: number;
    uint160: number;
    uint168: number;
    uint176: number;
    uint184: number;
    uint192: number;
    uint200: number;
    uint208: number;
    uint216: number;
    uint224: number;
    uint232: number;
    uint240: number;
    uint248: number;
    uint256: number;
    int8: number;
    int16: number;
    int24: number;
    int32: number;
    int40: number;
    int48: number;
    int56: number;
    int64: number;
    int72: number;
    int80: number;
    int88: number;
    int96: number;
    int104: number;
    int112: number;
    int120: number;
    int128: number;
    int136: number;
    int144: number;
    int152: number;
    int160: number;
    int168: number;
    int176: number;
    int184: number;
    int192: number;
    int200: number;
    int208: number;
    int216: number;
    int224: number;
    int232: number;
    int240: number;
    int248: number;
    int256: number;
    uint: number;
    bytes1: number;
    bytes2: number;
    bytes3: number;
    bytes4: number;
    bytes5: number;
    bytes6: number;
    bytes7: number;
    bytes8: number;
    bytes9: number;
    bytes10: number;
    bytes11: number;
    bytes12: number;
    bytes13: number;
    bytes14: number;
    bytes15: number;
    bytes16: number;
    bytes17: number;
    bytes18: number;
    bytes19: number;
    bytes20: number;
    bytes21: number;
    bytes22: number;
    bytes23: number;
    bytes24: number;
    bytes25: number;
    bytes26: number;
    bytes27: number;
    bytes28: number;
    bytes29: number;
    bytes30: number;
    bytes31: number;
    bytes32: number;
    bytes: number;
    string: number;
};
/** @internal */
declare const ethMsgProtocol: {
    SIGN_PERSONAL: {
        str: string;
        enumIdx: number;
    };
    TYPED_DATA: {
        str: string;
        enumIdx: number;
        rawDataMaxLen: number;
        typeCodes: {
            address: number;
            bool: number;
            uint8: number;
            uint16: number;
            uint24: number;
            uint32: number;
            uint40: number;
            uint48: number;
            uint56: number;
            uint64: number;
            uint72: number;
            uint80: number;
            uint88: number;
            uint96: number;
            uint104: number;
            uint112: number;
            uint120: number;
            uint128: number;
            uint136: number;
            uint144: number;
            uint152: number;
            uint160: number;
            uint168: number;
            uint176: number;
            uint184: number;
            uint192: number;
            uint200: number;
            uint208: number;
            uint216: number;
            uint224: number;
            uint232: number;
            uint240: number;
            uint248: number;
            uint256: number;
            int8: number;
            int16: number;
            int24: number;
            int32: number;
            int40: number;
            int48: number;
            int56: number;
            int64: number;
            int72: number;
            int80: number;
            int88: number;
            int96: number;
            int104: number;
            int112: number;
            int120: number;
            int128: number;
            int136: number;
            int144: number;
            int152: number;
            int160: number;
            int168: number;
            int176: number;
            int184: number;
            int192: number;
            int200: number;
            int208: number;
            int216: number;
            int224: number;
            int232: number;
            int240: number;
            int248: number;
            int256: number;
            uint: number;
            bytes1: number;
            bytes2: number;
            bytes3: number;
            bytes4: number;
            bytes5: number;
            bytes6: number;
            bytes7: number;
            bytes8: number;
            bytes9: number;
            bytes10: number;
            bytes11: number;
            bytes12: number;
            bytes13: number;
            bytes14: number;
            bytes15: number;
            bytes16: number;
            bytes17: number;
            bytes18: number;
            bytes19: number;
            bytes20: number;
            bytes21: number;
            bytes22: number;
            bytes23: number;
            bytes24: number;
            bytes25: number;
            bytes26: number;
            bytes27: number;
            bytes28: number;
            bytes29: number;
            bytes30: number;
            bytes31: number;
            bytes32: number;
            bytes: number;
            string: number;
        };
    };
};
/**
 * Externally exported constants used for building requests
 * @public
 */
export declare const EXTERNAL: {
    GET_ADDR_FLAGS: {
        SECP256K1_PUB: number;
        ED25519_PUB: number;
    };
    SIGNING: {
        HASHES: {
            NONE: number;
            KECCAK256: number;
            SHA256: number;
        };
        CURVES: {
            SECP256K1: number;
            ED25519: number;
        };
        ENCODINGS: {
            NONE: number;
            SOLANA: number;
            TERRA: number;
            EVM: number;
        };
    };
};
/** @internal */
declare function getFwVersionConst(v: Buffer): FirmwareConstants;
/** @internal */
declare const ASCII_REGEX: RegExp;
/** @internal */
declare const EXTERNAL_NETWORKS_BY_CHAIN_ID_URL = "https://gridplus.github.io/chains/chains.json";
/** @internal - Max number of addresses to fetch */
declare const MAX_ADDR = 10;
/** @internal */
declare const NETWORKS_BY_CHAIN_ID: {
    1: {
        name: string;
        baseUrl: string;
        apiRoute: string;
    };
    137: {
        name: string;
        baseUrl: string;
        apiRoute: string;
    };
    56: {
        name: string;
        baseUrl: string;
        apiRoute: string;
    };
    43114: {
        name: string;
        baseUrl: string;
        apiRoute: string;
    };
};
/** @internal */
export declare const EMPTY_WALLET_UID: Buffer;
/** @internal */
export declare const DEFAULT_ACTIVE_WALLETS: ActiveWallets;
export { ASCII_REGEX, getFwVersionConst, ADDR_STR_LEN, AES_IV, BIP_CONSTANTS, BASE_URL, CURRENCIES, MAX_ADDR, NETWORKS_BY_CHAIN_ID, EXTERNAL_NETWORKS_BY_CHAIN_ID_URL, ENC_MSG_LEN, addressSizes, decResLengths, deviceCodes, encReqCodes, ethMsgProtocol, messageConstants, responseCodes, responseMsgs, signingSchema, REQUEST_TYPE_BYTE, VERSION_BYTE, HARDENED_OFFSET, HANDLE_LARGER_CHAIN_ID, MAX_CHAIN_ID_BYTES, ETH_ABI_LATTICE_FW_TYPE_MAP, };
//# sourceMappingURL=constants.d.ts.map