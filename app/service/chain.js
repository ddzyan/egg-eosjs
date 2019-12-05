'use strict';
const assert = require('assert');
const { Service } = require('egg');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { Api, JsonRpc, RpcError } = require('eosjs');
const { TextDecoder, TextEncoder } = require('util');
const fetch = require('node-fetch');

class ChainService extends Service {
  constructor(ctx) {
    super(ctx);

    assert(this.config.nodeConfig && this.config.nodeConfig.httpEndpoint);
    const { nodeConfig, nodeConfig: { httpEndpoint, privateKeys, sign } } = this.config;
    let signatureProvider;
    if (sign && privateKeys) {
      signatureProvider = new JsSignatureProvider(privateKeys);
    }
    const rpc = new JsonRpc(httpEndpoint, { fetch });
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    Object.assign(this, { rpc, api, RpcError, nodeConfig });
  }

  /**
	 * @description 获取节点信息
	 * @return {object} chainInfo 节点信息
	 * @example
	 * {
	 *  chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
   *	latestBlockNumber: 173774,
   *	blockNumber: 173773
	 * }
	 */
  async getInfo() {
    try {
      const chainInfo = await this.rpc.get_info();
      return {
        chainId: chainInfo.chain_id,
        latestBlockNumber: chainInfo.head_block_num,
        blockNumber: chainInfo.last_irreversible_block_num,
      };
    } catch (error) {
      if (error instanceof RpcError) {
        throw (JSON.stringify(error.json, null, 2));
      } else {
        throw error;
      }
    }

  }

  async getBlockInfo(blockNumber) {
    try {
      const blockInfo = await this.rpc.get_block(blockNumber);
      const { timestamp, confirmed, transactions, id, block_num } = blockInfo;
      return {
        blockNumber: block_num,
        blockHash: id,
        blockTime: timestamp,
        confirmed,
        transactions,
      };
    } catch (error) {
      if (error instanceof RpcError) {
        throw (JSON.stringify(error.json, null, 2));
      } else {
        throw error;
      }
    }

  }

  async getAccount(accountName) {
    try {
      const accountInfo = await this.rpc.get_account(accountName);
      return {
        accountName: accountInfo.account_name,
        created: accountInfo.created,
        cpu_weight: accountInfo.cpu_weight,
        net_weight: accountInfo.net_weight,
        ram_quota: accountInfo.ram_quota,
        net_limit: accountInfo.net_limit,
        cpu_limit: accountInfo.cpu_limit,
        ram_usage: accountInfo.ram_usage,
      };
    } catch (error) {
      if (error instanceof RpcError) {
        throw (JSON.stringify(error.json, null, 2));
      } else {
        throw error;
      }
    }
  }

  async getBalance(accountName) {
    try {
      const { systemContract, systemSymbol } = this.nodeConfig;
      const balance = await this.rpc.get_currency_balance(systemContract, accountName, systemSymbol);
      return balance;
    } catch (error) {
      if (error instanceof RpcError) {
        throw (JSON.stringify(error.json, null, 2));
      } else {
        throw error;
      }
    }
  }

  async getTransactionHistory(txHash, blockNumber) {
    try {
      const transactionInfo = await this.rpc.history_get_transaction(txHash, blockNumber);
      return transactionInfo;
    } catch (error) {
      if (error instanceof RpcError) {
        throw (JSON.stringify(error.json, null, 2));
      } else {
        throw error;
      }
    }
  }

  async buildTransaction({ fromAddress, toAddress, memo, quantity }) {
    try {
      const { broadcast, sign, expireSeconds, blocksBehind,
        systemContract, systemActive, systemPermission, systemSymbol } = this.nodeConfig;
      assert(quantity.indexOf(systemSymbol) > 0, `quantity must contain ${systemSymbol} symbol`);
      const params = {
        actions: [{
          account: systemContract,
          name: systemActive,
          authorization: [{
            actor: fromAddress,
            permission: systemPermission,
          }],
          data: {
            from: fromAddress,
            to: toAddress,
            quantity,
            memo,
          },
        }],
      };
      const transaction = await this.api.transact(params, {
        broadcast,
        sign,
        blocksBehind,
        expireSeconds,
      });
      assert(transaction.serializedTransaction, '交易构建失败,serializedTransaction 属性不存在');
      assert(transaction.signatures, '交易构建失败,signatures 属性不存在');
      let { serializedTransaction, signatures } = transaction;
      serializedTransaction = this.api.deserializeTransaction(serializedTransaction);
      return {
        serializedTransaction,
        signatures,
      };
    } catch (error) {
      if (error instanceof RpcError) {
        throw (JSON.stringify(error.json, null, 2));
      } else {
        throw error;
      }
    }
  }

  async boradTranaction(transaction) {
    try {
      assert(transaction.serializedTransaction, '参数缺失,serializedTransaction 属性不存在');
      assert(transaction.signatures, '参数缺失,signatures 属性不存在');
      transaction.serializedTransaction = this.api.serializeTransaction(transaction.serializedTransaction);
      const transactionInfo = await this.api.pushSignedTransaction(transaction);
      return transactionInfo;
    } catch (error) {
      if (error instanceof RpcError) {
        throw (JSON.stringify(error.json, null, 2));
      } else {
        throw error;
      }
    }

  }
}

module.exports = ChainService;
