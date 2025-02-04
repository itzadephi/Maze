let maze = document.querySelector('.maze');
let mazeWidth = maze.getBoundingClientRect().width;
let mazeHeight = maze.getBoundingClientRect().height;

let countRow = 32;
let countCol = 32;

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
        this.real.style['border-top'] = (!(this.up)) ? '1px solid black' : '1px solid white';
        this.real.style['border-right'] = (!(this.right)) ? '1px solid black' : '1px solid white';
        this.real.style['border-bottom'] = (!(this.down)) ? '1px solid black' : '1px solid white';
        this.real.style['border-left'] = (!(this.left)) ? '1px solid black' : '1px solid white';
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

    maze.children = [];

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
    // console.log(`curCell: ${x},${y} | nextCell: ${x + dx[dir]},${y + dy[dir]} | dir: ${dir}`);
    curCell.openCell(dir);
    if(dir == 0 || dir == 2){
        nextCell.openCell(2 - dir);
    } else {
        nextCell.openCell(4 - dir);
    }
    stack.push([nextCell.x, nextCell.y]);
}

addCells(countCol, countRow);
getCell(startX, startY).vis = true;
//dfs(0,0);

let recur = setInterval(() => {
    dfs();
    if(stack.length == 0){
        clearInterval(recur);
    }
}, 0.001);
