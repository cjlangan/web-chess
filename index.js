const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const grid_size = 8;
const tile_size = canvas.width / grid_size;
const assets = {};

main();

function main()
{
    // Set up
    make_board();
    load_assets();

    // ensure assets are loaded
    setTimeout(() => {


    const p = new Pawn(1, 7);


    }, 100);
}

function Pawn(x, y)
{
    this.x = (x - 1) * tile_size;
    this.y = (y - 1) * tile_size;
    
    this.move = function(x, y)
    {
        ctx.clearRect(this.x, this.y, tile_size, tile_size);
        
        this.x = (x - 1) * tile_size;
        this.y = (y - 1) * tile_size;

        ctx.drawImage(assets.wP, this.x, this.y);
    }
    
    this.move(x, y);
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
    assets.wK.src = './assets/wN.svg';
    assets.wB.src = './assets/wN.svg';
    assets.wQ.src = './assets/wN.svg';
    assets.wR.src = './assets/wN.svg';
    assets.bP.src = './assets/wP.svg';
    assets.bN.src = './assets/wN.svg';
    assets.bK.src = './assets/wN.svg';
    assets.bB.src = './assets/wN.svg';
    assets.bQ.src = './assets/wN.svg';
    assets.bR.src = './assets/wN.svg';
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
                ctx.fillStyle = 'black';
            }
            ctx.fillRect(row * tile_size, col * tile_size, tile_size, tile_size);
        }
    }
}
