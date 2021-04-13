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
const save = document.getElementById("save");

let oldTitle = '';
let currentLine = 0;
let lineSets = null;
let highlight = null

fillAutoComplete();

save.addEventListener('click', (e) => {
    let custom = {
        "title": customLineset.value,
        "lines": []
    }
    for(let i = 1; i < table.rows.length; i++){
        let lineSet =  {
            "line1": "",
            "line2": ""
        };
        lineSet.line1 = table.rows[i].cells[0].getElementsByTagName("SPAN")[0].innerText
        lineSet.line2 = table.rows[i].cells[1].getElementsByTagName("SPAN")[0].innerText
        custom.lines.push(lineSet);
    }

    console.log(custom);

    let xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = () => {
      if (xHttp.readyState === 4 && xHttp.status === 200){
          console.log(xHttp.responseText);
      }
    };
    xHttp.open("GET", `?oldTitle=${oldTitle}&newCustom=${JSON.stringify(custom)}`, true);
    console.log(xHttp);
    xHttp.send(null);

});

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
          fillList(false);
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

editCustom.addEventListener('click', (e) => {
    let xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = () => {
      if (xHttp.readyState === 4 && xHttp.status === 200){
          console.log(xHttp.responseText);
          lineSets = JSON.parse(xHttp.responseText);
          openEditMode();
      }
    };
    oldTitle = customLineset.value;
    xHttp.open("GET", `?songNumber=${customLineset.value}&songBook=${"custom"}`, true);
    console.log(xHttp);
    xHttp.send(null);
});

requestCustom.addEventListener('click', (e) => {
    let xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = () => {
      if (xHttp.readyState === 4 && xHttp.status === 200){
          console.log(xHttp.responseText);
          lineSets = JSON.parse(xHttp.responseText);
          closeEditMode()
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
          fillList(false);
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
    xHttp.open("GET", `?line1=${lineSets[index].line1}&line2=${lineSets[index].line2}`, true);
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

 function fillList(editable){
    let id=0
    lineSets.forEach( (lineSet) => {
        addTableRow(editable, id, lineSet.line1, lineSet.line2,true);
        id++;
    });

    if(!editable) {

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
}

function addTableRow(editable, id, text1, text2, inLoop) {
    let row = table.insertRow(id + 1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);

    let textfield1 = document.createElement("span");
    textfield1.setAttribute("type", "text");
    textfield1.readOnly = !editable;
    textfield1.contentEditable = editable;
    textfield1.innerText = text1;

    let textfield2 = document.createElement("span");
    textfield2.setAttribute("type", "text");
    textfield2.readOnly = !editable;
    textfield2.contentEditable = editable;
    textfield2.innerText = text2;

    cell0.appendChild(textfield1);
    cell1.appendChild(textfield2);

    if(!editable){        

        row.addEventListener('click', (e) => {
            showlineSetAt(e.path[1].rowIndex - 1);
        });

    } else {
        let cell2 = row.insertCell(2);
        let deleteLine = document.createElement("button");
        deleteLine.textContent = 'X';
        deleteLine.addEventListener('click', (e) => {
            let row = e.target.parentNode.parentNode;
            if(table.rows.length === 2) {
                row.cells[0].getElementsByTagName("SPAN")[0].innerText = '';
                row.cells[1].getElementsByTagName("SPAN")[0].innerText = '';
            } else {
                row.parentNode.removeChild(row);   
            }
        });
        cell2.appendChild(deleteLine);

        cell0.onkeydown = (e) => {
            e = e || window.event;
            switch (e.key) {
                case "Backspace":
                    if(cursor_position() === 0){
                        let row = e.target.parentNode.parentNode;
                        row.parentNode.removeChild(row);
                    }
                    break;
                case "Enter":
                    e.preventDefault();
                    break;
            }
        }
        cell1.onkeydown = (e) => {
            e = e || window.event;
            switch (e.key) {
                case "Enter":
                    e.preventDefault();
                    //if(e.target.parentNode.parentNode.rowIndex === table.rows.length - 1) { //if Enter was hit on the last Tablerow
                        addTableRow(true, e.target.parentNode.parentNode.rowIndex, '', '', false);
                    //}
                    break;
            }
        }
    }
    if(editable && !inLoop){
        textfield1.focus();
    }
}

function cursor_position() {
    var sel = document.getSelection();
    sel.modify("extend", "backward", "paragraphboundary");
    var pos = sel.toString().length;
    if(sel.anchorNode != undefined) sel.collapseToEnd();

    return pos;
}

function openEditMode(){
    save.style.display = 'inline';
    clearList();
    fillList(true);
}

function closeEditMode(){
    save.style.display = 'none';
    clearList();
    fillList(false);
}