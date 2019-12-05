'use strict';

module.exports = () => {
  const config = {
    nodeConfig: {
      httpEndpoint: 'http://10.199.5.219:8888',
      broadcast: false,
      sign: true,
      expireSeconds: 60,
      blocksBehind: 3,
      systemContract: 'eosio.token',
      systemActive: 'transfer',
      systemPermission: 'active',
      systemSymbol: 'EOS',
      privateKeys: [ '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3' ],
    },
  };

  return config;
};
