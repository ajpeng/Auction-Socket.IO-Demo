const http = require('http');
const path = require('path');
const fs = require('fs');

//  Create server obj
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    console.log(filePath)
    if (req.url === '/bidder') {
        // goToPage(req, res);
    } else if (req.url === '/auction') {
        // goToPage(req, res);
    }
});

function goToPage(req, res) {
    fs.readFile(
        path.join(__dirname, 'public', req.url),
        (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('wow');
            res.end();
        }
    );
}

server.listen(4200, () => {
    console.log(`Auction page is at http://localhost:4200/auction `);
    console.log(`Bidder page is at http://localhost:4200/bidder `);
});

