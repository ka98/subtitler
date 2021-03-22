const {CasparCG} = require('casparcg-connection');
const fs = require('fs');
const http = require("http");
const url = require("url");
const os = require("os");
const open = require("open");

const interfaces = os.networkInterfaces();
const addresses = [];
let address;
let input;
while (address == undefined){
    console.clear();
    console.log("Choose Network Interface: \n");
    let i = 1; 
    for(let interface in interfaces){
        console.log(`[${i}] ${interface} ${interfaces[interface][interfaces[interface].length-1].cidr}`);
        addresses.push(interfaces[interface][interfaces[interface].length-1].address);
        i++; 
    }

    const inputReader = require('wait-console-input')
    input = inputReader.readInteger('');
    address = addresses[parseInt(input) - 1];
}

const port = "3000";

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
        let query = url.parse(req.url, true).query;
        if (query.line1 !== undefined && query.line2 !== undefined) {
            console.log(`Subtitle requestet \n"${query.line1}"\n"${query.line2}"`);
            res.statusCode = 200;
            res.setHeader("Content-type", "text/html");
            let lineSet = {
                "line1": query.line1,
                "line2": query.line2
            }
            con.cgUpdate(1,20,1, lineSet);
            res.write("done!")
            res.end();
        }
        if (query.songNumber!== undefined) {
            console.log("song requested: " + query.songNumber + " Book: " + query.songBook);
            res.statusCode = 200;
            res.setHeader("Content-type", "text/html");           
            res.write(JSON.stringify(createLinesetsFromSong(query.songNumber, query.songBook)));
            res.end();
        } else {
            //console.log("bad Request detected");
            res.statusCode = 400;
            res.end();
        }
    }
}));

server.listen(port, address, () => {
    console.log("Server started at " + address + ":" + port);
});

let rawdataDE = fs.readFileSync('WDH.json');
let rawdataNO = fs.readFileSync('HV.json');
let rawdataFMB = fs.readFileSync('FMB.json');
let songsDE = JSON.parse(rawdataDE);
let songsNO = JSON.parse(rawdataNO);
let songsFMB = JSON.parse(rawdataFMB);
let con = new CasparCG();
// host = 127.0.0.1, port = 5250, autoConnect = true ...

let createLinesetsFromSong = function (songNumber, file){

    let song = null;

    let lineSets = [];
    let emptySet = {
        "line1": "",
        "line2": ""
    }

    if(songNumber < 1 || songNumber > 1000 || isNaN(songNumber)){
        console.log("number out of range or not a number");
        return lineSets.push(emptySet);
    }

    if(file === "HV"){
        song = songsNO[songNumber-1];    
    } else if (file === "FMB"){
        for(let i = 0; i < songsFMB.length; i++){
            if(songsFMB[i].songNumber === '497'){
                console.log("found it!");
            }
            if(songsFMB[i].songNumber === songNumber.toString()){
                song = songsFMB[i];
                break;
            }
        }
    } else {
        song = songsDE[songNumber-1];
    }

    let refrain = null;

    if(song === null){
        return emptySet;
    }

    for(let i = 0; i < song.verses.length; i++){
        let vers = song.verses[i];
        lineSets.push(emptySet);
        let lines = vers.lines.split('\n');
        for(let j = 0; j < lines.length; j+= 2){
            if (lines[j+1] === undefined){
                lineSets.push({
                    "line1": "",
                    "line2": lines[j]
               })
            } else {
                lineSets.push({
                    "line1": lines[j],
                    "line2": lines[j+1]
               })    
            }
        }
        if(isNaN(vers.versNumber)){
            refrain = vers;
        }
        else if(refrain !== null){
            if (song.verses[i+1] === undefined && refrain !== null){
                song.verses.splice(i+1, 0, refrain);
            }
            else if(!(isNaN(song.verses[i+1].versNumber) && refrain !== null)){
                song.verses.splice(i+1, 0, refrain);
            } 
        }
    }
    lineSets.push(emptySet);
    return lineSets;
}

lineSetTest = {
    "line1": "",
    "line2": ""
}

lineSet = {
    "line1": songsDE[364].verses[0].lines.split('\n')[0],
    "line2": songsDE[364].verses[0].lines.split('\n')[1],
}
con.cgAdd(1,20,1,'subtitle-template', true, lineSetTest);

open("http://" + address + ":" + port, {allowNonzeroExitCode: true});

//con.disconnect();

//console.log(createLinesetsFromSong(399));

