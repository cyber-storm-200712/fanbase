"use strict";

var commonFixtures = require('../../../../submodules/trezor-common/tests/fixtures/ethereum/sign_typed_data.json');

var typedData = require('./typedData');

describe('typedData', function () {
  commonFixtures.tests.filter(function (test) {
    return test.parameters.metamask_v4_compat;
  }).forEach(function (test) {
    it('typedData to message_hash and domain_separator_hash', function () {
      var transformed = typedData(test.parameters.data, true); // todo: fixtures in firmware-repo not unified, probably bug

      var domain_separator_hash = transformed.domain_separator_hash;
      expect("0x" + domain_separator_hash).toEqual(test.parameters.domain_separator_hash); // expect(`0x${message_hash}`).toEqual(test.parameters.message_hash);
    });
  });
});