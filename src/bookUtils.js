

const fs = require('fs');

// helper functions for songbooks

let resourcesFolder = './resources/';
let rawdataDE = fs.readFileSync(resourcesFolder + 'WDH.json');
let rawdataNO = fs.readFileSync(resourcesFolder +'HV.json');
let rawdataFMB = fs.readFileSync(resourcesFolder +'FMB.json');
let songsDE = JSON.parse(rawdataDE);
let songsNO = JSON.parse(rawdataNO);
let songsFMB = JSON.parse(rawdataFMB);

let getSong = function(songNumber, file) {
    if(songNumber < 1 || songNumber > 1000 || isNaN(songNumber)){
        console.log("number out of range or not a number");
        return lineSets.push(emptySet);
    }

    if(file === "HV"){
        song = songsNO[songNumber-1];    
    } else if (file === "FMB"){
        song = songsFMB.find(songFMB => songFMB.songNumber === songNumber.toString());
    } else {
        song = songsDE[songNumber-1];
    }
    return song;
}

let getVersesFromSong = function(songNumber, file, verse) {
    
    let song = getSong(songNumber, file);

    let verses = [];
    let refrain = null;

    const emptyVerse = { versNumber: -1, lines: [] };
    let currentVerse = { lines: [] };

    if (song === null) {
        return emptyVerse;
    }

    for(let i = 0; i < song.verses.length; i++){
        let vers = song.verses[i];
        currentVerse.lines = vers.lines.split('\n');

        // collect current verse into object and collect into array
        currentVerse.versNumber = vers.versNumber;
        verses.push(Object.assign({}, currentVerse));

        if(isNaN(vers.versNumber)){
            refrain = vers;
        }
        else if(refrain !== null){
            if (song.verses[i+1] === undefined){
                song.verses.splice(i+1, 0, refrain);
            }
            else if(!isNaN(song.verses[i+1].versNumber)){
                song.verses.splice(i+1, 0, refrain);
            } 
        }
    }
    return verses;

}

let createLinesetsFromSong = function (songNumber, file){

    let song = getSong(songNumber, file);

    let lineSets = [];
    let emptySet = {
        "line1": "",
        "line2": ""
    }

    

    let refrain = null;

    if(song === null){
        return emptySet;
    }

    for(let i = 0; i < song.verses.length; i++){
        let vers = song.verses[i];
        lineSets.push(Object.assign({verse: vers.versNumber}, emptySet));
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
module.exports = { 
    getSong: getSong, 
    getVersesFromSong: getVersesFromSong, 
    createLinesetsFromSong: createLinesetsFromSong };