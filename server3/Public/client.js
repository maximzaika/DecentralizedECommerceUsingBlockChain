/** @desc coded by Maxim Zaika & Sanjay Sekar Samuel */

/** @desc once submit button is clicked, all the data that has been entered is
          pushed to the server  */
var socket = io();
$(function () {
  $('#submit').on('click', function() {
    var text = {
      from: $("#from").val(),
      to: $("#to").val(),
      description: $("#description").val(),
      amount: $("#amount").val()
    };

    var text = JSON.stringify(text, null, 4)
    console.log(text);
    socket.emit('send_message', text);
  });

  // pushes the information to the website
  socket.on('log_data', function(data){
    $('#status').text(data);
    });
});
