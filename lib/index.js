'use strict';

const http = require('http');
const https = require('https');

class RpcClient {
  constructor({
    host = '127.0.0.1',
    port = 51473,
    user = process.env.RPC_USER || 'user',
    pass = process.env.RPC_PASS || 'pass',
    protocol = 'http',
    disableAgent = false,
    rejectUnauthorized = true
  } = {}) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.pass = pass;
    this.protocol = protocol === 'http' ? http : https;
    this.batchedCalls = null;
    this.disableAgent = disableAgent;
    this.rejectUnauthorized = rejectUnauthorized;
    this.log = RpcClient.config.log || RpcClient.loggers[RpcClient.config.logger || 'normal'];
  }

  static loggers = {
    none: { info: () => {}, warn: () => {}, err: () => {}, debug: () => {} },
    normal: { info: console.log, warn: console.warn, err: console.error, debug: () => {} },
    debug: { info: console.log, warn: console.warn, err: console.error, debug: console.debug }
  };

  static config = {
    logger: 'normal'
  };

  async rpc(request) {
    const requestJson = JSON.stringify(request);
    const auth = Buffer.from(`${this.user}:${this.pass}`).toString('base64');
    const options = {
      host: this.host,
      path: '/',
      method: 'POST',
      port: this.port,
      rejectUnauthorized: this.rejectUnauthorized,
      headers: {
        'Content-Length': Buffer.byteLength(requestJson),
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      agent: this.disableAgent ? false : undefined,
    };

    return new Promise((resolve, reject) => {
      const req = this.protocol.request(options, (res) => {
        let buf = '';
        res.on('data', (data) => { buf += data; });
        res.on('end', () => {
          if ([401, 403].includes(res.statusCode)) {
            reject(new Error(`Connection Rejected: ${res.statusCode} ${res.statusMessage}`));
            return;
          }
          if (res.statusCode === 500 && buf === 'Work queue depth exceeded') {
            reject(new Error(`${buf}`, { code: 429 })); // Too many requests
            return;
          }
          try {
            const parsedBuf = JSON.parse(buf);
            resolve(parsedBuf.error ? new Error(parsedBuf.error) : parsedBuf);
          } catch (e) {
            this.log.err(e.stack);
            this.log.err(buf);
            this.log.err(`HTTP Status code: ${res.statusCode}`);
            reject(new Error(`Error Parsing JSON: ${e.message}`));
          }
        });
      });

      req.on('error', (e) => reject(new Error(`Request Error: ${e.message}`)));
      req.write(requestJson);
      req.end();
    });
  }

  batch(batchCallback, resultCallback) {
    this.batchedCalls = [];
    batchCallback();
    this.rpc(this.batchedCalls)
      .then(result => resultCallback(null, result))
      .catch(error => resultCallback(error, null));
    this.batchedCalls = null;
  }
static callspec = {
  // == Addressindex ==
  getaddressbalance: 'str|str bool', // Note: Using '|' to indicate 'or' for the address input
  getaddressdeltas: 'str|str bool',
  getaddresstxids: 'str|str bool',
  getaddressutxos: 'str|str bool',

  // == Blockchain ==
  getbestblockhash: '',
  getblock: 'str bool',
  getblockchaininfo: '',
  getblockcount: '',
  getblockhash: 'int',
  getblockheader: 'str bool',
  getchaintips: '',
  getdifficulty: '',
  getlotteryblockwinners: 'int?',
  getmempoolinfo: '',
  getrawmempool: 'bool',
  getspentinfo: '{txid:,index:}',
  gettxout: 'str int bool',
  gettxoutsetinfo: '',
  reverseblocktransactions: 'str',
  verifychain: 'int?',


  // == Control ==
  getinfo: '',
  help: 'str?', 
  stop: '',

  // == Divi ==
  ban: 'str',
  clearbanned: '',
  spork: 'str str?',

  // == Vault  ==
  addvault: 'str str',
  fundvault: 'str int',
  reclaimvaultfunds: 'str float str?',
  removevault: 'str',


  // == Masternode == Deprecated
  mnsync: 'str',

  // == Mining ==
  getmininginfo: '',
  prioritisetransaction: 'str int int',

  // == Network ==
  addnode: 'str str',
  getaddednodeinfo: 'bool str',
  getconnectioncount: '',
  getnettotals: '',
  getnetworkinfo: '',
  getpeerinfo: '',
  ping: '',

  // == Rawtransactions ==
  createrawtransaction: '[{txid:id,vout:n},...] {address:amount,...}',
  decoderawtransaction: 'str',
  decodescript: 'str',
  getrawtransaction: 'str bool',
  sendrawtransaction: 'str bool',
  signrawtransaction: 'str [{txid:id,vout:n,scriptPubKey:hex,redeemScript:hex},...] [privatekey1,...] str',

  // == Util ==
  createmultisig: 'int [str,...]',
  validateaddress: 'str',
  verifymessage: 'str str str',

  // == Wallet ==
  addmultisigaddress: 'int [str,...] str',
  addvault: 'str str',
  backupwallet: 'str',
  bip38decrypt: 'str',
  bip38encrypt: 'str str',
  debitvaultbyname: 'str str float str?',
  dumphdinfo: '',
  dumpprivkey: 'str',
  encryptwallet: 'str',
  getaccount: 'str',
  getaccountaddress: 'str',
  getaddressesbyaccount: 'str',
  getbalance: 'str int bool',
  getinvalid: '',
  getnewaddress: 'str?',
  getrawchangeaddress: '',
  getreceivedbyaccount: 'str int',
  getreceivedbyaddress: 'str int',
  getstakingstatus: '',
  gettransaction: 'str bool',
  getunconfirmedbalance: '',
  getwalletinfo: '',
  importaddress: 'str str bool',
  importprivkey: 'str str bool',
  keypoolrefill: 'int',
  listaccounts: 'int bool',
  listlockunspent: '',
  listreceivedbyaccount: 'int bool bool',
  listreceivedbyaddress: 'int bool bool',
  listsinceblock: 'str int bool',
  listtransactions: 'str int int bool',
  listunspent: 'int int [str,...]',
  loadwallet: 'str',
  lockunspent: 'bool [{txid:txid,vout:n},...]',
  sendfrom: 'str str int str str',
  sendmany: 'str {address:amount,...} str',
  sendtoaddress: 'str int str str str',
  setaccount: 'str str',
  signmessage: 'str str str? str?',
};

  static generateRPCMethods() {
    const rpc = this.prototype.rpc; // Reference to the instance's rpc method
    Object.entries(this.callspec).forEach(([methodName, argTypes]) => {
      const argList = argTypes.split(' ').filter(Boolean); // Split and remove empty strings

      this.prototype[methodName] = async function(...args) {
        if (args.length < argList.length) {
          throw new Error(`Method ${methodName} requires ${argList.length} arguments, but got ${args.length}`);
        }
        const params = args.slice(0, argList.length); // Extract required parameters based on callspec
        const callback = args[args.length - 1]; // Last argument is expected to be a callback function

      // Prepare the RPC request object
      const request = {
        jsonrpc: '2.0',
        method: methodName,
        params,
        id: RpcClient.getRandomId(),
      };

      // Execute the RPC call
      try {
        const response = await rpc.call(this, request);
        if (typeof callback === 'function') {
          callback(null, response);
        }
        return response;
      } catch (error) {
        if (typeof callback === 'function') {
          callback(error, null);
        } else {
          throw error;
        }
      };
    });
  }

  static getRandomId() {
    return Math.floor(Math.random() * 100000);
  }
}

RpcClient.generateRPCMethods();

module.exports = RpcClient;