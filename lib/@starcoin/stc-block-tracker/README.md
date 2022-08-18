# stc-block-tracker

This module walks the Starcoin blockchain, keeping track of the latest block.
It uses a web3 provider as a data source and will continuously poll for the next block.


## Install
```
yarn
```

## Build
```
yarn build
```

### Publish npm package
```
npm publish --access public --tag latest --dry-run
npm publish --access public --tag latest 
```