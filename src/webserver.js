
const http = require("http");
const fs = require('fs');
function initServer(fnCallBack) {

    // generall http server creation - callback is called in case, the url does not match files here
    const server = http.createServer(((req, res) => {

        if (req.url.includes('style.css')) {
            fs.readFile('./public/style.css', (err, css) => {
                console.log("css requested");
                if (err) {
                    throw err;
                }
                res.statusCode = 200;
                res.setHeader("Content-type", "text/css");
                res.write(css);
                res.end();
            });
        } else if (req.url.includes('main.js')) {
            fs.readFile('./public/main.js', (err, js) => {
                console.log("JS requested");
                if (err) {
                    throw err;
                }
                res.statusCode = 200;
                res.setHeader("Content-type", "application/javascript");
                res.write(js);
                res.end();
            });
        } else if (req.headers.accept.includes("text/html") && req.url.includes("verseView.html")) {
            fs.readFile('./public/verseView.html', (err, html) => {
                console.log("html requested");
                if (err) {
                    throw err;
                }
                res.statusCode = 200;
                res.setHeader("Content-type", "text/html");
                res.write(html);
                res.end();
            });
        } else if (req.headers.accept.includes("text/html")) {
            fs.readFile('./public/index.html', (err, html) => {
                console.log("html requested");
                if (err) {
                    throw err;
                }
                res.statusCode = 200;
                res.setHeader("Content-type", "text/html");
                res.write(html);
                res.end();
            });
        } else {
            fnCallBack(req,res);
        }
    }));
    return server;
}

module.exports = { initServer: initServer };