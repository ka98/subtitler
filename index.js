const {CasparCG} = require('casparcg-connection');
const fs = require('fs');
const url = require("url");
const open = require("open");
const { initServer } = require("./src/webserver");
const WSocket = require("./src/websocket");
const { getVersesFromSong, createLinesetsFromSong } = require("./src/bookUtils");

let address;
let WSConnections;

let currentSong;
let currentVerse;
let currentSongbook;

const os = require("os");
let input;
const interfaces = os.networkInterfaces();
const addresses = [];
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

address = "127.0.0.1";
const port = "3000";

const fnServerCallBack = (req,res) => {
    let query = url.parse(req.url, true).query;
    if (query.line1 !== undefined && query.line2 !== undefined) {
        console.log(`Subtitle requestet \n"${query.line1}"\n"${query.line2}"`);
        currentVerse = query.versNumber;

        res.statusCode = 200;
        res.setHeader("Content-type", "text/html");
        let lineSet = {
            "line1": query.line1,
            "line2": query.line2
        }
        con.cgUpdate(1,20,1, lineSet);

        if (WSConnections && query.versNumber) {
            WSConnections.emit('message',JSON.stringify({
                type: "switchVerse",
                versNumber: query.versNumber
            }));
        }
        res.write("done!")
        res.end();
    }
    if (query.autoComplete !== undefined) {
        console.log("autocomplete requested");
        res.statusCode = 200;
        res.setHeader("Content-type", "text/html");
        let array = new Array();
        for(let i = 0; i < customLines.length; i++){
            array.push(customLines[i].title);
        }
        res.write(JSON.stringify(array));
        res.end();

    }
    if (query.songNumber!== undefined) {
        console.log("song requested: " + query.songNumber + " Book: " + query.songBook);
        currentSong = query.songNumber;
        currentSongbook = query.songBook;

        res.statusCode = 200;
        res.setHeader("Content-type", "text/html");
        if(query.songBook === "custom"){
            for(let i = 0; i < customLines.length; i++) {
                if(query.songNumber === customLines[i].title){
                    res.write(JSON.stringify(customLines[i].lines));
                    break;
                }
            }
        } else if (query.newCustom !== undefined) {
            if(query.oldTitle !== 'undefined'){
                for(let i = 0; i < customLines.length; i++){
                    if(customLines[i].title === query.oldTitle){
                        customLines[i] = JSON.parse(query.newCustom);
                        break;
                    }
                }
            } else {
                let newCustom = JSON.parse(query.newCustom)
                for(let i = 0; i < customLines.length; i++){
                    if(customLines[i].title === newCustom.title){
                        res.setHeader("Content-type", "text/html");
                        res.write("ERROR: Ttile must be unique!");
                        res.end();
                        return;
                    }
                }
                customLines.push(newCustom);
                fs.writeFileSync(resourcesFolder + 'Custom.json', JSON.stringify(customLines, null, 2));

                res.statusCode = 200;
                res.setHeader("Content-type", "text/html");
                res.write("SUCCESS: wrote new Custom to disk!");
                res.end();
            }
        } else {
            res.write(JSON.stringify(createLinesetsFromSong(query.songNumber, query.songBook)));
        }
        if (WSConnections) {
            let aSongInfo = getVersesFromSong(query.songNumber, query.songBook);
            if (aSongInfo.length > 0) {
                WSConnections.emit('message',JSON.stringify({ type: "completeSong" , song: aSongInfo }));
            }
        }
        res.end();
    } else {
        //console.log("bad Request detected");
        res.statusCode = 400;
        res.end();
    }
}

server = initServer(fnServerCallBack);

// get the websocket connection async into a global variable (is needed in fnServerCallBack)
WSConnections = WSocket.init(server);
WSConnections.on('connect', () => {
    // sometimes the screen reconnects
    if (currentSong) {
        let aSongInfo = getVersesFromSong(currentSong, currentSongbook);
        if (aSongInfo.length > 0) {
            WSConnections.emit('message', JSON.stringify({ type: "completeSong" , song: aSongInfo }));
        }
    }
    if (currentVerse) {
        WSConnections.emit('message', JSON.stringify({
            type: "switchVerse",
            versNumber: currentVerse
        }));
    }

});

server.listen(port, address, () => {
    console.log("Server started at " + address + ":" + port);
});

let con = new CasparCG({ host: "192.168.1.180" });
// host = 127.0.0.1, port = 5250, autoConnect = true ...

let resourcesFolder = './resources/';
let rawdataCustom = fs.readFileSync(resourcesFolder +'Custom.json');
let customLines = JSON.parse(rawdataCustom);

lineSetTest = {
    "line1": "",
    "line2": ""
}

con.cgAdd(1,20,1,'subtitle-template', true, lineSetTest);

open("http://" + address + ":" + port, {allowNonzeroExitCode: true});

//con.disconnect();

//console.log(createLinesetsFromSong(399));

