/// <reference types="node" />
import { TypedTransaction } from "@ethereumjs/tx";
import { CryptoHDKey, EthSignRequest, CryptoAccount } from "@keystonehq/bc-ur-registry-eth";
import { InteractionProvider } from "./InteractionProvider";
export declare type StoredKeyring = {
    version: number;
    initialized: boolean;
    accounts: string[];
    currentAccount: number;
    page: number;
    perPage: number;
    name: string;
    keyringMode?: string;
    keyringAccount?: string;
    xfp: string;
    xpub: string;
    hdPath: string;
    indexes: Record<string, number>;
    childrenPath: string;
    paths: Record<string, string>;
};
export declare type PagedAccount = {
    address: string;
    balance: any;
    index: number;
};
declare enum KEYRING_MODE {
    hd = "hd",
    pubkey = "pubkey"
}
declare enum KEYRING_ACCOUNT {
    standard = "account.standard",
    ledger_live = "account.ledger_live",
    ledger_legacy = "account.ledger_legacy"
}
export declare class BaseKeyring {
    private version;
    getInteraction: () => InteractionProvider;
    static type: string;
    protected xfp: string;
    protected type: string;
    protected keyringMode: KEYRING_MODE;
    protected initialized: boolean;
    protected xpub: string;
    protected hdPath: string;
    protected childrenPath: string;
    protected accounts: string[];
    protected currentAccount: number;
    protected page: number;
    protected perPage: number;
    protected indexes: Record<string, number>;
    protected hdk: any;
    protected name: string;
    protected paths: Record<string, string>;
    protected keyringAccount: KEYRING_ACCOUNT;
    private unlockedAccount;
    constructor(opts?: StoredKeyring);
    protected requestSignature: (_requestId: string, signRequest: EthSignRequest, requestTitle?: string, requestDescription?: string) => Promise<{
        r: Buffer;
        s: Buffer;
        v: Buffer;
    }>;
    private __readCryptoHDKey;
    private __readCryptoAccount;
    readKeyring(): Promise<void>;
    syncKeyring(data: CryptoHDKey | CryptoAccount): void;
    getName: () => string;
    protected checkKeyring(): void;
    serialize(): Promise<StoredKeyring>;
    deserialize(opts?: StoredKeyring): void;
    setCurrentAccount(index: number): void;
    getCurrentAccount(): number;
    getCurrentAddress(): string;
    setAccountToUnlock: (index: any) => void;
    addAccounts(n?: number): Promise<string[]>;
    getFirstPage(): Promise<PagedAccount[]>;
    getNextPage(): Promise<PagedAccount[]>;
    getPreviousPage(): Promise<PagedAccount[]>;
    private __getNormalPage;
    private __getLedgerLivePage;
    __getPage(increment: number): Promise<PagedAccount[]>;
    getAccounts(): Promise<string[]>;
    removeAccount(address: string): void;
    signTransaction(address: string, tx: TypedTransaction): Promise<TypedTransaction>;
    signMessage(withAccount: string, data: string): Promise<string>;
    signPersonalMessage(withAccount: string, messageHex: string): Promise<string>;
    signTypedData(withAccount: string, typedData: any): Promise<string>;
    __addressFromIndex: (pb: string, i: number) => Promise<string>;
    _pathFromAddress(address: string): Promise<string>;
}
export {};
