var socket = io();
function reqListener() {
    console.log(this.response);
}
function sendBid(e) {
    e.preventDefault();
    var form = document.getElementById('bidForm');
    console.log(form);
    socket.emit('bid', {})
}

// Creating request variable
var request = new XMLHttpRequest();
// Setting get request to check if it's the first and only auction page
request.addEventListener("load", reqListener);
request.open('GET', 'localhost:4200/auction_status', true);
request.send();

document.getElementById('placeBid').addEventListener('click', sendBid);
