const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const grid_size = 8;
const tile_size = canvas.width / grid_size;

const assets = {};
const board = [];
const markers = [];

let turn = "w";

main();

function main()
{
    // Set up
    load_assets();
    initialise_board();
    
    // ensure assets are loaded
    setTimeout(() => {

    pieces_setup();
    render();

    }, 200);
}

function render()
{
    make_board();
    draw_pieces();
    draw_markers();
}

function initialise_board()
{
    for(let i = 0; i < grid_size; i++)
    {
        board[i] = [];
        markers[i] = [];
        for(let j = 0; j < grid_size; j++)
        {
            board[i][j] = 0;
            markers[i][j] = 0;
        }
    }
    console.log(markers);
}

function display_possible_moves(colour, type, x, y)
{
    switch(type)
    {
            /*
        case "P":
            if(colour === "w")
            {
                markers.push(new Piece("g", "M", x, y + 1))
                markers.push(new Piece("g", "M", x, y + 2))
            }
            else
            {
                markers.push(new Piece("g", "M", x, y - 1))
                markers.push(new Piece("g", "M", x, y - 2))
            }
            break;

        case "N":
            markers.push(new Piece("g", "M", x - 2, y - 1));
            markers.push(new Piece("g", "M", x - 2, y + 1));
            markers.push(new Piece("g", "M", x - 1, y - 2));
            markers.push(new Piece("g", "M", x - 1, y + 2));
            markers.push(new Piece("g", "M", x + 2, y + 1));
            markers.push(new Piece("g", "M", x + 2, y - 1));
            markers.push(new Piece("g", "M", x + 1, y + 2));
            markers.push(new Piece("g", "M", x + 1, y - 2));
            break;

        case "K":
            markers.push(new Piece("g", "M", x - 1, y - 1));
            markers.push(new Piece("g", "M", x - 1, y));
            markers.push(new Piece("g", "M", x - 1, y + 1));
            markers.push(new Piece("g", "M", x + 1, y - 1));
            markers.push(new Piece("g", "M", x + 1, y));
            markers.push(new Piece("g", "M", x + 1, y + 1));
            markers.push(new Piece("g", "M", x, y + 1));
            markers.push(new Piece("g", "M", x, y - 1));
            break;

        case "B":
            for(let i = -8; i < 8; i++)
            {
                markers.push(new Piece("g", "M", x + i, y + i));
                markers.push(new Piece("g", "M", x - i, y + i));
            }
            break;

        case "Q":
            for(let i = -8; i < 8; i++)
            {
                markers.push(new Piece("g", "M", x + i, y + i));
                markers.push(new Piece("g", "M", x - i, y + i));
                markers.push(new Piece("g", "M", x + i, y));
                markers.push(new Piece("g", "M", x, y + i));
            }
            break;
            */

        // Rook
        case "R":
            // Check up
            my = 1;
            while(y + my < grid_size && board[x][y + my] === 0)
            {
                markers[x][y + my] = new Piece("g", "M", x, y + my);
                my++;
            }
            if(y + my < grid_size && markers[x][y + my].colour != turn)
            {
                markers[x][y + my] = new Piece("g", "M", x, y + my);
            }

            // Check down
            my = 1;
            while(y - my >= 0 && board[x][y - my] === 0)
            {
                markers[x][y - my] = new Piece("g", "M", x, y - my);
                my++;
            }

            // Check left
            mx = 1;
            while(x - mx >= 0 && board[x - mx][y] === 0)
            {
                markers[x - mx][y] = new Piece("g", "M", x - mx, y);
                mx++;
            }
            
            // Check right
            mx = 1;
            while(x + mx < grid_size && board[x + mx][y] === 0)
            {
                markers[x + mx][y] = new Piece("g", "M", x + mx, y);
                mx++;
            }
            break;
    }
}

canvas.addEventListener('click', function(event) 
{
    // Determines mouse coordinates
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left - (tile_size / 2)) / tile_size);
    const y = grid_size - Math.round((event.clientY - rect.top - (tile_size / 2)) / tile_size) -1;

    // Clear all markers
    for(let i = 0; i < grid_size; i++)
    {
        for(let j = 0; j < grid_size; j++)
        {
            markers[i][j] = 0;
        }
    }

    // Find the piece at coordinates, if there is one.
    if(board[x][y] != 0)
    {
        if(turn === board[x][y].colour)
        {
            display_possible_moves(board[x][y].colour,  board[x][y].type, x, y);
        }
    }

    render();
});

// Piece object:
// colour either "w" or "b"
// type either "P", "K", "N", "B", "Q", or "R"
function Piece(colour, type, x, y)
{
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.type = type;

    this.move = function(x, y)
    {
        // Free up previous square
        if(type != "M")
        {
            board[this.x][this.y] = 0;
        }

        this.x = x;
        this.y = y;
    }
    
    this.draw = function()
    {
        const imageKey = `${this.colour}${this.type}`;
        const image = assets[imageKey];
        ctx.drawImage(image, x * tile_size, (grid_size - y - 1) * tile_size);
    }

    this.move(x, y);
}

function pieces_setup()
{
    // Black Pieces
    board[0][6] = new Piece("b", "P", 0, 6);
    board[1][6] = new Piece("b", "P", 1, 6);
    board[2][6] = new Piece("b", "P", 2, 6);
    board[3][6] = new Piece("b", "P", 3, 6);
    board[4][6] = new Piece("b", "P", 4, 6);
    board[5][6] = new Piece("b", "P", 5, 6);
    board[6][6] = new Piece("b", "P", 6, 6);
    board[7][6] = new Piece("b", "P", 7, 6);

    board[0][7] = new Piece("b", "R", 0, 7);
    board[1][7] = new Piece("b", "N", 1, 7);
    board[2][7] = new Piece("b", "B", 2, 7);
    board[3][7] = new Piece("b", "Q", 3, 7);
    board[4][7] = new Piece("b", "K", 4, 7);
    board[5][7] = new Piece("b", "B", 5, 7);
    board[6][7] = new Piece("b", "N", 6, 7);
    board[7][7] = new Piece("b", "R", 7, 7);

    // White Pieces
    board[0][1] = new Piece("w", "P", 0, 1);
    board[1][1] = new Piece("w", "P", 1, 1);
    board[2][1] = new Piece("w", "P", 2, 1);
    board[3][1] = new Piece("w", "P", 3, 1);
    board[4][1] = new Piece("w", "P", 4, 1);
    board[5][1] = new Piece("w", "P", 5, 1);
    board[6][1] = new Piece("w", "P", 6, 1);
    board[7][1] = new Piece("w", "P", 7, 1);

    board[0][0] = new Piece("w", "R", 0, 0);
    board[1][0] = new Piece("w", "N", 1, 0);
    board[2][0] = new Piece("w", "B", 2, 0);
    board[3][0] = new Piece("w", "Q", 3, 0);
    board[4][0] = new Piece("w", "K", 4, 0);
    board[5][0] = new Piece("w", "B", 5, 0);
    board[6][0] = new Piece("w", "N", 6, 0);
    board[7][0] = new Piece("w", "R", 7, 0);




    board[3][3] = new Piece("w", "R", 3, 3);
}


function draw_pieces()
{
    board.forEach(row => {
        row.forEach(piece => {
            if(piece != 0)
            {
                piece.draw()
            }
        });
    });
}

function draw_markers()
{
    markers.forEach(row => {
        row.forEach(marker => {
            if(marker != 0)
            {
                marker.draw()
            }
        });
    });
}

function load_assets()
{
    // Pieces
    assets.wP = new Image();
    assets.wN = new Image();
    assets.wK = new Image();
    assets.wB = new Image();
    assets.wQ = new Image();
    assets.wR = new Image();
    assets.bP = new Image();
    assets.bN = new Image();
    assets.bK = new Image();
    assets.bB = new Image();
    assets.bQ = new Image();
    assets.bR = new Image();

    assets.wP.src = './assets/wP.svg';
    assets.wN.src = './assets/wN.svg';
    assets.wK.src = './assets/wK.svg';
    assets.wB.src = './assets/wB.svg';
    assets.wQ.src = './assets/wQ.svg';
    assets.wR.src = './assets/wR.svg';
    assets.bP.src = './assets/bP.svg';
    assets.bN.src = './assets/bN.svg';
    assets.bK.src = './assets/bK.svg';
    assets.bB.src = './assets/bB.svg';
    assets.bQ.src = './assets/bQ.svg';
    assets.bR.src = './assets/bR.svg';

    // Grey Marking Dot
    assets.gM = new Image();
    assets.gM.src = './assets/gM.svg';
}

function make_board()
{
    for(let row = 0; row < grid_size; row++)
    {
        for(let col = 0; col < grid_size; col++)
        {
            if((row + col) % 2 === 0)
            {
                ctx.fillStyle = 'white';
            }
            else
            {
                ctx.fillStyle = 'grey';
            }
            ctx.fillRect(row * tile_size, col * tile_size, tile_size, tile_size);
        }
    }
}
