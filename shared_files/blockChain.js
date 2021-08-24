/** @desc the idea of the BlockChain has been retrieved from https://www.alexandriarepository.org/module/dapp-and-blockchain-programming/
          modified by: Maxim Zaika & Sanjay Sekar Samuel */
const Block = require('./block.js');

class BlockChain {
  /** @desc by default chain starts with genesisBlock */
  constructor() {
      this.chain = [this.createGenesisBlock()];
  }

  /** @desc the first block in a chain, it is empty but contains hash, and index */
  createGenesisBlock() {
      return new Block(0, "01/01/2018", "GB", "0");
  }

  /** @desc gets the value of the last block and returns in */
  getLatestBlock() {
      return this.chain[this.chain.length - 1];
  }

  /** @desc if this function is called, thew new block gets created and added to the chain */
  addBlock(newBlock) {
      newBlock.prevHash = this.getLatestBlock().hash; // assigns the previous hash of another block and attaches
      newBlock.hash = newBlock.calculateHash(); //gets the value of the new hash, and attaches
      this.chain.push(newBlock); // pushes the whole block to the chain
  }

  /** @desc if this function is called, it verifies whether the chain is valid or not
      @return true or false */
  isChainValid() {
      for (let i = 1; i < this.chain.length; i++) {
          const currentBlock = this.chain[i];
          const prevBlock = this.chain[i - 1];
          if (currentBlock.hash != currentBlock.calculateHash()) {
              return false;
          }
          if (currentBlock.prevHash != prevBlock.hash) {
              return false;
          }
        }
          return true;
  }

  /** @desc verifies whether user has sufficient balance or not. It substracts the balance from
            the account if "from=user's name" inside the chain. It adds up the balance to the
            account if "to=user's name"
      @return remainingBalance */
  checkBalance(usersBalance, userName, userData) {
    for (let i = 1; i < this.chain.length; i++) { //checks the whole chain
      const currentBlock = this.chain[i];
      var dataVal = currentBlock.data; //retrieves the data from the chain
      for (var key in dataVal) {
        if (key === "from" && dataVal[key] === userName) { //when "from" is detected with user's name, pass becomes true
          var pass = true;
        } else if (key === "to" && dataVal[key] === userName) { //when "to" is detected with user's name, pass becomes true
          var pass = false;
        } else if (key === "amount" && pass === true) { //if pass = true, means need to substract the balance from the account
          usersBalance -= parseInt(dataVal[key]);
        } else if (key === "amount" && pass === false) { //if pass = false, means need to add the balance to the account
          usersBalance += parseInt(dataVal[key]);
        };
      };
    };
    for (var key in userData) { //checks user's input only before adding it to the block.
      if (key === "from" && userData[key] === userName) { //when "from" is detected with user's name, pass becomes true (logically supposed to be from only)
          var pass = true;
      } else if (key === "amount" && pass === true) { //if pass = true, means need to substract the balance from the account (logically supposed to be from only)
        usersBalance -= userData[key];
      };
    };
    return usersBalance
  }
}

module.exports = BlockChain;
