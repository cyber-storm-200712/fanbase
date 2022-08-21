/// <reference types="node" />
declare function getAddressFormat(path: any): 0 | 208 | 240 | 5 | 196 | 111;
declare const _default: {
    buildBitcoinTxRequest: (data: any) => {
        payload: Buffer;
        schema: number;
        origData: any;
        changeData: {
            value: number;
        };
        err?: undefined;
    } | {
        err: any;
        payload?: undefined;
        schema?: undefined;
        origData?: undefined;
        changeData?: undefined;
    };
    serializeTx: (data: any) => string;
    getBitcoinAddress: (pubkeyhash: any, version: any) => any;
    getAddressFormat: typeof getAddressFormat;
};
export default _default;
//# sourceMappingURL=bitcoin.d.ts.map