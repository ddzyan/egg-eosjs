'use strict';

const assert = require('assert');
const mock = require('egg-mock');

describe('test/egg-eosjs.test.js', () => {
  let app;
  let rawTransaction;
  before(() => {
    app = mock.app({
      baseDir: 'apps/egg-eosjs-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('getInfo()', async () => {
    const ctx = app.createAnonymousContext();
    const chainInfo = await ctx.service.chain.getInfo();
    assert(chainInfo);
    const { chainId, latestBlockNumber, blockNumber } = chainInfo;
    assert.ok(chainId, 'chainId 不存在');
    assert.ok(latestBlockNumber, 'latestBlockNumber 不存在');
    assert.ok(blockNumber, 'blockNumber 不存在');
  });


  it('getBlockInfo()', async () => {
    const ctx = app.createAnonymousContext();
    const blockInfo = await ctx.service.chain.getBlockInfo(174422);
    assert(blockInfo);
    const { blockNumber, blockHash, blockTime, confirmed, transactions } = blockInfo;
    assert.ok(blockNumber, 'blockNumber 不存在');
    assert.ok(blockHash, 'blockHash 不存在');
    assert.ok(blockTime, 'blockTime 不存在');
    assert.ok(confirmed >= 0, 'confirmed 不存在');
    assert.ok(transactions.length > 0, 'transactions 不存在');
  });

  it('getAccount()', async () => {
    const ctx = app.createAnonymousContext();
    const accountInfo = await ctx.service.chain.getAccount('eosioclient');
    assert(accountInfo);
    const { accountName, created, cpu_weight, net_weight, ram_quota, net_limit, cpu_limit, ram_usage } = accountInfo;
    assert.ok(accountName, 'accountName 不存在');
    assert.ok(created, 'created 不存在');
    assert.ok(cpu_weight, 'cpu_weight 不存在');
    assert.ok(net_weight, 'net_weight 不存在');
    assert.ok(ram_quota, 'ram_quota 不存在');
    assert.ok(net_limit, 'net_limit 不存在');
    assert.ok(cpu_limit, 'cpu_limit 不存在');
    assert.ok(ram_usage, 'ram_usage 不存在');
  });

  it('getBalance()', async () => {
    const ctx = app.createAnonymousContext();
    const balance = await ctx.service.chain.getBalance('eosioclient');
    assert(balance);
    assert.ok(Array.isArray(balance), '返回数据格式错误');
    assert.ok(typeof (balance[0]) === 'string', '返回数据格式错误');
  });

  it('getTransactionHistory()', async () => {
    const ctx = app.createAnonymousContext();
    const transactionInfo = await ctx.service.chain.getTransactionHistory('b75dbf7d3c7627aa67383a10728064cc82e0f857dc2831e7ee52ccffdb94a8e1', 174422);
    assert(transactionInfo);
    const { id, trx } = transactionInfo;
    assert.equal(id, 'b75dbf7d3c7627aa67383a10728064cc82e0f857dc2831e7ee52ccffdb94a8e1', 'id 错误');
    assert.ok(trx, 'trx 不存在');
  });

  it('buildTransaction()', async () => {
    const ctx = app.createAnonymousContext();
    rawTransaction = await ctx.service.chain.buildTransaction({
      fromAddress: 'eosio',
      toAddress: 'eosioclient',
      memo: '12312',
      quantity: '0.0001 EOS',
    });
    assert(rawTransaction);
  });

  it('boradTranaction()', async () => {
    const ctx = app.createAnonymousContext();
    const transactionInfo = await ctx.service.chain.boradTranaction(rawTransaction);
    assert(transactionInfo);
    const { transaction_id, processed } = transactionInfo;
    assert.ok(transaction_id, 'transaction_id 不存在');
    assert.ok(processed, 'processed 不存在');
    assert.equal(processed.id, transaction_id, 'transaction_id 不相等');
  });
});
