const body = document.querySelector('body');
const elOutput = document.getElementById("output");
const elOptions = {
    color: document.getElementById("color_option"),
    size: document.getElementById("size_option")
}
const elPointer = document.getElementById("pointer");

const wall = '<div class="wall"></div>';
const clear = '<div class="clear"></div>';
const start = '<div class="start"></div>';
const end = '<div class="end"></div>';

const solverSquare = '<div class="solver"></div>';
const visited = '<div class="visited"></div>';
const backtracked = '<div class="backed"></div>';

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
var boardState = false;

carver[0] = startPoint[0];
carver[1] = startPoint[1];
solver[0] = startPoint[0];
solver[1] = startPoint[1];

var settings = {
    gen_speed: 0, // loop delay in ms
    solve_speed: 20,
    portrait: false,
}
const settingCode = {
    portrait: () => {
        settings.portrait ? body.classList.add('portrait') : body.classList.remove('portrait');
    }
}

/** Generate maze */
function generate(h=17, w=32) {
    boardState = 'Generating';

    // Create 2D array
    for(let hi = 0; hi < h; hi++) { // Down
        board[hi] = [];
        for(let wi = 0; wi < w; wi++) { // Across
            board[hi][wi] = wall;
        }
    }

    // Create start and end
    board[startPoint[0]][startPoint[1]] = start;
    board[endpoint[0]][endpoint[1]] = end;

    // Prevent infinite loop
    let max = 3000;

    // Instant generation
    if(settings.gen_speed == 0) {
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

            // toHTML(board);

        }
    }

    // Visualize generation
    else {
        let visual = setInterval(() => {
            if(max < 0) {
                console.log('Maze created');
                return clearInterval(visual);
            }
            max--;
            let dir = dirs[Math.floor(Math.random() * 4)];
            
            if(
                carver[0] + dir[0] < 0 || carver[0] + dir[0] >= h ||
                carver[1] + dir[1] < 1 || carver[1] + dir[1] >= w
            ) return; // Out of bounds
    
            carver[0] += dir[0];
            carver[1] += dir[1];
    
            if(board[carver[0]][carver[1]] == clear) return;  // Already carved
    
            board[carver[0]][carver[1]] = clear;
            board[carver[0] - dir[0] / 2][carver[1] - dir[1] / 2] = clear; // inbetween
    
            toHTML(board);
        }, 5);
    }
    
    console.log('Maze created');
    boardState = false;
    toHTML(board);

    // Reset
    carver[0] = startPoint[0];
    carver[1] = startPoint[1];
    solver[0] = startPoint[0];
    solver[1] = startPoint[1];
    facing = 1;
}


// Solve
function solve() {
    if(boardState == 'Solved') return console.warn('Maze already solved');
    else if(boardState == 'Generating') return console.warn('Cannot solve maze until generation is complete');
    let max = 9000;

    // Instant run
    if(settings.solve_speed == 0) {
        do {
            if(max < 0) return console.warn('Exceeded 9000 loops');
            max--;
            // console.log('s');
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

                // Solved path
                var adjacents = [];
                for(i in dirsSingle) {
                    let d = dirsSingle[i];
                    console.log(d);
                    try {
                        adjacents.push(board[solver[0] + d[0]][solver[1] + d[1]]);
                    } catch (error) {
                        adjacents.push('OoB'); // out of bounds
                    }
                }

                if(board[solver[0]][solver[1]] == visited && !adjacents.includes(clear)) board[solver[0]][solver[1]] = backtracked;
                if(board[solver[0]][solver[1]] == clear) board[solver[0]][solver[1]] = visited;
            }
        } while(board[solver[0]][solver[1]] != end);
    }

    // Visualized
    else {
        let visual = setInterval(() => {
            if(board[solver[0]][solver[1]] == end || max < 0) {
                // console.log('');
                return clearInterval(visual);
            }

            // console.log('s');
            let dir = dirsSingle[facing];
    
            let relativeFacing = sphNum(facing, -1);
            let side = dirsSingle[relativeFacing];
    
            // Left
            if(board[solver[0] + side[0]][solver[1] + side[1]] != wall) {
                facing = relativeFacing;
                dir = dirsSingle[facing]; // Turn left
                moveForward();
                return;
            }
            else console.log('Wall on left');
    
            // Forward
            relativeFacing = facing;
            side = dirsSingle[relativeFacing];
            if(board[solver[0] + side[0]][solver[1] + side[1]] != wall) {
                // Don't turn
                moveForward();
                return;
            }
            else console.log('Wall in front');
    
            // Right
            relativeFacing = sphNum(facing, 1);
            side = dirsSingle[relativeFacing];
            if(board[solver[0] + side[0]][solver[1] + side[1]] != wall) {
                facing = relativeFacing;
                dir = dirsSingle[facing]; // Turn
                moveForward();
                return;
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

                // Solved path
                var adjacents = [];
                for(i in dirsSingle) {
                    let d = dirsSingle[i];
                    console.log(d);
                    try {
                        adjacents.push(board[solver[0] + d[0]][solver[1] + d[1]]);
                    } catch (error) {
                        adjacents.push('OoB'); // out of bounds
                    }
                }

                if(board[solver[0]][solver[1]] == visited && !adjacents.includes(clear)) board[solver[0]][solver[1]] = backtracked;
                if(board[solver[0]][solver[1]] == clear) board[solver[0]][solver[1]] = visited;
                toHTML(board);
            }

            max--;
        }, settings.solve_speed);
    }


    console.log('MAZE SOLVED', max);
    boardState = 'Solved';
    toHTML(board);
}



/** 2D array to string */
function toHTML(board) {
    let html = JSON.parse(JSON.stringify(board)); // Clone board
    html[solver[0]][solver[1]] = solverSquare; // Highlight solver
    for(let i = 0; i < html.length; i++) { 
        html[i] = `<div class="row">${ html[i].join('')}</div>`; // Join rows
    }
    elOutput.innerHTML = html.join('\n');
}


function sphNum(value, change=0, min=0, max=3) {
    let result = value + change;
    let range = min + max + 1;
    while(result < min) result += range;
    while(result > max) result -= range;
    return result
}

/** Sleep function (credit: the internet) */
// const sleep = (milliseconds) => {
//     return new Promise(resolve => setTimeout(resolve, milliseconds))
// }


document.querySelectorAll('input[data-setting]').forEach(element => {
    element.addEventListener('change', event => {
        // console.log(element.value);
        let type = element.getAttribute("type");
        settings[element.dataset.setting] = type == 'checkbox' ? element.checked : element.value;
        let func = settingCode[element.dataset.setting];
        if(func != undefined) func();
    })
})


generate();
