/** @desc coded by Maxim Zaika & Sanjay Sekar Samuel*/

/** @desc the following class usees the proportionalRandomNumber.js to get the random server.
          After that it identifies the server's wealth based on 1000 values. Only r=proportionalRandomNumber.js
          and array of the servers gets called from the server
    @return serverFreq. Ex: {0:300, 1:200, 2:100} => therefore server 0 is the wealthiest */
class getRandomWealth {
  constructor (r,listServer) {
    this.r = r;
    this.listServer = listServer;
  }

  getRandomServerPropWealth() {
    var totalWealth = this.listServer.reduce(function (a, b) { return a + b; }, 0); //sums up all the wealths (listServer values)
    var i = -1;
    var rand = this.r.randint(1,totalWealth+1); //gives random integer
    while (rand > 0) {
      i = i + 1;
      rand = rand - this.listServer[i];
    }
    return i
  }

  getFreq() {
    var serverFreq = {};
    var N = 1000;
    for (var i=0;i<N;i++) {
      var selected_server = this.getRandomServerPropWealth(this.listServer); //decides what server goes next. Randomly
      if (selected_server in serverFreq) { //fills up the dictionary
        serverFreq[selected_server]+=1 //wealth+1
      } else {
        serverFreq[selected_server]=1 //leaves it 1
      }
    }
    return serverFreq;
  };
}

module.exports = getRandomWealth;
