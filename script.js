let maze = document.querySelector('.maze');
let mazeComplete = document.querySelector('.maze-complete');
let diffSlider = document.getElementById('diff-slider');

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
    visit(){
        this.visited = true;
        this.real.style['background-color'] = 'lime';
    }
    unvisit(){
        this.visited = false;
        this.real.style['background-color'] = 'white';
    }
    refreshCurrentLocation(){
        this.real.style['background-color'] = (this.visited) ? 'lime' : 'white';
    }
    currentLocation(){
        this.real.style['background-color'] = 'red';
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

let playerPosX = 0;
let playerPosY = 0;
let recur = undefined;
let mazeFinished = false;

function onMazeFinish() {
    for(let x = 0; x < countCol; x++){
        for(let y = 0; y < countRow; y++){
            getCell(x, y).real.style['background-color'] = 'white';
        }
    }
    cells['0,0'].openCell(0);
    cells['0,0'].up = false;
    cells[`${countCol - 1},${countRow - 1}`].openCell(2);
    cells['0,0'].visit();
    cells['0,0'].currentLocation();
    playerPosX = 0;
    playerPosY = 0;
}

let skipAnimation = false;

function skipAnimChange() {
    skipAnimation = !skipAnimation;
}   

function diffChange() {
    if(diffSlider.value == 1){
        countRow = 4;
        diffSlider.style['accentColor'] = 'lime';
    } else if(diffSlider.value == 2){
        countRow = 8;
        diffSlider.style['accentColor'] = 'lime';
    } else if(diffSlider.value == 3){
        countRow = 16;
        diffSlider.style['accentColor'] = 'aqua ';
    } else if(diffSlider.value == 4){
        countRow = 32;
        diffSlider.style['accentColor'] = 'yellow';
    } else {
        countRow = 64;
        diffSlider.style['accentColor'] = 'red';
    }
    countCol = countRow;
    startMaze();
}

function startMaze() {
    mazeComplete.classList.remove('fade-enter');
    mazeFinished = false;
    if(recur != undefined){
        clearInterval(recur);
        recur = undefined;
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
}

function checkShortcuts(e) {
    if(e.key == 'r'){
        startMaze();
    } else if(e.key == 'x'){
        skipAnimChange();
        document.getElementById('skip-anim').checked = !(document.getElementById('skip-anim').checked);
    }
}

function checkPlayerActions(e) {
    let lastX = playerPosX;
    let lastY = playerPosY;
    if(e.key == 'w' || e.keyCode == 38){
        if(cells[`${playerPosX},${playerPosY}`].up){
            playerPosY--;
        }
    } else if(e.key == 'a' || e.keyCode == 37){
        if(cells[`${playerPosX},${playerPosY}`].left){
            playerPosX--;
        }
    } else if(e.key == 's' || e.keyCode == 40){
        if(cells[`${playerPosX},${playerPosY}`].down){
            playerPosY++;
        }
    } else if(e.key == 'd' || e.keyCode == 39){
        if(cells[`${playerPosX},${playerPosY}`].right){
            playerPosX++;
        }
    }
    if(playerPosY == countRow){
        onMazeComplete();

        return;
    }
    
    if(cells[`${playerPosX},${playerPosY}`].visited == true){
        if(playerPosX == lastX && playerPosY == lastY) return;
        cells[`${lastX},${lastY}`].unvisit();
    } else {
        cells[`${playerPosX},${playerPosY}`].visit();
    }
    cells[`${lastX},${lastY}`].refreshCurrentLocation();
    cells[`${playerPosX},${playerPosY}`].currentLocation();
}

document.addEventListener('keydown', (e) => {
    checkShortcuts(e);
    if(mazeFinished == true){
        checkPlayerActions(e);
    }
});

addCells(countCol, countRow);