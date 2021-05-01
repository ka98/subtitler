const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const submit = document.getElementById('submit');
const songNumber = document.getElementById('songNumber');
const requestSong = document.getElementById('requestSong');
const table = document.getElementById("lines");
const wdh = document.getElementById("WDH");
const hv = document.getElementById("HV");
const fmb = document.getElementById("FMB");
const autocomplete = document.getElementById("autoComplete");
const requestCustom = document.getElementById("requestCustom");
const editCustom = document.getElementById("editCustom");
const createNewCustom = document.getElementById("createNewCustom");
const customLineset = document.getElementById("customLineset");

let currentLine = 0;
let lineSets = null;
let highlight = null

fillAutoComplete();

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

requestCustom.addEventListener('click', (e) => {
    let xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = () => {
      if (xHttp.readyState === 4 && xHttp.status === 200){
          console.log(xHttp.responseText);
          clearList();
          lineSets = JSON.parse(xHttp.responseText);
          fillList();
      }
    };
    xHttp.open("GET", `?songNumber=${customLineset.value}&songBook=${"custom"}`, true);
    console.log(xHttp);
    xHttp.send(null);
});

customLineset.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
        e.preventDefault();
        requestCustom.click();
        document.activeElement.blur();
    }
});

songNumber.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
        e.preventDefault();
        requestSong.click();
    }
});

createNewCustom.addEventListener('click', (e) => {
    let xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = () => {
      if (xHttp.readyState === 4 && xHttp.status === 200){
          console.log(xHttp.responseText);
          clearList();
          lineSets = JSON.parse(xHttp.responseText);
          fillList();
      }
    };
    xHttp.open("GET", `?songNumber=${customLineset.value}&songBook=${"custom"}`, true);
    console.log(xHttp);
    xHttp.send(null);
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
    xHttp.open("GET", `?line1=${lineSets[index].line1}&line2=${lineSets[index].line2}${ 
        lineSets[index].verse ? '&versNumber=' + lineSets[index].verse : '' }`, true);
    console.log(xHttp);
    xHttp.send(null);
 }

 function clearList(){
     table.innerHTML = "<tr><th>line1</th><th>line2</th></tr>";
 }

 function fillAutoComplete(){
    let xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = () => {
      if (xHttp.readyState === 4 && xHttp.status === 200){
          console.log(xHttp.responseText);
          let customTitles = JSON.parse(xHttp.responseText);
          let options;
          for (var i = 0; i < customTitles.length; i++) {
            options += '<option value="' + customTitles[i] + '" />';
          }
          autocomplete.innerHTML = options;
      }
    };
    xHttp.open("GET", `?autoComplete=${true}`, true);
    console.log(xHttp);
    xHttp.send(null);
 }

 function fillList(){
    let id=0
    lineSets.forEach( (lineSet) => {

        let row = table.insertRow(id + 1);
        let cell0 = row.insertCell(0);

        let textfield1 = document.createElement("span");
        textfield1.setAttribute("type", "text");
        textfield1.readOnly = true;
        textfield1.contentEditable = false;
        textfield1.innerText = lineSet.line1;

        let textfield2 = document.createElement("span");
        textfield2.setAttribute("type", "text");
        textfield2.readOnly = true;
        textfield2.contentEditable = false;
        textfield2.innerText = lineSet.line2;

        cell0.appendChild(textfield1);
        let cell1 = row.insertCell(1);
        cell1.appendChild(textfield2);
        
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