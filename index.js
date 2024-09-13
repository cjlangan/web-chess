const canvas = document.getElementById('gameCanvas');
const move_sound = document.getElementById('moveSound');
const capture_sound = document.getElementById('captureSound');
const check_sound = document.getElementById('checkSound');
const ctx = canvas.getContext('2d');

let tile_size;
const grid_size = 8;

const assets = {};
const board = [];
const markers = [];

let npm = 0;
let turn = "w";
let in_check = false;
let bKx = 4, bKy = 7, wKx = 4, wKy = 0;

// Coordinates of last clicked piece.
let clicked_x = 0;
let clicked_y = 0;

main();

function main()
{
    // Set up
    load_assets();
    resize_canvas();
    initialise_board();
    
    // ensure assets are loaded
    setTimeout(() => {

    pieces_setup();
    render();

    }, 500);
}

function render()
{
    make_board();
    draw_pieces();
    draw_markers();
}

function resize_canvas()
{
    const size = Math.round(0.8 * Math.min(window.innerHeight, window.innerWidth) / 8) * 8;
    canvas.height = size;
    canvas.width = size;
    tile_size = canvas.width / grid_size;

    render();
}

window.addEventListener('resize', resize_canvas);

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

function check_for_check(king_colour)
{
    let x = 0;
    let y = 0;

    if(king_colour === "w")
    {
        x = wKx;
        y = wKy;
    }
    else
    {
        x = bKx;
        y = bKy;
    }

    // Scan for pawns
    if(king_colour === "w")
    {
        if(king_static_scan(x, y, 1, 1, king_colour) === "P")
        {
            return true;
        }
        if(king_static_scan(x, y, -1, 1, king_colour) === "P")
        {
            return true;
        }
    }
    else
    {
        if(king_static_scan(x, y, 1, -1, king_colour) === "P")
        {
            return true;
        }
        if(king_static_scan(x, y, -1, -1, king_colour) === "P")
        {
            return true;
        }
    }

    // Scan for knights
    if(king_static_scan(x, y, -2, -1, king_colour) === "N")
    {
        return true;
    }
    if(king_static_scan(x, y, -2, 1, king_colour) === "N")
    {
        return true;
    }
    if(king_static_scan(x, y, -1, -2, king_colour) === "N")
    {
        return true;
    }
    if(king_static_scan(x, y, -1, 2, king_colour) === "N")
    {
        return true;
    }
    if(king_static_scan(x, y, 2, -1, king_colour) === "N")
    {
        return true;
    }
    if(king_static_scan(x, y, 2, 1, king_colour) === "N")
    {
        return true;
    }
    if(king_static_scan(x, y, 1, -2, king_colour) === "N")
    {
        return true;
    }
    if(king_static_scan(x, y, 1, 2, king_colour) === "N")
    {
        return true;
    }

    // Scan upper left
    piece = king_piece_scan(x, y, -1, 1, king_colour);
    if(piece === "B" || piece === "Q")
    {
        return true;
    }
    // Scan upper right
    piece = king_piece_scan(x, y, 1, 1, king_colour);
    if(piece === "B" || piece === "Q")
    {
        return true;
    }
    // Scan bottom left
    piece = king_piece_scan(x, y, -1, -1, king_colour);
    if(piece === "B" || piece === "Q")
    {
        return true;
    }
    // Scan bottom right
    piece = king_piece_scan(x, y, 1, -1, king_colour);
    if(piece === "B" || piece === "Q")
    {
        return true;
    }

    // Scan top
    piece = king_piece_scan(x, y, 0, 1, king_colour);
    if(piece === "R" || piece === "Q")
    {
        return true;
    }
    // Scan down
    piece = king_piece_scan(x, y, 0, -1, king_colour);
    if(piece === "R" || piece === "Q")
    {
        return true;
    }
    // Scan left
    piece = king_piece_scan(x, y, -1, 0, king_colour);
    if(piece === "R" || piece === "Q")
    {
        return true;
    }
    // Scan right
    piece = king_piece_scan(x, y, 1, 0, king_colour);
    if(piece === "R" || piece === "Q")
    {
        return true;
    }
    return false;
}

function king_static_scan(x, y, mx, my, king_colour)
{
    let piece = 0;
    if(in_grid(x+mx, y+my) && is_piece(x+mx, y+my) && board[x+mx][y+my].colour != king_colour)
    {
        piece = board[x+mx][y+my].type;
    }
    return piece;
}

function king_piece_scan(x, y, marker_x, marker_y, king_colour)
{
    let mx = marker_x;
    let my = marker_y;
    let piece = 0;

    while(in_grid(x+mx, y+my) && !is_piece(x+mx, y+my))
    {
        mx += marker_x;
        my += marker_y;
    }
    if(in_grid(x+mx, y+my) && is_piece(x+mx, y+my) && board[x+mx][y+my].colour != king_colour)
    {
        piece = board[x+mx][y+my].type;
    }
    return piece;
}

function scan_passant(x, y)
{
    let passant = false;

    if(in_grid(x, y) && is_piece(x, y) && board[x][y].can_passant && board[x][y].colour != turn)
    {
        if(turn === "w")
        {
            markers[x][y+1] = new Piece("g", "M", x, y+1);
            markers[x][y+1].can_passant = true;
        }
        else
        {
            markers[x][y-1] = new Piece("g", "M", x, y-1);
            markers[x][y-1].can_passant = true;
        }
    }
}

function display_possible_moves(type, x, y)
{
    switch(type)
    {
        case "P":
            if(turn === "w")
            {
                pawn_scan(x, y, 0, 1);
                if(board[x][y].num_moves === 0 && !is_piece(x, y+1))
                {
                    pawn_scan(x, y, 0, 2);
                }
            }
            else
            {
                pawn_scan(x, y, 0, -1);
                if(board[x][y].num_moves === 0 && !is_piece(x, y-1))
                {
                    pawn_scan(x, y, 0, -2);
                }
            }
            // Check for En Passant
            scan_passant(x-1, y);
            scan_passant(x+1, y);
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

            if(!in_check)
            {
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
        if(!test_for_check(x, y, x+mx, y+my))
        {
            markers[x+mx][y+my] = new Piece("g", "M", x+mx, y+my);
            npm++;
        }
    }
    if(my === -1 || my === 1)
    {
        if(in_grid(x-1, y+my) && is_piece(x-1, y+my) && board[x-1][y+my].colour != turn)
        {
            if(!test_for_check(x, y, x-1, y+my))
            {
                markers[x-1][y+my] = new Piece("g", "M", x-1, y+my);
                npm++;
            }
        }
        if(in_grid(x+1, y+my) && is_piece(x+1, y+my) && board[x+1][y+my].colour != turn)
        {
            if(!test_for_check(x, y, x+1, y+my))
            {
                markers[x+1][y+my] = new Piece("g", "M", x+1, y+my);
                npm++;
            }
        }

    }
}

function static_scan(x, y, mx, my)
{
    if(in_grid(x+mx, y+my) && (!is_piece(x+mx, y+my) || board[x+mx][y+my].colour != turn))
    {
        if(!test_for_check(x, y, x+mx, y+my))
        {
            markers[x+mx][y+my] = new Piece("g", "M", x+mx, y+my);
            npm++;
        }
    }
}

function piece_scan(x, y, marker_x, marker_y)
{
    let mx = marker_x;
    let my = marker_y;

    while(in_grid(x+mx, y+my) && !is_piece(x+mx, y+my))
    {
        if(!test_for_check(x, y, x+mx, y+my))
        {
            markers[x+mx][y+my] = new Piece("g", "M", x+mx, y+my);
            npm++;
        }
        mx += marker_x;
        my += marker_y;
    }
    if(in_grid(x+mx, y+my) && is_piece(x+mx, y+my) && board[x+mx][y+my].colour != turn)
    {
        if(!test_for_check(x, y, x+mx, y+my))
        {
            markers[x+mx][y+my] = new Piece("g", "M", x+mx, y+my);
            npm++;
        }
    }
}

function test_for_check(x, y, new_x, new_y)
{
    let check = false;

    // if going to replace a piece, we need a copy of it to put back
    let was_piece = is_piece(new_x, new_y);
    if(was_piece)
    {
        temp_piece = new Piece(board[new_x][new_y].colour, board[new_x][new_y].type, 0, 0);
        temp_piece.num_moves = board[new_x][new_y].num_moves;
    }

    // Put piece at new postion theoretically
    let temp_moves = board[x][y].num_moves;
    let temp_type = board[x][y].type;
    board[x][y].move(new_x, new_y);

    // Test if move puts own king in check.
    if(check_for_check(turn))
    {
        check = true;
    }

    // Put piece back
    board[new_x][new_y].move(x, y);
    board[x][y].num_moves = temp_moves;
    board[x][y].type = temp_type;

    // Put removal back
    if(was_piece)
    {
        board[new_x][new_y] = new Piece(temp_piece.colour, temp_piece.type, new_x, new_y);
        board[new_x][new_y].num_moves = temp_piece.num_moves;
    }


    return check;
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
        let was_piece = !(board[x][y] === 0);

        // Check for En Passant
        if(markers[x][y].can_passant)
        {
            if(turn === "w")
            {
                board[x][y-1].move(x, y);
            }
            else
            {
                board[x][y+1].move(x, y);
            }
            was_piece = true;
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

        // Scan for a check
        in_check = check_for_check(turn);

        // Check for a checkmate.
        npm = 0;
        if(in_check)
        {
            // Determine number of possible moves of all pieces.
            for(let i = 0; i < grid_size; i++)
            {
                for(let j = 0; j < grid_size; j++)
                {
                    if(is_piece(i, j) && board[i][j].colour === turn)
                    {
                        display_possible_moves(board[i][j].type, i, j);
                    }
                }
            }

            if(npm === 0)
            {
                console.log("Win.");
            }
        }

        // Play proper sound
        if(in_check)
        {
            check_sound.play();
        }
        else if(was_piece)
        {
            capture_sound.play();
        }
        else
        {
            move_sound.play();
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
            display_possible_moves(board[x][y].type, x, y);
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
    this.can_passant = false;

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

        // Check if passantable
        if(this.type === "P" && this.num_moves === 0 && (y === 3 || y === 4))
        {
            board[x][y].can_passant = true;
        }
        
        // Check if a king was moved and update global position
        if(this.type === "K")
        {
            if(turn === "w")
            {
                wKx = x;
                wKy = y;
            }
            else
            {
                bKx = x;
                bKy = y;
            }
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
