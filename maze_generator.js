// mazeGenerator.js

let maze = [];
let rows = 10;
let cols = 10;
let cellSize;
let start = {};
let end = {};

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const regenBtn = document.getElementById('regenBtn');
const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');

function initMaze(r, c){
    rows = r;
    cols = c;
    cellSize = canvas.width / cols;

    maze = Array.from({length: rows}, () =>
        Array.from({length: cols}, () => ({
            top:true, right:true, bottom:true, left:true, visited:false
        }))
    );
}

// Random outer wall cell
function randomOuterCell() {
    const side = Math.floor(Math.random() * 4);
    let r, c;
    switch(side){
        case 0: r=0; c=Math.floor(Math.random()*cols); break;
        case 1: r=Math.floor(Math.random()*rows); c=cols-1; break;
        case 2: r=rows-1; c=Math.floor(Math.random()*cols); break;
        case 3: r=Math.floor(Math.random()*rows); c=0; break;
    }
    return { r, c };
}

// DFS recursive backtracking
function generateMazeDFS(r, c){
    maze[r][c].visited = true;

    let dirs = [[0,-1,'left','right'],[0,1,'right','left'],[-1,0,'top','bottom'],[1,0,'bottom','top']];
    for(let i=dirs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [dirs[i],dirs[j]]=[dirs[j],dirs[i]];}

    for(const [dr, dc, wallCurr, wallNext] of dirs){
        const nr = r+dr, nc = c+dc;
        if(nr>=0 && nr<rows && nc>=0 && nc<cols && !maze[nr][nc].visited){
            maze[r][c][wallCurr]=false;
            maze[nr][nc][wallNext]=false;
            generateMazeDFS(nr, nc);
        }
    }
}

// BFS distance map
function bfsDistance(sr, sc){
    const visited = Array.from({length:rows},()=>Array(cols).fill(false));
    const distMap = Array.from({length:rows},()=>Array(cols).fill(Infinity));

    const queue = [{r:sr, c:sc, dist:0}];
    visited[sr][sc]=true;
    distMap[sr][sc]=0;

    while(queue.length>0){
        const {r,c,dist} = queue.shift();

        const neighbors=[];
        if(!maze[r][c].top && r>0) neighbors.push([r-1,c]);
        if(!maze[r][c].right && c<cols-1) neighbors.push([r,c+1]);
        if(!maze[r][c].bottom && r<rows-1) neighbors.push([r+1,c]);
        if(!maze[r][c].left && c>0) neighbors.push([r,c-1]);

        for(const [nr,nc] of neighbors){
            if(!visited[nr][nc]){
                visited[nr][nc]=true;
                distMap[nr][nc]=dist+1;
                queue.push({r:nr,c:nc,dist:dist+1});
            }
        }
    }
    return distMap;
}

// Pick start & end with difficulty constraints
function pickStartEnd(){
    const totalCells = rows * cols;

    let tries = 0;
    while(tries < 1000){ // retry until we get a good difficulty
        tries++;
        start = randomOuterCell();
        const distMap = bfsDistance(start.r, start.c);

        // get farthest border cell
        let best = {r:start.r, c:start.c, dist:0};
        for(let r=0;r<rows;r++){
            for(let c=0;c<cols;c++){
                if(r===0 || c===0 || r===rows-1 || c===cols-1){
                    if(distMap[r][c] !== Infinity && distMap[r][c] > best.dist){
                        best = {r, c, dist: distMap[r][c]};
                    }
                }
            }
        }

        const pathRatio = best.dist / totalCells; // coverage %

        // medium = 25–50% , hard = 50–80%
        if((pathRatio >= 0.25 && pathRatio <= 0.5) || 
           (pathRatio > 0.5 && pathRatio <= 0.8)){
            end = {r: best.r, c: best.c};
            return;
        }
    }
    // fallback
    end = start;
}

// Draw maze
function drawCell(r, c, color=null){
    const cell = maze[r][c];
    const x = c * cellSize;
    const y = r * cellSize;

    ctx.strokeStyle='black';
    ctx.lineWidth=2;
    if(cell.top) ctx.beginPath(), ctx.moveTo(x,y), ctx.lineTo(x+cellSize,y), ctx.stroke();
    if(cell.right) ctx.beginPath(), ctx.moveTo(x+cellSize,y), ctx.lineTo(x+cellSize,y+cellSize), ctx.stroke();
    if(cell.bottom) ctx.beginPath(), ctx.moveTo(x,y+cellSize), ctx.lineTo(x+cellSize,y+cellSize), ctx.stroke();
    if(cell.left) ctx.beginPath(), ctx.moveTo(x,y), ctx.lineTo(x,y+cellSize), ctx.stroke();

    if(color) ctx.fillStyle=color, ctx.fillRect(x+2,y+2,cellSize-4,cellSize-4);
    if(r===start.r && c===start.c) ctx.fillStyle='green', ctx.fillRect(x+2,y+2,cellSize-4,cellSize-4);
    if(r===end.r && c===end.c) ctx.fillStyle='red', ctx.fillRect(x+2,y+2,cellSize-4,cellSize-4);
}

function drawMaze(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let r=0;r<rows;r++)
        for(let c=0;c<cols;c++)
            drawCell(r,c);
}

// Public function to setup maze
function setupMaze(r, c){
    initMaze(r, c);
    generateMazeDFS(0, 0); // generate all cells
    pickStartEnd();
    drawMaze();
}

regenBtn.addEventListener('click', () => setupMaze(parseInt(rowsInput.value), parseInt(colsInput.value)));

// Generate initial maze
setupMaze(parseInt(rowsInput.value), parseInt(colsInput.value));
