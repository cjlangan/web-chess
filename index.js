const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const grid_size = 8;
const tile_size = 50;

// Creating the chess board.
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

