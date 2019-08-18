// Setting upserver for listening
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Models = require('./models.js');

const bidsArr = [];
var usersCount = 0;
var duration = 0;
var timer = 0;
const DIGITS_ONLY = /^\d+$/;
const TWO_DECIMAL_FORMAT = /^\d+\.\d{2,2}$/
var currentWinningBidInCents = 0;
var auctionCount = 0;
var bidLeader;
var winningBids = [];
let startingTimestamp;
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
                currentWinningBidInCents = convertStrToCents(newBid.amount);
                bidLeader = newBid;
                io.emit('bidLeader', newBid);
            }
        } else {
            console.log('Bid isnt valid');
        }
    });

    // Initializing the conditions of the item for sale
    socket.on('itemToBid', function (msg) {
        console.log(`Auction started with : ${JSON.stringify(msg)}`);
        var itemToAuction = new Models.Item(msg.name, msg.description, msg.startingBid, msg.auctionDuration);
        startingTimestamp = new Date().getTime();
        console.log(startingTimestamp);
        timer = +itemToAuction.duration;
        if (DIGITS_ONLY.test(timer) && +timer > 0 // making sure the timer > 0
            && (DIGITS_ONLY.test(itemToAuction.startingBid) || TWO_DECIMAL_FORMAT.test(itemToAuction.startingBid))  // checking for valid starting bid
        ) {
            // converts string to bid in cents. 
            currentWinningBidInCents = convertStrToCents(itemToAuction.startingBid);
            io.emit('initAuction', itemToAuction);
            duration = itemToAuction.duration;
            startTimer(itemToAuction.duration);
            setTimeout(() => {
                winningBids[auctionCount] = bidLeader;
                console.log(JSON.stringify(winningBids));
                io.emit('winningBid', winningBids);
            }, itemToAuction.duration * 1000)

        }
    });

    // Making sure the bid is sent while the acution is active
    function isBidValid(bid) {
        return (
            (DIGITS_ONLY.test(bid.amount) || TWO_DECIMAL_FORMAT.test(bid.amount)) &&
            bid.timestamp > 0 && bid.timestamp > startingTimestamp && bid.timestamp < (startingTimestamp + (duration * 1000)) &&
            bid.name != 'SYSTEM'
        );
    }

    function convertStrToCents(amount) {
        return DIGITS_ONLY.test(amount) ? +amount * 100 : +(amount.replace(/[^0-9]+/g, ''));
    }

    function isBiggerThanCurrenBid(bid) {
        return convertStrToCents(bid.amount) > currentWinningBidInCents;
    }

    function startTimer() {
        io.emit('timer', timer);
    }
});

http.listen(4200, function () {
    console.log(`Starting server at port: ${process.env.PORT || 4200}`);
});