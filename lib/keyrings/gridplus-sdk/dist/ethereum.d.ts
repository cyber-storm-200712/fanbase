/// <reference types="node" />
declare const _default: {
    buildEthereumMsgRequest: (input: any) => any;
    validateEthereumMsgResponse: (res: any, req: any) => any;
    buildEthereumTxRequest: (data: any) => {
        rawTx: any[];
        type: any;
        payload: Buffer;
        extraDataPayloads: any[];
        schema: number;
        chainId: any;
        useEIP155: boolean;
        signerPath: any;
        err?: undefined;
    } | {
        err: any;
        rawTx?: undefined;
        type?: undefined;
        payload?: undefined;
        extraDataPayloads?: undefined;
        schema?: undefined;
        chainId?: undefined;
        useEIP155?: undefined;
        signerPath?: undefined;
    };
    buildEthRawTx: (tx: any, sig: any, address: any) => {
        rawTx: string;
        sigWithV: any;
    };
    hashTransaction: (serializedTx: any) => string;
    chainIds: {
        mainnet: number;
        roptsten: number;
        rinkeby: number;
        kovan: number;
        goerli: number;
    };
    ensureHexBuffer: (x: any, zeroIsNull?: boolean) => Buffer;
    ethConvertLegacyToGenericReq: (req: any) => Buffer | Buffer[];
};
export default _default;
//# sourceMappingURL=ethereum.d.ts.map