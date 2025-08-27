// mazeSolver.js
const solveBtn = document.getElementById('solveBtn');      

async function solveMaze(){
    const queue=[{r:start.r,c:start.c,path:[]}];
    const visited=Array.from({length:rows},()=>Array(cols).fill(false));
    visited[start.r][start.c]=true;

    while(queue.length>0){
        const {r,c,path}=queue.shift();
        if(!(r===start.r && c===start.c)) drawCell(r,c,'#ADD8E6');
        await new Promise(res=>setTimeout(res,30));

        if(r===end.r && c===end.c){
            for(const [pr,pc] of path)
                if(!(pr===start.r && pc===start.c) && !(pr===end.r && pc===end.c))
                    drawCell(pr,pc,'yellow');
            return;
        }

        const neighbors=[];
        if(!maze[r][c].top && r>0) neighbors.push([r-1,c]);
        if(!maze[r][c].right && c<cols-1) neighbors.push([r,c+1]);
        if(!maze[r][c].bottom && r<rows-1) neighbors.push([r+1,c]);
        if(!maze[r][c].left && c>0) neighbors.push([r,c-1]);

        for(const [nr,nc] of neighbors){
            if(!visited[nr][nc]){
                visited[nr][nc]=true;
                queue.push({r:nr,c:nc,path:[...path,[nr,nc]]});
            }
        }
    }
}

solveBtn.addEventListener('click', solveMaze);
