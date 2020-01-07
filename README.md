## 简介
egg eosjs 插件，功能包括：
1. 获取节点信息
2. 获取指定高度的区块信息
3. 获取账号详情
4. 获取账号余额
5. 查询指定高度的指定交易信息
6. 构建交易(可以直接签名和广播)
7. 广播交易

## 使用
### 下载
```shell
yarn add egg-eosjs-ddz
```


### 插件启用
```js
// plugin.js
exports.eggEosjs = {
  enable: true,
  package: "egg-eosjs"
};
```

### 插件配置
需要在config.*.js 文件中配置以下参数：
```js
  nodeConfig: {
      httpEndpoint: 'http://localhost:8888', // 节点RPC地址
      broadcast: false, //是否在构建交易的时候直接广播
      sign: false, // 是否在构建交易的时候直接签名
      expireSeconds: 60,// 节点用来判断交易是否超时,单位秒
      blocksBehind: 3, // 节点用来判断交易是否超时
      systemContract: 'eosio.token', //系统默认合约
      systemActive: 'transfer',// 默认合约的默认交易操作方法
      systemPermission: 'active',// 账号默认权限
      systemSymbol: 'EOS',// 交易的代币符号
      privateKeys: [ '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3' ],// 账户私钥，如歌不需要签名则无需配置
    },
```

服务注册成功，会将所有方法将挂载在 service.chain 上，具体操作请参考 test 单元测试代码

## 更新记录
### [2019-12-20]
1. 更新使用说明

### [2019-1-07]
1. 构建交易添加参数 customExpireSeconds ，可以自定义过期时间，如果没有传入则采用this.config中配置
