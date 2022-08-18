const assert = require('assert')
const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')
const { utils, encoding, providers, starcoin_types } = require('@starcoin/starcoin')
const EthereumTx = require('ethereumjs-tx').Transaction
const { expect } = require('chai')
const log = require('loglevel')
const MutiSignKeyring = require('../')

const TYPE_STR = 'Multi Sign'

// Sample account:
// const testAccount = {
//   key: '0xb8a9c05beeedb25df85f8d641538cbffedf67216048de9c678ee26260eb91952',
//   address: '0x01560cd3bac62cc6d7e6380600d9317363400896',
// }

const testAccount = {
  privateKey: '0x33bedc6650a622a3223c0ca391cb2bfe6078a2b254c08fa492ffe334e8c8ac1f',
  publicKey: '0x94c3732e3c08eee7738d33b4e6f74daa615da14a94607ac00b531d189cb5b0dd',
  address: '0x621500bf2b4aad17a690cb24f9a225c6',
  receiptIdentifier: 'stc1pvg2sp0etf2k30f5sevj0ng39cmhuvhh4vzevdu07ksg38r0mrd0xy9gqhu454tgh56gvkf8e5gjuv6hqjnv'
}


// Implemention of multi sign in https://starcoin.org/zh/developer/cli/multisig_account/
const threshold = 2;

const alice = {
  'address': '0xd597bcfa4d3464b98bea990ce21aca06',
  'public_key': '0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bb',
  'private_key': '0xa9e47d270d2ce33b1475f500f3b9a773eb966f3f8ab5ceb738d52262bbe10cb2'
}

const bob = {
  'address': '0xdcd7ae3232acb938c68ee088305b83f6',
  'public_key': '0xe8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a0',
  'private_key': '0x7ea63107b0e214789fdb0d6c6e6b0d8f8b8c0be7398654ddd63f3617282be97b'
}

const tom = {
  'address': '0x14417edb1fe8c4591d739fee0a91ce42',
  'public_key': '0xc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8',
  'private_key': '0x359059828e89fe42dddd5f9571a0c623b071379fc6287c712649dcc8c77f5eb4'
}

const eva = {
  'address': '0x461EEf2B0c1367fFB63F218Aa3F7A384',
  'public_key': '0xf704bb7bf4122af526978c9059172fee28a4c4d7af50e3ff6f576006ca26e1b6',
  'private_key': '0x38c5e7cf27f3cf9e46391dad77a7d65fbdc04b3b188b8c60b7fc4d4262598a3a'
}

const shardAlice = {
  address: '0xb555d8b06fed69769821e189b5168870',
  privateKey: '0x030201547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bbc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8e8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a0a9e47d270d2ce33b1475f500f3b9a773eb966f3f8ab5ceb738d52262bbe10cb2',
  publicKey: '0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bbc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8e8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a002',
  receiptIdentifier: 'stc1pk42a3vr0a45hdxppuxym295gwq38kuqj',
}

describe('multi-keyring', () => {

  let keyring
  beforeEach(async () => {
    // keyring = new MutiSignKeyring()
    // // console.log(keyring)
    // const publicKeys = [bob.public_key, tom.public_key];
    // const privateKeys = [alice.private_key];

    // const shardAlice = await keyring.addAccounts({ publicKeys, privateKeys, threshold })
    // // console.log({ shardAlice })
  })

  describe('Keyring.type', () => {
    it('is a class property that returns the type string.', () => {
      const type = MutiSignKeyring.type
      assert.equal(type, TYPE_STR)
    })
  })

  describe('#type', () => {
    it('returns the correct value', () => {
      const type = keyring.type
      assert.equal(type, TYPE_STR)
    })
  })

  describe('#serialize empty accounts.', () => {
    it('serializes an empty array', async () => {
      keyring = new MutiSignKeyring()
      const output = await keyring.serialize()
      assert.deepEqual(output, [])
    })
  })

  describe('#addAccount', () => {
    it('add alice', async () => {
      const accounts = await keyring.getAccounts()
      console.log({ accounts })
      console.log(keyring)
      assert.equal(shardAlice.address, accounts[0], 'accounts match expected')
    })
    it('add alice & tom in a same terminal', async () => {
      let shardTom
      try {
        const publicKeys = [alice.public_key, bob.public_key];
        const privateKeys = [tom.private_key];

        shardTom = await keyring.addAccounts({ publicKeys, privateKeys, threshold })
        console.log({ shardTom })
      } catch (error) {
        console.log({ error })
        assert.equal(shardTom, undefined, 'shardTom should not be generated')
      }
      const accounts = await keyring.getAccounts()
      console.log({ accounts })
      assert.equal(shardAlice.address, accounts[0], 'accounts match expected')
    })
  })

  describe('#export privateKey', () => {
    it('exportAccount', async () => {
      const accounts = await keyring.getAccounts()

      const privateKey = await keyring.exportAccount(accounts[0])
      // console.log({ privateKey })
      assert.equal(privateKey, shardAlice.privateKey, 'export privateKey as expected')
    })
  })

  describe('#export publicKey', () => {
    it('getPublicKeyFor', async () => {
      const accounts = await keyring.getAccounts()

      const publicKey = await keyring.getPublicKeyFor(accounts[0])
      // console.log({ publicKey })
      assert.equal(publicKey, shardAlice.publicKey, 'export publicKey as expected')
    })
  })

  describe('#export receiptIdentifier', () => {
    it('getReceiptIdentifier', async () => {
      const accounts = await keyring.getAccounts()

      const receiptIdentifier = await keyring.getReceiptIdentifier(accounts[0])
      // console.log({ receiptIdentifier })
      assert.equal(receiptIdentifier, shardAlice.receiptIdentifier, 'export receiptIdentifier as expected')
    })
  })

  describe('#serialize', () => {
    it('serialize', async () => {
      const keyPairs = await keyring.serialize()
      console.log({ keyPairs })
      assert.equal(keyPairs.length, 1, 'shardAlice should be serialized')
    })
  })

  describe('#deserialize', () => {
    it('deserialize & removeAccount', async () => {
      // const keyPairs = await keyring.serialize()
      // console.log({ keyPairs })
      // console.log('-------')
      const publicKeys = [bob.public_key, tom.public_key];
      const privateKeys = [alice.private_key];

      const keyPairs = [
        { privateKeys, publicKeys, threshold },
      ]
      keyring2 = new MutiSignKeyring(keyPairs)
      console.log({ keyring2 })
      const accounts = await keyring2.getAccounts()
      console.log({ accounts })
      const accounts2 = await keyring2.getAccounts()
      console.log({ accounts2 })
      const publicKey = await keyring2.getPublicKeyFor(accounts[0])
      console.log({ publicKey })
      console.log(keyring2.accounts)
      assert.equal(publicKey, shardAlice.publicKey, 'export publicKey as expected')

      const publicKeys2 = [alice.public_key, tom.public_key];
      const privateKeys2 = [eva.private_key];
      const accounts3 = await keyring2.addAccounts({ privateKeys: privateKeys2, publicKeys: publicKeys2, threshold })
      console.log({ accounts3 })
      const accounts4 = await keyring2.getAccounts()
      console.log({ accounts4 })

      keyring2.removeAccount('0x3db2e0b939963a80d60ae1218a47d75a')
      const accounts5 = await keyring2.getAccounts()
      console.log({ accounts5 })

    })
  })
  describe('#signTransaction', () => {
    it('signTransaction', async () => {
      const publicKeys = [bob.public_key, tom.public_key];
      const privateKeys = [alice.private_key];

      const keyPairs = [
        { privateKeys, publicKeys, threshold },
      ]
      keyring = new MutiSignKeyring(keyPairs)
      console.log({ keyring })
      const accounts = await keyring.getAccounts()
      console.log({ accounts })

      const senderAddress = accounts[0]
      const receiverAddress = bob.address
      const amount = 1000000000
      const functionId = '0x1::TransferScripts::peer_to_peer_v2'
      const typeArgs = ['0x1::STC::STC']
      const args = [
        receiverAddress,
        amount,
      ]
      const nodeUrl = 'http://localhost:9850'
      const chainId = 254
      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeUrl);

      const payloadInHex = encoding.bcsEncode(scriptFunction);
      console.log(payloadInHex)

      const provider = new providers.JsonRpcProvider(nodeUrl);
      const senderSequenceNumber = await provider.getSequenceNumber(
        senderAddress
      );
      const maxGasAmount = 10000000n;
      const gasUnitPrice = 1;
      const nowSeconds = await provider.getNowSeconds();
      // expired after 12 hours since Unix Epoch
      const expiredSecs = 43200
      const expirationTimestampSecs = nowSeconds + expiredSecs

      // hard coded in rust
      // const expirationTimestampSecs = 3005

      const rawUserTransaction = utils.tx.generateRawUserTransaction(
        senderAddress,
        scriptFunction,
        maxGasAmount,
        gasUnitPrice,
        senderSequenceNumber,
        expirationTimestampSecs,
        chainId
      );
      console.log({ rawUserTransaction })

      const rawUserTransactionHex = encoding.bcsEncode(rawUserTransaction)
      console.log({ rawUserTransactionHex })

      const signedTransactionHex = await keyring.signTransaction(senderAddress, rawUserTransaction)
      console.log({ signedTransactionHex })
      const signedTransaction = encoding.bcsDecode(starcoin_types.SignedUserTransaction, signedTransactionHex)
      console.log({ signedTransaction })
      console.log('is multi sign=', signedTransaction.authenticator instanceof starcoin_types.TransactionAuthenticatorVariantMultiEd25519)
      if (signedTransaction.authenticator instanceof starcoin_types.TransactionAuthenticatorVariantMultiEd25519) {
        const existingSignatureShards = new starcoin_types.MultiEd25519SignatureShard(signedTransaction.authenticator.signature, signedTransaction.authenticator.public_key.threshold)
        console.log('is_enough=', existingSignatureShards.is_enough())
      }
    })
  })
})
