/** @desc coded by Maxim Zaika & Sanjay Sekar Samuel */

var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var start_server = http.createServer(app).listen(3001); //start this server with 3002 port, and allows user to connect
var io_user = require('socket.io')(start_server); //socket.io for connected user
var io_server = require("socket.io").listen(8001); //socket.io for connected server
var io_fake_client = require('socket.io-client'); //socket.io to fake a connection from another server
const decider = require('./Classes/decider-JSON.js');
const Random = require('../shared_files/proportionalRandomNumber.js');
const getRandomWealth = require('../shared_files/randomWealth.js');
const Block = require('../shared_files/block.js');
const BlockChain = require('../shared_files/blockChain.js');
const bank = require('../shared_files/bank.js')
const runWorksheet = require('../shared_files/worksheet.js');
var serverWealth = require('../shared_files/serverWealth.js')
var Excel = require('exceljs'); //reference https://www.npmjs.com/package/exceljs
let myChain = new BlockChain();
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet("User's input");
var sizeof = require('object-sizeof'); // reference https://www.npmjs.com/package/object-sizeof
worksheet.getRow(1).values = ['From', 'To', 'Description', 'Amount', 'Size in Byte', 'Size in Kilobyte', 'Data Type', 'Date & Time of Transaction'];
var main = false;

// each server has its own wealth (coins) by default
var server0_wealth=serverWealth.server0_wealth;
var server1_wealth=serverWealth.server1_wealth;
var server2_wealth=serverWealth.server2_wealth;

var r = new Random(); // creates a new object for the Random class
var runRandomWealth = new getRandomWealth(r,[server0_wealth,server1_wealth,server2_wealth]); //creates a new object for the getRandomWealth class

app.get('/', function(req, res){res.sendFile(__dirname + '/index.html'); }); //allows user to launch index.html
app.use(express.static(path.join(__dirname, '/Public'))); //allows user to access Public folder only

/*-----------------------express/html------------------------------*/
io_user.on ('connection', function(socket){ //detects connected user
  console.log('user has connected');
  var serverFreq = runRandomWealth.getFreq();
  var nextServer = Object.keys(serverFreq).reduce(function(a, b){ return serverFreq[a] > serverFreq[b] ? a : b }); //gets the server with highest wealth
  if (nextServer != '1') { // if this server does not have highest wealth, that means some other server does
    var server = io_fake_client.connect('http://127.0.0.1:800'+nextServer); // accesses the server with the highest wealth
    socket.on('send_message', function(data){ //sends information to another server in JSON.stringify format
      console.log("[SEND TO] wealthiest server: "+(parseInt(nextServer)+1));
      main = true;
      server.emit("receive_server",data);
    });
  } else { // this server is the wealthiest
    socket.on('send_message', function(data){ //sends information to another server
      var data = JSON.parse(data);
      console.log("[This is the wealthiest server!]");
      var ok_not_ok = serverRunThis(data); //runs this server (to verify the balance, to push to chain, to tell other servers what to do)
      if (ok_not_ok !== "insufficient balance") {
        var bytes = sizeof(data);
        data.size_b = bytes; data.size_kb = bytes/1000; data.date = Date(); data.data_type = "JSON";
        var execWorksheet = new runWorksheet(data,worksheet,workbook);
        execWorksheet.writeExcel();
        io_user.emit("log_data","Status: Success"); //pushes STATUS to website
      } else {
        io_user.emit("log_data","Status: Insufficient Balance");//pushes STATUS to website
      }
    });
  };
});

/*---------------------------server--------------------------------*/
io_server.on('connection', function (socket) { //detects connected server
  console.log('server has connected');
  socket.on('receive_server', function(data){ // receive the data from another server.
    var bytes = sizeof(data);
    var data = JSON.parse(data); //parses JSON string, because it is string (converts back to dictionary)
    serverRunAnother(data,bytes); //runs this server (to verify the balance, to push to chain, to tell other servers what to do)
  });

  socket.on('sufficient', function(data){ //receive success from another servers
    if (data === "insufficient balance") {
      if (main === true) {
        io_user.emit("log_data","Status: Insufficient Balance"); // since this server has been called by the user, then this server needs to update user's status
        main = false;
      }
    } else {
      var data = JSON.parse(data); //gets the data that needs to be pushed to the chain
      updateChain(data,data.amount); //pushes to the chain
      if (main === true) {
        main = false;
        io_user.emit("log_data","Status: Success"); //notifies the user
      }
    }
  });

  socket.on('boostWealth-1', function(data){ //this server has earned money, therefore tell server-1 to update Server-2's money
    server0_wealth = data;
    console.log("[COIN] Server-1 has earned 3 coins. Total wealth is",server0_wealth);
  });

  socket.on('boostWealth-3', function(data){ //this server has earned money, therefore tell server-3 to update Server-2's money
    server2_wealth = data;
    console.log("[COIN] Server-3 has earned 3 coins. Total wealth is",server2_wealth);
  });
});

/***************************************************************/
/** @desc this function connects Server-1 to Server-2 and 3, then checks whether
          Server-1 has sufficient balance. And if it does, it pushes to BlockChain.
          After that it notifies other servers to update their data
    @return ok_not_ok */
function serverRunAnother(data,bytes) {
  var server1 = io_fake_client.connect('http://127.0.0.1:8000'); //access server1
  var server3 = io_fake_client.connect('http://127.0.0.1:8002'); //access server3
  var runDecider = new decider(myChain, data, bank, data.amount);  // decider decides what to do with user's input.
  ok_not_ok = runDecider.yesORno(); // tell decider to check balance after user's input. If sufficient, update chain on this server
  if (ok_not_ok != "insufficient balance") {  // if success, tell other server to update their data
    server1_wealth += 3; //increase Server-1's coins
    console.log("[COIN] You have earned 3 coins. Total server wealth is", server1_wealth);
    server1.emit("sufficient",ok_not_ok);
    server3.emit("sufficient",ok_not_ok);
    server1.emit("boostWealth-2",server1_wealth);
    server3.emit("boostWealth-2",server1_wealth);
    data.size_b = bytes; data.size_kb = bytes/1000; data.date = Date(); data.data_type = "JSON";
    var execWorksheet = new runWorksheet(data,worksheet,workbook);
    execWorksheet.writeExcel();
  } else { //tells other servers that insufficient balance
    console.log("Status: insufficient balance");
    server1.emit("sufficient",ok_not_ok);
    server3.emit("sufficient",ok_not_ok);
  }
  return ok_not_ok;
}

/** @desc same as previous function but is used for this server to avoid pushing
          unnecessary data to spreadsheet
    @return ok_not_ok */
function serverRunThis(data) {
  var server1 = io_fake_client.connect('http://127.0.0.1:8000'); //access server1
  var server3 = io_fake_client.connect('http://127.0.0.1:8002'); //access server3
  var runDecider = new decider(myChain, data, bank, data.amount); // decider decides what to do with user's input.
  ok_not_ok = runDecider.yesORno(); // tell decider to check balance after user's input. If sufficient, update chain on this server
  if (ok_not_ok != "insufficient balance") { // if success, tell other server to update their data
    server1_wealth += 3; //increase Server-1's coins
    console.log("[COIN] You have earned 3 coins. Total server wealth is", server1_wealth);
    server1.emit("sufficient",ok_not_ok);
    server3.emit("sufficient",ok_not_ok);
    server1.emit("boostWealth-2",server1_wealth);
    server3.emit("boostWealth-2",server1_wealth);
  } else { //tells other servers that insufficient balance
    console.log("Status: insufficient balance");
    server1.emit("sufficient",ok_not_ok);
    server3.emit("sufficient",ok_not_ok);
  }
  return ok_not_ok;
}

/** @desc once other server has verified, and told this server to update chain, this function gets executed */
function updateChain(userData) {
  myChain.addBlock(new Block(1, Date(), userData));
  if (myChain.isChainValid() === true) {
    console.log("[BLOCK CHAIN] update successful: -"+userData.amount+" from " + userData.from);
  }
}
