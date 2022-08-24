like web3 but for minimalists


```js
var provider = { sendAsync: function(params, cb){/* ... */} }
var query = new StcQuery(provider)

query.getBalance(address, cb)
```