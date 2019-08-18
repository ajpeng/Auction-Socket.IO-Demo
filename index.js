// Setting upserver for listening
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Models = require('./models.js');

const bidsArr = [];
var usersCount = 0;
var timer = 0;
const DIGITS_ONLY = /^\d+$/;
const TWO_DECIMAL_FORMAT = /^\d+\.\d{2,2}$/
var currentBidLeaderInCents = 0;
let statingTimestamp;
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
        if (isBidValid(newBid)) {
            bidsArr.push(newBid);
            if (isBiggerThanCurrenBid(newBid)) {
                currentBidLeaderInCents = convertStrToCents(newBid.amount);
                io.emit('bidLeader', newBid);
            }
        }
    });

    // Initializing the conditions of the item for sale
    socket.on('itemToBid', function (msg) {
        console.log(`Auction started with : ${JSON.stringify(msg)}`);
        var itemToAuction = new Models.Item(msg.name, msg.description, msg.startingBid, msg.auctionDuration);
        statingTimestamp = new Date().getTime();
        timer = itemToAuction.duration;
        if (DIGITS_ONLY.test(timer) && +timer > 0 // making sure the timer > 0
            && (DIGITS_ONLY.test(itemToAuction.startingBid) || TWO_DECIMAL_FORMAT.test(itemToAuction.startingBid))  // checking for valid starting bid
        ) {
            // converts string to bid in cents. 
            currentBidLeaderInCents = convertStrToCents(itemToAuction.startingBid);
            io.emit('initAuction', itemToAuction);
            startTimer(itemToAuction.duration);
        }
    });

    function isBidValid(bid) {
        return (
            (DIGITS_ONLY.test(bid.amount) || TWO_DECIMAL_FORMAT.test(bid.amount)) &&
            bid.name != 'SYSTEM' && bid.timestamp > 0);
    }

    function convertStrToCents(amount) {
        return DIGITS_ONLY.test(amount) ? +amount * 100 : +(amount.replace(/[^0-9]+/g, ''));
    }

    function isBiggerThanCurrenBid(bid) {
        return convertStrToCents(bid.amount) > currentBidLeaderInCents;
    }

    function startTimer() {
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