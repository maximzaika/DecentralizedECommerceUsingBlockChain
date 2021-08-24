/** @desc the idea of the BlockChain has been retrieved from https://www.alexandriarepository.org/module/dapp-and-blockchain-programming/
          modified by: Maxim Zaika & Sanjay Sekar Samuel */
const SHA256 = require('../server1/node_modules/crypto-js/sha256');
class Block {
    constructor(index, timeStamp, data, prevHash = "") {
        this.index = index;
        this.timeStamp = timeStamp;
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
    }
    calculateHash() {
        return SHA256(this.index + this.prevHash + this.timeStamp + + JSON.stringify(this.data)).toString();
    }
}

module.exports = Block;
