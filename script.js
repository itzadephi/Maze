let maze = document.querySelector('.maze');
let mazeComplete = document.querySelector('.maze-complete');
let timesUp = document.querySelector('.times-up');
let diffSlider = document.getElementById('diff-slider');
let showHint = document.getElementById('show-hint');
let timer = document.querySelector('.timer');

let mazeWidth = maze.getBoundingClientRect().width;
let mazeHeight = maze.getBoundingClientRect().height;

let countRow = 16;
let countCol = 16;

let cellWidth = mazeWidth / countRow - 2;
let cellHeight = mazeHeight / countCol - 2;

let dx = [ 0, 1, 0, -1 ];
let dy = [ -1, 0, 1, 0 ];

class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.vis = false;
        this.visited = false;
        this.hinted = false;
    }
    getReal(){
        this.real = document.getElementById(`${this.x}/${this.y}`);
    }
    openCell(dir){
        switch (dir) {
            case 0:
                this.up = true;
                break;
            case 1:
                this.right = true;
                break;
            case 2:
                this.down = true;
                break;
            case 3:
                this.left = true;
                break;
        }
        this.real.style['border-top'] = (!(this.up)) ? '1px solid black' : '1px solid rgba(1,1,1,0)';
        this.real.style['border-right'] = (!(this.right)) ? '1px solid black' : '1px solid rgba(1,1,1,0)';
        this.real.style['border-bottom'] = (!(this.down)) ? '1px solid black' : '1px solid rgba(1,1,1,0)';
        this.real.style['border-left'] = (!(this.left)) ? '1px solid black' : '1px solid rgba(1,1,1,0)';
    }
    enter(){
        this.real.style['background-color'] = 'rgba(210, 229, 76, 10)';
    }
    leave(){
        this.real.style['background-color'] = 'rgba(250, 169, 95, 10)';
    }
    refreshColor(){
        this.real.style['background-color'] = 'white';
        if(this.hinted) this.real.style['background-color'] = 'gold';
        if(this.visited && showTrail) this.real.style['background-color'] = 'lime';
        if(this.x == playerPosX && this.y == playerPosY) this.real.style['background-color'] = 'red';
    }
}

let cells = {};

function getCell(x, y) {
    return cells[`${x},${y}`];
}

function addCells(w, h) {
    countCol = w;
    countRow = h;
    cellWidth = mazeWidth / countRow - 2;
    cellHeight = mazeHeight / countCol - 2;

    maze.innerHTML = '';

    for(let y = 0; y < h; y++){
        let newRow = document.createElement('tr');
        for(let x = 0; x < w; x++){
            let newCell = document.createElement('td');
            newCell.id = `${x}/${y}`;
            newCell.style = `border:1px solid black`;
            newRow.appendChild(newCell);
            
            if(x == w - 1){
                cells[`${x},${y}`] = new Cell(x, y);
            } else {
                cells[`${x},${y}`] = new Cell(x, y);
            }
        }
        maze.appendChild(newRow);   
    }
    for(let y = 0; y < h; y++){
        for(let x = 0; x < w; x++){
            cells[`${x},${y}`].getReal();
        }
    }
}

let startX = Math.floor(Math.random() * countCol);
let startY = Math.floor(Math.random() * countRow);
let stack = [[startX, startY]];

function dfs() {
    let x = stack[stack.length - 1][0], y = stack[stack.length - 1][1];
    let curCell = getCell(x, y);
    curCell.enter();
    curCell.vis = true;
    let possInd = [];
    for(let i = 0; i < 4; i++){
        if(x + dx[i] < 0 || x + dx[i] >= countCol || y + dy[i] < 0 || y + dy[i] >= countRow){
            continue;
        }
        if(getCell(x + dx[i], y + dy[i]).vis === true){
            continue;
        }
        possInd.push(i);
    }
    if(possInd.length == 0){
        stack.pop();
        return;
    }
    let ind = Math.floor(Math.random() * possInd.length);
    let dir = possInd[ind];
    let nextCell = getCell(x + dx[dir], y + dy[dir]);
    curCell.openCell(dir);
    if(dir == 0 || dir == 2){
        nextCell.openCell(2 - dir);
    } else {
        nextCell.openCell(4 - dir);
    }
    stack.push([nextCell.x, nextCell.y]);
    curCell.leave();
}

let historyX = [];
let historyY = [];
let playerPosX = 0;
let playerPosY = 0;
let recur = undefined;
let hintInterval = undefined;
let mazeFinished = false;
let hints = [];

function cacheHint(x, y, pv) {
    let curCell = getCell(x, y);
    if(x == countCol - 1 && y == countRow - 1){
        return [curCell];
    }
    if(curCell.up && pv != 2){
        let ret = cacheHint(x, y - 1, 0);
        if(ret != undefined){
            ret.push(curCell);
            return ret;
        }
    }
    if(curCell.right && pv != 3){
        let ret = cacheHint(x + 1, y, 1);
        if(ret != undefined){
            ret.push(curCell);
            return ret;
        }
    }
    if(curCell.down && pv != 0){
        let ret = cacheHint(x, y + 1, 2);
        if(ret != undefined){
            ret.push(curCell);
            return ret;
        }
    }
    if(curCell.left && pv != 1){
        let ret = cacheHint(x - 1, y, 3);
        if(ret != undefined){
            ret.push(curCell);
            return ret;
        }
    }
    return undefined;
}

let timerInterval = undefined;

function startTimer(time) {
    if(timerInterval != undefined){
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
    document.getElementById('time-left').innerHTML = `${time} detik`;
    document.getElementById('time-left').style['color'] = 'black';
    timerInterval = setInterval(() => {
        time--;
        document.getElementById('time-left').innerHTML = `${time} detik`;
        if(time <= 10){
            document.getElementById('time-left').style['color'] = 'red';
        }
        if(time == 0){
            clearInterval(timerInterval);
            timerInterval = undefined;
            if(timedMode){
                onTimesUp();
            }
        }
    }, 1000);
}

function onMazeFinish() {
    for(let x = 0; x < countCol; x++){
        for(let y = 0; y < countRow; y++){
            getCell(x, y).real.style['background-color'] = 'white';
        }
    }
    cells['0,0'].openCell(0);
    cells['0,0'].up = false;
    cells[`${countCol - 1},${countRow - 1}`].openCell(2);
    historyX = [0];
    historyY = [0];
    playerPosX = 0;
    playerPosY = 0;
    cells['0,0'].visited = true;
    cells['0,0'].refreshColor();
    let diff = document.getElementById('diff-slider').value;
    if(diff == 1){
        startTimer(10);
    } else if(diff == 2){
        startTimer(30);
    } else if(diff == 3){
        startTimer(60);
    } else if(diff == 4){   
        startTimer(300);
    }
    let temp = cacheHint(0, 0, -1);
    for(let i = 0; i < temp.length; i++){
        hints.push(temp[temp.length - i - 1]);
    }
}

let skipAnimation = false;
let showTrail = true;
let timedMode = false;

function skipAnimChange() {
    skipAnimation = !skipAnimation;
}

function showTrailChange() {
    showTrail = !showTrail;
    for(let i = 0; i < historyX.length; i++){
        cells[`${historyX[i]},${historyY[i]}`].refreshColor();
    }
}

diffSlider.value = 2;

function diffChange() {
    if(diffSlider.value == 1){
        countRow = 8;
        diffSlider.style['accentColor'] = 'lime';
    } else if(diffSlider.value == 2){
        countRow = 16;
        diffSlider.style['accentColor'] = 'aqua';
    } else if(diffSlider.value == 3){
        countRow = 32;
        diffSlider.style['accentColor'] = 'yellow ';
    } else if(diffSlider.value == 4){
        countRow = 64;
        diffSlider.style['accentColor'] = 'red';
    }
    countCol = countRow;
    startMaze();
}

function timedModeChange() {
    timedMode = !timedMode;
    if(timedMode){
        timer.style['display'] = 'block';
        startMaze();
    } else {
        timer.style['display'] = 'none';
    }
}

let timesUpStatus = false;

function startMaze() {
    timesUpStatus = false;
    mazeComplete.classList.remove('fade-enter');
    timesUp.classList.remove('fade-enter');
    mazeFinished = false;
    hints = [];
    if(recur != undefined){
        clearInterval(recur);
        recur = undefined;
    }
    if(hintInterval != undefined){
        clearInterval(hintInterval);
        hintInterval = undefined;
    }
    if(timerInterval != undefined){
        clearInterval(timerInterval);
        timerInterval = undefined;
        document.getElementById('time-left').innerHTML = '';
    }
    startX = Math.floor(Math.random() * countCol);
    startY = Math.floor(Math.random() * countRow);
    stack = [[startX, startY]];

    addCells(countCol, countRow);
    getCell(startX, startY).vis = true;

    if(skipAnimation){
        while(true){
            dfs();
            if(stack.length == 0){
                mazeFinished = true;
                onMazeFinish();
                break;
            }
        }
    } else {
        recur = setInterval(() => {
            dfs();
            if(stack.length == 0){
                clearInterval(recur);
                recur = undefined;
                mazeFinished = true;
                onMazeFinish();

            }
        }, 0.001);
    }
}

function onMazeComplete() {
    mazeComplete.style['visibility'] = 'visible';
    mazeComplete.classList.add('fade-enter');
    if(timerInterval != undefined){
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
}

function onTimesUp() {
    timesUp.style['visibility'] = 'visible';
    timesUp.classList.add('fade-enter');
    timesUpStatus = true;
}

function clearHint() {
    for(let i = 0; i < hints.length; i++){
        hints[i].hinted = false;
        hints[i].refreshColor();
    }
    hintInterval = undefined;
}

function playHint() {
    if(!mazeFinished){
        return;
    }
    let hintCounter = 0;
    if(hintInterval != undefined){
        return;
    }
    hintInterval = setInterval(() => {
        if(hintCounter < hints.length){
            hints[hintCounter].hinted = true;
            hints[hintCounter].real.style['background-color'] = 'gold';
        }
        if(hintCounter >= 20){
            hints[hintCounter - 20].refreshColor();
        }
        hintCounter++;
        if(hintCounter == hints.length + 20){
            clearInterval(hintInterval);
            setTimeout(clearHint, 2000);
        }
    }, 10);
}

function checkShortcuts(e) {
    if(e.key == 'r'){
        startMaze();
    } else if(e.key == 'x'){
        skipAnimChange();
        document.getElementById('skip-anim').checked = !(document.getElementById('skip-anim').checked);
    } else if(e.key == 'p'){
        playHint();
    } else if(e.key == 't'){
        timedModeChange();
        document.getElementById('timed-mode').checked = !(document.getElementById('timed-mode').checked);
    } else if(e.key == 'l'){
        showTrailChange();
        document.getElementById('show-trail').checked = !(document.getElementById('show-trail').checked);
    } else if(e.key == '+'){
        document.getElementById('diff-slider').value++;
        diffChange();
    } else if(e.key == '-'){
        document.getElementById('diff-slider').value--;
        diffChange();
    }
}

function checkPlayerActions(e) {
    if(e.key == 'w' || e.keyCode == 38){
        if(cells[`${playerPosX},${playerPosY}`].up){
            playerPosY--;
        } else {
            return;
        }
    } else if(e.key == 'a' || e.keyCode == 37){
        if(cells[`${playerPosX},${playerPosY}`].left){
            playerPosX--;
        } else {
            return;
        }
    } else if(e.key == 's' || e.keyCode == 40){
        if(cells[`${playerPosX},${playerPosY}`].down){
            playerPosY++;
        } else {
            return;
        }
    } else if(e.key == 'd' || e.keyCode == 39){
        if(cells[`${playerPosX},${playerPosY}`].right){
            playerPosX++;
        } else {
            return;
        }
    } else {
        return;
    }
    if(playerPosY == countRow){
        cells[`${countCol - 1},${countRow - 1}`].refreshColor();
        onMazeComplete();
        return;
    }
    if(historyX.length > 1 && historyX[historyX.length - 2] == playerPosX && historyY[historyY.length - 2] == playerPosY){
        cells[`${historyX[historyX.length - 1]},${historyY[historyY.length - 1]}`].visited = false;
        cells[`${historyX[historyX.length - 1]},${historyY[historyY.length - 1]}`].refreshColor();
        historyX.pop();
        historyY.pop();
    } else {
        cells[`${historyX[historyX.length - 1]},${historyY[historyY.length - 1]}`].refreshColor();
        historyX.push(playerPosX);
        historyY.push(playerPosY);
    }
    cells[`${playerPosX},${playerPosY}`].visited = true;
    cells[`${playerPosX},${playerPosY}`].refreshColor();
}

document.addEventListener('keydown', (e) => {
    checkShortcuts(e);
    if(mazeFinished == true && timesUpStatus != true){
        checkPlayerActions(e);
    }
});

addCells(countCol, countRow);