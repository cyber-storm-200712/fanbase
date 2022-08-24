import { BigNumber } from '@ethersproject/bignumber';
import { BytesLike } from '@ethersproject/bytes';
import { TransactionAuthenticator, TransactionVMStatus, TypeTag, U128, U256, U64, U8, AnnotatedMoveValue, MoveValue, AnnotatedMoveStruct, MoveStruct, BlockMetadataView, BlockWithTransactions, BlockWithTxnHashes, Filter, TransactionEventView, TransactionInfoView, TransactionOutput, TransactionResponse, TransactionWriteAction, RawUserTransactionView, SignedUserTransactionView } from '../types';
export declare type FormatFunc = (value: any) => any;
export declare type FormatFuncs = {
    [key: string]: FormatFunc;
};
export declare type Formats = {
    blockMetadata: FormatFuncs;
    rawTransaction: FormatFuncs;
    signedUserTransaction: FormatFuncs;
    transaction: FormatFuncs;
    transactionInfo: FormatFuncs;
    transactionEvent: FormatFuncs;
    eventFilter: FormatFuncs;
    transactionOutput: FormatFuncs;
    blockHeader: FormatFuncs;
    blockBody: FormatFuncs;
    block: FormatFuncs;
    blockWithTransactions: FormatFuncs;
};
export declare function formatMoveStruct(v: AnnotatedMoveStruct): MoveStruct;
export declare function formatMoveValue(v: AnnotatedMoveValue): MoveValue;
export declare class Formatter {
    readonly formats: Formats;
    constructor();
    getDefaultFormats(): Formats;
    typeTag(value: any): TypeTag;
    moveValue(value: AnnotatedMoveValue): MoveValue;
    moveStruct(value: AnnotatedMoveStruct): MoveStruct;
    transactionAuthenticator(value: any): TransactionAuthenticator;
    rawUserTransaction(value: any): RawUserTransactionView;
    signedUserTransaction(value: any): SignedUserTransactionView;
    blockMetadata(value: any): BlockMetadataView;
    transactionOutput(value: any): TransactionOutput;
    transactionWriteAction(value: any): TransactionWriteAction;
    transactionEvent(value: any): TransactionEventView;
    transactionVmStatus(value: any): TransactionVMStatus;
    number(number: any): number;
    u8(value: any): U8;
    u64(number: any): U64;
    u128(number: any): U128;
    u256(number: any): U256;
    static bigint(number: any): number | bigint;
    bigNumber(value: any): BigNumber;
    boolean(value: any): boolean;
    hex(value: any, strict?: boolean): string;
    data(value: any, strict?: boolean): string;
    address(value: any): string;
    blockTag(blockTag: any): number;
    hash(value: any, strict?: boolean): string;
    private _block;
    blockWithTxnHashes(value: any): BlockWithTxnHashes;
    blockWithTransactions(value: any): BlockWithTransactions;
    transactionResponse(transaction: any): TransactionResponse;
    userTransactionData(value: BytesLike): SignedUserTransactionView;
    transactionInfo(value: any): TransactionInfoView;
    topics(value: any): any;
    filter(value: any): Filter;
    static check(format: {
        [name: string]: FormatFunc;
    }, object: any): any;
    static allowNull(format: FormatFunc, nullValue?: any): FormatFunc;
    static allowFalsish(format: FormatFunc, replaceValue: any): FormatFunc;
    static arrayOf(format: FormatFunc): FormatFunc;
}
