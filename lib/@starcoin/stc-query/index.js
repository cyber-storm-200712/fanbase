const extend = require('xtend')
const createRandomId = require('json-rpc-random-id')()

module.exports = StcQuery


function StcQuery(provider) {
  const self = this
  self.currentProvider = provider
}

//
// base queries
//

// default block
StcQuery.prototype.getNodeInfo = generateFnFor('node.info')
StcQuery.prototype.getChainInfo = generateFnFor('chain.info')
StcQuery.prototype.getResource = generateFnFor('contract.get_resource')
StcQuery.prototype.getBalance = generateFnFor('contract.get_resource')
StcQuery.prototype.getCode = generateFnFor('contract.get_code')
StcQuery.prototype.listResource = generateFnFor('state.list_resource')
// standard
StcQuery.prototype.gasPrice = generateFnFor('txpool.gas_price')
StcQuery.prototype.sendRawTransaction = generateFnFor('txpool.submit_hex_transaction')
StcQuery.prototype.estimateGas = generateFnFor('contract.dry_run')
StcQuery.prototype.dryRunRaw = generateFnFor('contract.dry_run_raw')
StcQuery.prototype.getBlockByNumber = generateFnFor('chain.get_block_by_number')
StcQuery.prototype.getTransactionReceipt = generateFnFor('chain.get_transaction_info')

// network level

StcQuery.prototype.sendAsync = function (opts, cb) {
  const self = this
  self.currentProvider.sendAsync(createPayload(opts), function (err, response) {
    if (cb && typeof cb === 'function') {
      if (!err && response.error) err = new Error('StcQuery - RPC Error - ' + response.error.message)
      if (err) return cb(err)
      cb(null, response.result)
    }
  })
}

// util

function generateFnFor(methodName) {
  return function () {
    const self = this
    var args = [].slice.call(arguments)
    var cb = args.pop()
    self.sendAsync({
      method: methodName,
      params: args,
    }, cb)
  }
}

function generateFnWithDefaultBlockFor(argCount, methodName) {
  return function () {
    const self = this
    var args = [].slice.call(arguments)
    var cb = args.pop()
    // set optional default block param
    if (args.length < argCount) args.push('latest')
    self.sendAsync({
      method: methodName,
      params: args,
    }, cb)
  }
}

function createPayload(data) {
  return extend({
    // defaults
    id: createRandomId(),
    jsonrpc: '2.0',
    params: [],
    // user-specified
  }, data)
}
