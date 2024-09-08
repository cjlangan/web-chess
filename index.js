const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const grid_size = 8;
const tile_size = canvas.width / grid_size;

const assets = {};
const pieces = [];

main();

function main()
{
    // Set up
    make_board();
    load_assets();

    // ensure assets are loaded
    setTimeout(() => {


    pieces.push(new Piece("w", "P", 1, 7));
    pieces.push(new Piece("b", "K", 2, 8));
    pieces.push(new Piece("w", "Q", 3, 3));
    pieces.push(new Piece("b", "B", 8, 5));

    draw_pieces();


    }, 100);
}

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

    this.move(x, y);
}

function draw_pieces()
{
    pieces.forEach(piece => piece.draw());
}

function load_assets()
{
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
