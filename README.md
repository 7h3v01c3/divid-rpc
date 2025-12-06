divid-rpc.js
===============

[![NPM Package](https://img.shields.io/npm/v/divid-rpc.svg?style=flat-square)](https://www.npmjs.org/package/divid-rpc)
[![Build Status](https://travis-ci.org/agustinkassis/divid-rpc.svg?branch=master)](https://travis-ci.org/agustinkassis/divid-rpc)
[![Coverage Status](https://coveralls.io/repos/github/agustinkassis/divid-rpc/badge.svg?branch=master)](https://coveralls.io/github/agustinkassis/divid-rpc?branch=master)

A client library to connect to Divi Core RPC in JavaScript.

## Requirements

- Node.js >= 12.0.0
- npm >= 8.0.0

## Installation

```bash
npm install divid-rpc
```

## Quick Start

```javascript
const RpcClient = require('divid-rpc');

const rpc = new RpcClient({
  protocol: 'http',
  user: 'your-rpc-user',
  pass: 'your-rpc-password',
  host: '127.0.0.1',
  port: 51473,
});

// Simple RPC call
async function getBlockchainInfo() {
  try {
    const info = await rpc.getBlockchainInfo();
    console.log('Blockchain info:', info);
  } catch (err) {
    console.error('Error:', err);
  }
}

getBlockchainInfo();
```

## Examples

### Get Block Information

```javascript
const RpcClient = require('divid-rpc');

const rpc = new RpcClient({
  protocol: 'http',
  user: 'user',
  pass: 'pass',
  host: '127.0.0.1',
  port: 51473,
});

async function getBlock() {
  try {
    const blockHash = await rpc.getBestBlockHash();
    const block = await rpc.getBlock(blockHash.result, true);
    console.log('Block:', block);
  } catch (err) {
    console.error(err);
  }
}

getBlock();
```

### Batch RPC Calls

```javascript
const RpcClient = require('divid-rpc');

const rpc = new RpcClient({
  protocol: 'http',
  user: 'user',
  pass: 'pass',
  host: '127.0.0.1',
  port: 51473,
});

async function batchExample() {
  try {
    const results = await rpc.batch(() => {
      rpc.getBlockCount();
      rpc.getDifficulty();
      rpc.getMempoolInfo();
    });
    console.log('Batch results:', results);
  } catch (err) {
    console.error(err);
  }
}

batchExample();
```

### Using Environment Variables

```javascript
const RpcClient = require('divid-rpc');

// RPC credentials can be set via environment variables
// RPC_USER and RPC_PASS
const rpc = new RpcClient({
  protocol: 'http',
  host: '127.0.0.1',
  port: 51473,
  // user and pass will be read from process.env.RPC_USER and process.env.RPC_PASS
});
```

## Available RPC Methods

The library supports all Divi Core RPC methods including:

- **Blockchain**: `getBlockchainInfo`, `getBlock`, `getBlockCount`, `getBlockHash`, etc.
- **Wallet**: `getBalance`, `sendToAddress`, `getNewAddress`, etc.
- **Raw Transactions**: `getRawTransaction`, `sendRawTransaction`, `createRawTransaction`, etc.
- **Network**: `getNetworkInfo`, `getPeerInfo`, `addNode`, etc.
- **Vault**: `addVault`, `fundVault`, `reclaimVaultFunds`, etc.

All methods support both Promise and callback patterns:

```javascript
// Promise style
const result = await rpc.getBlockCount();

// Callback style
rpc.getBlockCount((err, result) => {
  if (err) console.error(err);
  else console.log(result);
});
```

## Configuration Options

```javascript
const rpc = new RpcClient({
  protocol: 'http',           // 'http' or 'https'
  host: '127.0.0.1',          // RPC server host
  port: 51473,                 // RPC server port
  user: 'rpcuser',              // RPC username (or use RPC_USER env var)
  pass: 'rpcpass',              // RPC password (or use RPC_PASS env var)
  disableAgent: false,         // Disable HTTP agent reuse
  rejectUnauthorized: true,    // Reject unauthorized SSL certificates
});
```

## License

**Code released under [the MIT license](https://github.com/bitpay/bitcore/blob/master/LICENSE).**

Copyright 2013-2014 BitPay, Inc.  
Copyright 2018-2023 99darwin  
Copyright 2024 7h3v01c3

This project is a modification of the original BitPay's bitcore library adapted for Divi RPC functionalities. While it retains the core principles and licensing of its source, it has been significantly altered to cater to the Divi blockchain network.
