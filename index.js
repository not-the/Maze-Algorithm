const elOutput = document.getElementById("output");
const elOptions = {
    color: document.getElementById("color_option"),
    size: document.getElementById("size_option")
}
const elPointer = document.getElementById("pointer");

const wall = '█';
const clear = ' ';
const start = '<span class="start">█</span>';
const end = '<span class="end">█</span>';
const visited = '<span class="ai">█</span>';

const dirs = {
    0: [-2,  0], // N
    1: [ 0,  2], // E
    2: [ 2,  0], // S
    3: [ 0, -2], // W
}
const dirsSingle = {
    0: [-1,  0], // N
    1: [ 0,  1], // E
    2: [ 1,  0], // S
    3: [ 0, -1], // W
}
const startPoint = [5, 0];
const endpoint = [11, 31];

var board = [];
var carver = [0, 0];
var solver = [0, 0];
var facing = 1;

carver[0] = startPoint[0];
carver[1] = startPoint[1];
solver[0] = startPoint[0];
solver[1] = startPoint[1];

// Change random squares
async function generate(h=17, w=32) {

    // Down
    for(let hi = 0; hi < h; hi++) {
        board[hi] = [];

        // Across
        for(let wi = 0; wi < w; wi++) {
            // console.log(hi, wi);
            board[hi][wi] = wall;
        }
    }

    // Create start and end
    board[startPoint[0]][startPoint[1]] = start;
    board[endpoint[0]][endpoint[1]] = end;

    // Carve maze
    let max = 3000;
    while(max > 0) {
        max--;
        let dir = dirs[Math.floor(Math.random() * 4)];
        
        if(
            carver[0] + dir[0] < 0 || carver[0] + dir[0] >= h ||
            carver[1] + dir[1] < 1 || carver[1] + dir[1] >= w
        ) continue; // Out of bounds

        carver[0] += dir[0];
        carver[1] += dir[1];

        if(board[carver[0]][carver[1]] == clear) continue;  // Already carved
        board[carver[0]][carver[1]] = clear;
        board[carver[0] - dir[0] / 2][carver[1] - dir[1] / 2] = clear; // inbetween

        // elOutput.innerHTML = toHTML(board);

    }

    function loop() {


        if(max > 0) loop();
    }

    // let visual = setInterval(() => {
    //     if(max < 0) {
    //         console.log('Maze created');
    //         return clearInterval(visual);
    //     };
    //     max--;
    //     let dir = dirs[Math.floor(Math.random() * 4)];
        
    //     if(
    //         carver[0] + dir[0] < 0 || carver[0] + dir[0] >= h ||
    //         carver[1] + dir[1] < 1 || carver[1] + dir[1] >= w
    //     ) return; // Out of bounds

    //     carver[0] += dir[0];
    //     carver[1] += dir[1];

    //     if(board[carver[0]][carver[1]] == clear) return;  // Already carved

    //     board[carver[0]][carver[1]] = clear;
    //     board[carver[0] - dir[0] / 2][carver[1] - dir[1] / 2] = clear; // inbetween

    //     elOutput.innerHTML = toHTML(board);
    // }, 5);
    
    console.log('Maze created');
    elOutput.innerHTML = toHTML(board);

    // Reset
    carver[0] = startPoint[0];
    carver[1] = startPoint[1];
    solver[0] = startPoint[0];
    solver[1] = startPoint[1];
    facing = 1;
}


// Solve
function solve() {
    let max = 9000;
    do {
        if(max < 0) return console.warn('Exceeded 9000 loops');
        max--;
        console.log('s');
        let dir = dirsSingle[facing];

        let relativeFacing = sphNum(facing, -1);
        let side = dirsSingle[relativeFacing];

        // Left
        if(board[solver[0] + side[0]][solver[1] + side[1]] != wall) {
            facing = relativeFacing;
            dir = dirsSingle[facing]; // Turn left
            moveForward();
            continue;
        }
        else console.log('Wall on left');

        // Forward
        relativeFacing = facing;
        side = dirsSingle[relativeFacing];
        if(board[solver[0] + side[0]][solver[1] + side[1]] != wall) {
            // Don't turn
            moveForward();
            continue;
        }
        else console.log('Wall in front');

        // Right
        relativeFacing = sphNum(facing, 1);
        side = dirsSingle[relativeFacing];
        if(board[solver[0] + side[0]][solver[1] + side[1]] != wall) {
            facing = relativeFacing;
            dir = dirsSingle[facing]; // Turn left
            moveForward();
            continue;
        }
        else console.log('Wall on right, turning around');

        // Turn around
        relativeFacing = sphNum(facing, 1);
        side = dirsSingle[relativeFacing];
        dir = dirsSingle[relativeFacing];
        moveForward();

        /** Move forward */
        function moveForward() {
            solver[0] += dir[0];
            solver[1] += dir[1];

            if(board[solver[0]][solver[1]] == clear) board[solver[0]][solver[1]] = visited;
        }
    } while(board[solver[0]][solver[1]] != end);

    console.log('MAZE SOLVED', max);
    elOutput.innerHTML = toHTML(board);
}



/** 2D array to string */
function toHTML(board) {
    let html = JSON.parse(JSON.stringify(board));
    for(let i = 0; i < html.length; i++) {
        html[i] = html[i].join('');
    }
    return html.join('\n');
}


function sphNum(value, change=0, min=0, max=3) {
    let result = value + change;
    let range = min + max + 1;
    while(result < min) result += range;
    while(result > max) result -= range;
    return result
}

/** Sleep function (credit: the internet) */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}


generate();
