// Setting upserver for listening
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Models = require('./models.js');

const bidsArr = [];
var usersCount = 0;
var timer = 0;

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
    usersCount = usersCount + 1;

    socket.on('disconnect', function () {
        usersCount = usersCount - 1;
    });

    // pushing bids to array and emitting if new bid is higher.
    socket.on('newBid', function (msg) {
        console.log(`received : ${JSON.stringify(msg)}`);
        var newBid = new Models.Bid(msg.name, msg.amount, msg.timestamp);
        bidsArr.push(newBid);
        io.emit('bidLeader', newBid);
    });

    socket.on('itemToBid', function (msg) {
        console.log(`Auction started with : ${JSON.stringify(msg)}`);
        var itemToAuction = new Models.Item(msg.name, msg.description, msg.startingBid, msg.auctionDuration);
        timer = msg.auctionDuration;
        if (/^\d+$/.test(timer) && +timer > 0) {
            io.emit('initAuction', itemToAuction);
            startTimer(msg.auctionDuration);
        }
    });

    function startTimer(duration) {
        setInterval(function () {
            if (timer >= 0) {
                io.emit('timer', timer);
                timer--;
            };
        }, 1000);
    }
});

http.listen(4200, function () {
    console.log(`Starting server at port: ${process.env.PORT || 4200}`);
});