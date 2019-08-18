// Setting upserver for listening
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Models = require('./models.js');

const bidsArr = [];

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/bidder.html');
});

app.get('/bidder', function (req, res) {
    res.sendFile(__dirname + '/bidder.html');
});

app.get('/auction', function (req, res) {
    res.sendFile(__dirname + '/auction.html');
});

io.on('connection', function (socket) {
    socket.on('newBid', function (msg) {
        var newBidJson = JSON.stringify(msg)
        console.log(`received : ${newBidJson}`);
        var newBid = new Models.Bid(msg.name, msg.amount, msg.timestamp);
        bidsArr.push(newBid);
        io.emit('bidLeader', newBid);
    });
});

http.listen(4200, function () {
    console.log(`Starting server at port: ${process.env.PORT || 4200}`);
});

// io.on('connection', function (socket) {
//     connections.push(socket);
//     console.log(`A user has connected. There are currently ${connections.length} connected.`);
//     socket.on('disconnect', function (data) {
//         connections.splice(connections.indexOf(socket), 1)
//         console.log(`A user has disconnected. There are currently ${connections.length} connected.`);
//     })
// });


// io.on('connection', function (socket) {
//     console.log('a user connected');
//     socket.on('disconnect', function () {
//         console.log('user disconnected');
//     });
// });

