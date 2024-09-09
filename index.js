const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const grid_size = 8;
const tile_size = canvas.width / grid_size;

const assets = {};
const pieces = [];
const markers = [];

main();

function main()
{
    // Set up
    make_board();
    load_assets();

    // ensure assets are loaded
    setTimeout(() => {

    pieces_setup();
    draw_pieces();
    draw_markers();


    }, 200);
}

function render()
{
    make_board();
    draw_pieces();
    draw_markers();
    console.log("rendered.");
}

function display_possible_moves(colour, type, x, y)
{
    switch(type)
    {
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


        case "R":
            for(let i = -8; i < 8; i++)
            {
                markers.push(new Piece("g", "M", x + i, y));
                markers.push(new Piece("g", "M", x, y + i));
            }
            break;
    }
}

canvas.addEventListener('click', function(event) 
{
    // Determines mouse coordinates
    const rect = canvas.getBoundingClientRect();
    const x_click = Math.round((event.clientX - rect.left + (tile_size / 2)) / tile_size);
    const y_click = grid_size - Math.round((event.clientY - rect.top - (tile_size / 2)) / tile_size);

    // Clear all markers
    markers.length = 0;

    found_piece = false;
    idx = 0;

    // Find the piece at coordinates, if there is one.
    while(!found_piece && idx < pieces.length)
    {
        if(pieces[idx].get_x() === x_click && pieces[idx].get_y() === y_click)
        {
            display_possible_moves( pieces[idx].colour,  pieces[idx].type, 
                                    pieces[idx].get_x(), pieces[idx].get_y());
            found_piece = true;
        }

        idx++;
    }


    render();
});

function pieces_setup()
{
    // Black Pieces
    pieces.push(new Piece("b", "P", 1, 7));
    pieces.push(new Piece("b", "P", 2, 7));
    pieces.push(new Piece("b", "P", 3, 7));
    pieces.push(new Piece("b", "P", 4, 7));
    pieces.push(new Piece("b", "P", 5, 7));
    pieces.push(new Piece("b", "P", 6, 7));
    pieces.push(new Piece("b", "P", 7, 7));
    pieces.push(new Piece("b", "P", 8, 7));

    pieces.push(new Piece("b", "R", 1, 8));
    pieces.push(new Piece("b", "N", 2, 8));
    pieces.push(new Piece("b", "B", 3, 8));
    pieces.push(new Piece("b", "Q", 4, 8));
    pieces.push(new Piece("b", "K", 5, 8));
    pieces.push(new Piece("b", "B", 6, 8));
    pieces.push(new Piece("b", "N", 7, 8));
    pieces.push(new Piece("b", "R", 8, 8));

    // White Pieces
    pieces.push(new Piece("w", "P", 1, 2));
    pieces.push(new Piece("w", "P", 2, 2));
    pieces.push(new Piece("w", "P", 3, 2));
    pieces.push(new Piece("w", "P", 4, 2));
    pieces.push(new Piece("w", "P", 5, 2));
    pieces.push(new Piece("w", "P", 6, 2));
    pieces.push(new Piece("w", "P", 7, 2));
    pieces.push(new Piece("w", "P", 8, 2));

    pieces.push(new Piece("w", "R", 1, 1));
    pieces.push(new Piece("w", "N", 2, 1));
    pieces.push(new Piece("w", "B", 3, 1));
    pieces.push(new Piece("w", "Q", 4, 1));
    pieces.push(new Piece("w", "K", 5, 1));
    pieces.push(new Piece("w", "B", 6, 1));
    pieces.push(new Piece("w", "N", 7, 1));
    pieces.push(new Piece("w", "R", 8, 1));
}

// Piece object:
// colour either "w" or "b"
// type either "P", "K", "N", "B", "Q", or "R"
function Piece(colour, type, x, y)
{
    this.x = (x - 1) * tile_size;
    this.y = (grid_size - y) * tile_size;
    this.colour = colour;
    this.type = type;

    this.move = function(x, y)
    {
        this.x = (x - 1) * tile_size;
        this.y = (grid_size - y) * tile_size;
    }
    
    this.draw = function()
    {
        const imageKey = `${this.colour}${this.type}`;
        const image = assets[imageKey];
        ctx.drawImage(image, this.x, this.y);
    }

    this.get_x = function()
    {
        return this.x / tile_size + 1;
    }

    this.get_y = function()
    {
        return grid_size - (this.y / tile_size);
    }

    this.move(x, y);
}

function draw_pieces()
{
    pieces.forEach(piece => piece.draw());
}

function draw_markers()
{
    markers.forEach(marker => marker.draw());
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
