"use strict";

exports.__esModule = true;
exports.transformCertificate = void 0;

var _paramsValidator = require("./paramsValidator");

var _protobuf = require("../../../types/trezor/protobuf");

var _pathUtils = require("../../../utils/pathUtils");

var _constants = require("../../../constants");

var ipv4AddressToHex = function ipv4AddressToHex(ipv4Address) {
  return Buffer.from(ipv4Address.split('.').map(function (ipPart) {
    return parseInt(ipPart, 10);
  })).toString('hex');
};

var ipv6AddressToHex = function ipv6AddressToHex(ipv6Address) {
  return ipv6Address.split(':').join('');
};

var validatePoolMargin = function validatePoolMargin(margin) {
  (0, _paramsValidator.validateParams)(margin, [{
    name: 'numerator',
    type: 'string',
    required: true
  }, {
    name: 'denominator',
    type: 'string',
    required: true
  }]);
};

var validatePoolMetadata = function validatePoolMetadata(metadata) {
  (0, _paramsValidator.validateParams)(metadata, [{
    name: 'url',
    type: 'string',
    required: true
  }, {
    name: 'hash',
    type: 'string',
    required: true
  }]);
};

var validatePoolRelay = function validatePoolRelay(relay) {
  (0, _paramsValidator.validateParams)(relay, [{
    name: 'type',
    type: 'number',
    required: true
  }]);

  if (relay.type === _protobuf.Enum_CardanoPoolRelayType.SINGLE_HOST_IP) {
    var paramsToValidate = [{
      name: 'port',
      type: 'number',
      required: true
    }];

    if (relay.ipv4Address) {
      paramsToValidate.push({
        name: 'ipv4Address',
        type: 'string'
      });
    }

    if (relay.ipv6Address) {
      paramsToValidate.push({
        name: 'ipv6Address',
        type: 'string'
      });
    }

    (0, _paramsValidator.validateParams)(relay, paramsToValidate);

    if (!relay.ipv4Address && !relay.ipv6Address) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Either ipv4Address or ipv6Address must be supplied');
    }
  } else if (relay.type === _protobuf.Enum_CardanoPoolRelayType.SINGLE_HOST_NAME) {
    (0, _paramsValidator.validateParams)(relay, [{
      name: 'hostName',
      type: 'string',
      required: true
    }, {
      name: 'port',
      type: 'number',
      required: true
    }]);
  } else if (relay.type === _protobuf.Enum_CardanoPoolRelayType.MULTIPLE_HOST_NAME) {
    (0, _paramsValidator.validateParams)(relay, [{
      name: 'hostName',
      type: 'string',
      required: true
    }]);
  }
};

var validatePoolOwners = function validatePoolOwners(owners) {
  owners.forEach(function (owner) {
    if (owner.stakingKeyHash) {
      (0, _paramsValidator.validateParams)(owner, [{
        name: 'stakingKeyHash',
        type: 'string',
        required: !owner.stakingKeyPath
      }]);
    }

    if (owner.stakingKeyPath) {
      (0, _pathUtils.validatePath)(owner.stakingKeyPath, 5);
    }

    if (!owner.stakingKeyHash && !owner.stakingKeyPath) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Either stakingKeyHash or stakingKeyPath must be supplied');
    }
  });
  var ownersAsPathCount = owners.filter(function (owner) {
    return !!owner.stakingKeyPath;
  }).length;

  if (ownersAsPathCount !== 1) {
    throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Exactly one pool owner must be given as a path');
  }
};

var validatePoolParameters = function validatePoolParameters(poolParameters) {
  (0, _paramsValidator.validateParams)(poolParameters, [{
    name: 'poolId',
    type: 'string',
    required: true
  }, {
    name: 'vrfKeyHash',
    type: 'string',
    required: true
  }, {
    name: 'pledge',
    type: 'string',
    required: true
  }, {
    name: 'cost',
    type: 'string',
    required: true
  }, {
    name: 'margin',
    type: 'object',
    required: true
  }, {
    name: 'rewardAccount',
    type: 'string',
    required: true
  }, {
    name: 'owners',
    type: 'array',
    required: true
  }, {
    name: 'relays',
    type: 'array',
    required: true,
    allowEmpty: true
  }, {
    name: 'metadata',
    type: 'object'
  }]);
  validatePoolMargin(poolParameters.margin);
  validatePoolOwners(poolParameters.owners);
  poolParameters.relays.forEach(validatePoolRelay);

  if (poolParameters.metadata) {
    validatePoolMetadata(poolParameters.metadata);
  }
};

var transformPoolParameters = function transformPoolParameters(poolParameters) {
  if (!poolParameters) {
    return {
      poolParameters: undefined,
      poolOwners: [],
      poolRelays: []
    };
  }

  validatePoolParameters(poolParameters);
  return {
    poolParameters: {
      pool_id: poolParameters.poolId,
      vrf_key_hash: poolParameters.vrfKeyHash,
      pledge: poolParameters.pledge,
      cost: poolParameters.cost,
      margin_numerator: poolParameters.margin.numerator,
      margin_denominator: poolParameters.margin.denominator,
      reward_account: poolParameters.rewardAccount,
      owners: [],
      // required for wire compatibility with legacy FW
      relays: [],
      // required for wire compatibility with legacy FW
      metadata: poolParameters.metadata,
      owners_count: poolParameters.owners.length,
      relays_count: poolParameters.relays.length
    },
    poolOwners: poolParameters.owners.map(function (owner) {
      return {
        staking_key_hash: owner.stakingKeyHash,
        staking_key_path: owner.stakingKeyPath ? (0, _pathUtils.validatePath)(owner.stakingKeyPath, 5) : undefined
      };
    }),
    poolRelays: poolParameters.relays.map(function (relay) {
      return {
        type: relay.type,
        ipv4_address: relay.ipv4Address ? ipv4AddressToHex(relay.ipv4Address) : undefined,
        ipv6_address: relay.ipv6Address ? ipv6AddressToHex(relay.ipv6Address) : undefined,
        host_name: relay.hostName,
        port: relay.port
      };
    })
  };
}; // transform incoming certificate object to protobuf messages format


var transformCertificate = function transformCertificate(certificate) {
  var paramsToValidate = [{
    name: 'type',
    type: 'number',
    required: true
  }];

  if (certificate.type !== _protobuf.Enum_CardanoCertificateType.STAKE_POOL_REGISTRATION) {
    paramsToValidate.push({
      name: 'scriptHash',
      type: 'string'
    });
  }

  if (certificate.type === _protobuf.Enum_CardanoCertificateType.STAKE_DELEGATION) {
    paramsToValidate.push({
      name: 'pool',
      type: 'string',
      required: true
    });
  }

  if (certificate.type === _protobuf.Enum_CardanoCertificateType.STAKE_POOL_REGISTRATION) {
    paramsToValidate.push({
      name: 'poolParameters',
      type: 'object',
      required: true
    });
  }

  (0, _paramsValidator.validateParams)(certificate, paramsToValidate);

  var _transformPoolParamet = transformPoolParameters(certificate.poolParameters),
      poolParameters = _transformPoolParamet.poolParameters,
      poolOwners = _transformPoolParamet.poolOwners,
      poolRelays = _transformPoolParamet.poolRelays;

  return {
    certificate: {
      type: certificate.type,
      path: certificate.path ? (0, _pathUtils.validatePath)(certificate.path, 5) : undefined,
      script_hash: certificate.scriptHash,
      pool: certificate.pool,
      pool_parameters: poolParameters
    },
    poolOwners: poolOwners,
    poolRelays: poolRelays
  };
};

exports.transformCertificate = transformCertificate;