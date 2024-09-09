const canvas = document.getElementById('gameCanvas');
const move_sound = document.getElementById('moveSound');
const capture_sound = document.getElementById('captureSound');
const check_sound = document.getElementById('checkSound');
const ctx = canvas.getContext('2d');

let size = Math.round(0.8 * Math.min(window.innerHeight, window.innerWidth) / 8) * 8;
canvas.height = size;
canvas.width = size;
const grid_size = 8;
let tile_size = canvas.width / grid_size;

const assets = {};
const board = [];
const markers = [];

let turn = "w";

// Coordinates of last clicked piece.
let clicked_x = 0;
let clicked_y = 0;

main();

function main()
{
    // Set event listener to dynamically change 
    // size of board based on the size of the window.
    window.addEventListener("resize", () => { 
        size = Math.round(0.8 * Math.min(window.innerHeight, window.innerWidth) / 8) * 8;
        canvas.height = size;
        canvas.width = size;
        tile_size = canvas.width / grid_size;
        // Render board with updated size.
        render()
    } );

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
}

function display_possible_moves(colour, type, x, y)
{
    switch(type)
    {
        case "P":
            if(turn === "w")
            {
                pawn_scan(x, y, 0, 1);
                if(board[x][y].num_moves === 0)
                {
                    pawn_scan(x, y, 0, 2);
                }
            }
            else
            {
                pawn_scan(x, y, 0, -1);
                if(board[x][y].num_moves === 0)
                {
                    pawn_scan(x, y, 0, -2);
                }
            }
            break;
        case "N":
            static_scan(x, y, -2, -1);
            static_scan(x, y, -2, 1);
            static_scan(x, y, -1, 2);
            static_scan(x, y, -1, -2);
            static_scan(x, y, 1, 2);
            static_scan(x, y, 1, -2);
            static_scan(x, y, 2, -1);
            static_scan(x, y, 2, 1);
            break;
        case "K":
            static_scan(x, y, -1, -1);
            static_scan(x, y, -1, 0);
            static_scan(x, y, -1, 1);
            static_scan(x, y, 0, -1);
            static_scan(x, y, 0, 1);
            static_scan(x, y, 1, -1);
            static_scan(x, y, 1, 0);
            static_scan(x, y, 1, 1);

            // Check left for castling
            if(board[x][y].num_moves === 0 && !is_piece(x-1, y) && !is_piece(x-2, y)
                && !is_piece(x-3, y) && is_valid_rook(x-4, y))
            {
                markers[x-2][y] = new Piece("g", "M", x-2, y);
                markers[x-2][y].castlable = "l";
            }
            // Check right for castling
            if(board[x][y].num_moves === 0 && !is_piece(x+1, y) && !is_piece(x+2, y)
                && is_valid_rook(x+3, y))
            {
                markers[x+2][y] = new Piece("g", "M", x+2, y);
                markers[x+2][y].castlable = "r";
            }

            break;
        case "B":
            piece_scan(x, y, 1, 1);
            piece_scan(x, y, 1, -1);
            piece_scan(x, y, -1, 1);
            piece_scan(x, y, -1, -1);
            break;
        case "R":
            piece_scan(x, y, 0, 1);
            piece_scan(x, y, 1, 0);
            piece_scan(x, y, -1, 0);
            piece_scan(x, y, 0, -1);
            break;
        case "Q":
            piece_scan(x, y, 1, 1);
            piece_scan(x, y, 1, -1);
            piece_scan(x, y, -1, 1);
            piece_scan(x, y, -1, -1);
            piece_scan(x, y, 0, 1);
            piece_scan(x, y, 1, 0);
            piece_scan(x, y, -1, 0);
            piece_scan(x, y, 0, -1);
            break;
    }
}

function is_valid_rook(x, y)
{
    return is_piece(x, y) && board[x][y].type === "R" && board[x][y].colour === turn 
                            && board[x][y].num_moves === 0;
}

function pawn_scan(x, y, mx, my)
{
    if(in_grid(x+mx, y+my) && !is_piece(x+mx, y+my))
    {
        markers[x+mx][y+my] = new Piece("g", "M", x+mx, y+my);
    }
    if(my === -1 || my === 1)
    {
        if(in_grid(x-1, y+my) && is_piece(x-1, y+my) && board[x-1][y+my].colour != turn)
        {
            markers[x-1][y+my] = new Piece("g", "M", x-1, y+my);
        }
        if(in_grid(x+1, y+my) && is_piece(x+1, y+my) && board[x+1][y+my].colour != turn)
        {
            markers[x+1][y+my] = new Piece("g", "M", x+1, y+my);
        }

    }
}

function static_scan(x, y, mx, my)
{
    if(in_grid(x+mx, y+my) && (!is_piece(x+mx, y+my) || board[x+mx][y+my].colour != turn))
    {
        markers[x+mx][y+my] = new Piece("g", "M", x+mx, y+my);
    }
}

function piece_scan(x, y, marker_x, marker_y)
{
    mx = marker_x;
    my = marker_y;

    while(in_grid(x+mx, y+my) && !is_piece(x+mx, y+my))
    {
        markers[x+mx][y+my] = new Piece("g", "M", x+mx, y+my);
        mx += marker_x;
        my += marker_y;
    }
    if(in_grid(x+mx, y+my) && is_piece(x+mx, y+my) && board[x+mx][y+my].colour != turn)
    {
        markers[x+mx][y+my] = new Piece("g", "M", x+mx, y+my);
    }
}

function in_grid(x, y)
{
    return x >= 0 && y >= 0 && x < grid_size && y < grid_size;
}

function is_piece(x, y)
{
    return board[x][y] != 0;
}

canvas.addEventListener('click', function(event) 
{
    // Determines mouse coordinates
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left - (tile_size / 2)) / tile_size);
    const y = grid_size - Math.round((event.clientY - rect.top - (tile_size / 2)) / tile_size) -1;

    
    // Check if a marker was clicked
    if(markers[x][y] != 0)
    {
        // Play proper sound
        if(is_piece(x, y))
        {
            capture_sound.play();
        }
        else
        {
            move_sound.play();
        }
        
        board[clicked_x][clicked_y].move(x, y);

        // Check for castling and castle.
        switch(markers[x][y].castlable)
        {
            case "l":
                board[x-2][y].move(x+1, y);
                break;
            case "r":
                board[x+1][y].move(x-1, y);
                break;
        }
        
        // Change Turn
        if(turn === "w")
        {
            turn = "b";
        }
        else
        {
            turn = "w";
        }
    }

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
            clicked_x = x;
            clicked_y = y;
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
    this.num_moves = 0;
    this.castlable = 0;

    this.move = function(x, y)
    {
        // Create a new piece at the new position
        board[x][y] = new Piece(this.colour, this.type, x, y);
        board[x][y].num_moves = this.num_moves + 1;

        // Check for pawn promotion
        if(this.type === "P" && ((y === grid_size - 1 && this.colour === "w") || 
                                             (y === 0 && this.colour === "b")))
        {
            board[x][y].type = "Q";
        }

        // Delete the old piece (this one)
        if(type != "M")
        {
            board[this.x][this.y] = 0;
        }
    }
    
    this.draw = function()
    {
        const imageKey = `${this.colour}${this.type}`;
        const image = assets[imageKey];
        ctx.drawImage(image, this.x * tile_size, (grid_size - this.y - 1) * tile_size
                        , tile_size, tile_size);
    }
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
