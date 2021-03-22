const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const submit = document.getElementById('submit');
const songNumber = document.getElementById('songNumber');
const requestSong = document.getElementById('requestSong');
const table = document.getElementById("lines");
const wdh = document.getElementById("WDH");
const hv = document.getElementById("HV");
const fmb = document.getElementById("FMB");

let currentLine = 0;
let lineSets = null;
let highlight = null

submit.addEventListener('click', (e) => {
   let xHttp = new XMLHttpRequest();
   xHttp.onreadystatechange = () => {
     if (xHttp.readyState === 4 && xHttp.status === 200){
         console.log(xHttp.responseText);
     }
   };
   xHttp.open("GET", `?line1=${line1.value}&line2=${line2.value}`, true);
   console.log(xHttp);
   xHttp.send(null);
});

requestSong.addEventListener('click', (e) => {
    let xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = () => {
      if (xHttp.readyState === 4 && xHttp.status === 200){
          console.log(xHttp.responseText);
          clearList();
          lineSets = JSON.parse(xHttp.responseText);
          fillList();
      }
    };
    let book = "";
    if(hv.checked){
        book = "HV";
    } else if (fmb.checked){
        book = "FMB";
    } else {
        book = "WDH";
    }
    xHttp.open("GET", `?songNumber=${songNumber.value}&songBook=${book}`, true);
    console.log(xHttp);
    xHttp.send(null);
 });

songNumber.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
        e.preventDefault();
        requestSong.click();
    }
});

 function showlineSetAt(index){
    let xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = () => {
      if (xHttp.readyState === 4 && xHttp.status === 200){
          console.log(xHttp.responseText);
            if(highlight !== null){
                highlight.classList.remove("highlight");
            }
            currentLine = index;
            highlight = table.rows[currentLine+1];
            highlight.classList.add("highlight");
      }
    };
    xHttp.open("GET", `?line1=${lineSets[index].line1}&line2=${lineSets[index].line2}`, true);
    console.log(xHttp);
    xHttp.send(null);
 }

 function clearList(){
     table.innerHTML = "<tr><th>line1</th><th>line2</th></tr>";
 }

 function fillList(){
    let id=0
    lineSets.forEach( (lineSet) => {

        let row = table.insertRow(id + 1);
        let cell0 = row.insertCell(0);
        cell0.innerHTML = lineSet.line1;
        let cell1 = row.insertCell(1);
        cell1.innerHTML = lineSet.line2;
        
        row.addEventListener('click', (e) => {
            showlineSetAt(e.path[1].rowIndex - 1);
        });
        
        id++;
    });

    document.onkeydown = (e) => {
        e = e || window.event;
        switch (e.key) {
            case "ArrowLeft":
            case "ArrowUp":
                if(currentLine > 0){
                    showlineSetAt(currentLine-1);
                }
                break;
            case "ArrowRight":
            case "ArrowDown":
                if(currentLine < lineSets.length - 1){
                    showlineSetAt(currentLine+1);
                }
                break;
        }
     }

     showlineSetAt(0);
}