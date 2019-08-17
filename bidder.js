class Bidder {
    constructor(name) {
        this.name = name;
    }

    addBid(amount) {
        this.bid = amount;
        console.log(`${this.name} is setting a bid for ${this.bid}`);
    }
}

module.exports = Bidder;