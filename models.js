
class Bid {
    constructor(name, amount, timestamp) {
        this.name = name;
        this.amount = amount;
        this.timestamp = timestamp;
    }

    toString() {
        const currentTime = new Date().getTime();
        return `{ name: ${this.name} , amount: ${this.amount}, amount_placed: ${currentTime - this.timestamp} seconds ago`;
    }
}

module.exports = {
    Bid: Bid
}