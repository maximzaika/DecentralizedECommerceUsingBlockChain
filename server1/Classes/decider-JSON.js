/** @desc coded by: Maxim Zaika & Sanjay Sekar Samuel */

const Block = require('../../shared_files/block.js');
counter = 1;
/** @desc 1. retrieves user's balance from the bank, which is located on a server inside
          2. gets the remaining balance by 1. scanning through the chain (adding up or substracting balance)
                                           2. taking user's current input, and substructing from final account based on chain
          3. If remaining balance is more than or equals 0, then user is allowed to transfer the money
          4. System adds user's input to the chain
          5. System verifies the chain (checks whether it is valid or invalid)
    @return 3. If insufficied balance then returns "insufficient balance"
            6. If chain is valid (logically suppose to be) then returns the user's input in JSON.stringify */
class decider {
  constructor(myChain, userData, bank, send) {
    this.myChain = myChain;
    this.userData = userData;
    this.bank = bank;
    this.send = send;
  }

  //verifies whether user is eligibile to send the money or not
  yesORno() {
    var usersBalance = this.getBalance(); //gets user's current balance from the bank
    var remainingBalance = this.myChain.checkBalance(usersBalance,this.userData.from,this.userData); //gets remaining balance by looping chain & user's input
    if (remainingBalance >= 0) {
      this.myChain.addBlock(new Block(counter, Date(), this.userData)); //adds user's input to chain if has sufficient balance
      counter++;
      if (this.myChain.isChainValid() === true) { //chains gets validated
        console.log("[BALANCE] "+this.userData.from+"'s balance after deducting " + this.send + " is "+remainingBalance);
        console.log("[BLOCK CHAIN] update successful");
        return JSON.stringify(this.userData, null, 4); //returns user's input in JSON.strngify format
      }
    } else {
      return "insufficient balance";
    }
  }

  /* gets the balance of the user who inputs the data. So if C1 is from
     then it accesses C1_Balance inside the bank */
  getBalance() {
    for (var key in this.bank) { // loops through the bank to find users balance
      if (this.userData.from+"_Balance" === key) { //if user from = John, then access his account called John_Balance
        var usersBalance = this.bank[key];
      }
    };
    return usersBalance;
  }
}

module.exports = decider;
