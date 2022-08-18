# Changelog

All notable changes to this project will be documented in this file, as of version `0.2.0`.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2020-07-11
- add signPersonalMessage
- sync with @starcoin/starcoin^1.4.2

## [1.3.1] - 2020-06-26
- fix bug: _getWalletForAccount will always return the first one because it returns a Promise, instead of a wallet
- add signTransaction and getEncryptionPublicKey, because _getWalletForAccount is async now.

## [1.2.1] - 2020-06-22
- sync with @starcoin/starcoin^1.2.1
- sync with @starcoin/stc-wallet^1.2.1
- sync with @starcoin/stc-simple-keyring^1.2.1