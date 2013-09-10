/*
 * Selector
 */
var Selector = Class.extend({
    init: function(context, row, col) {
        this.context = context;
        this.image = new Image();
        this.image.src = 'selector.png';
        this.setPosition(row, col);
        this.visible = true;
    },
    
    setPosition: function(row, col) {
        this.pos = {
            x: MINER.X + row * MINER.BLOCK_SIZE, 
            y: MINER.Y + col * MINER.BLOCK_SIZE
        };
    },
    
    hide: function() {
        this.visible = false;
    },
    
    show: function() {
        this.visible = true;
    },
    
    update: function() {
        // wut
    },
    
    draw: function() {
        if (this.visible) {
            this.context.drawImage(this.image, this.pos.x, this.pos.y);
        }
    }
});

/*
 * Block
 */
var Block = Class.extend({
    init: function(context, gem, row, col) {
        this.gfx = [
            'block_blue.png', 
            'block_green.png', 
            'block_pink.png', 
            'block_red.png',
            'block_yellow.png',         
        ];
        this.context = context;
        this.image = new Image();
        this.image.src = this.gfx[gem];
        this.setPosition(row, col);
        this.visible = true;
    },
    
    setPosition: function(row, col) {
        this.pos = {
            x: 320 + (row * MINER.BLOCK_SIZE), 
            y: 90 + (col * MINER.BLOCK_SIZE)
        };
        this.name = row + "_" + col;
    },
    
    hide: function() {
        this.visible = false;
    },
    
    show: function() {
        this.visible = true;
    },

    
    update: function() {
        
    },
    
    draw: function() {
        if (this.visible) {
            this.context.drawImage(this.image, this.pos.x, this.pos.y);
        }
    }
});

// ----------------------------------------------------------------------------

$(function() {
    MINER = {};
    MINER.BLOCK_SIZE = 45;
    MINER.ROWS = 8;
    MINER.COLUMNS= 8;
    MINER.X= 320;  // Tiles area position
    MINER.Y= 90;
    MINER.X_MIN= MINER.X;        
    MINER.X_MAX= MINER.X + MINER.ROWS * MINER.BLOCK_SIZE;
    MINER.Y_MIN= MINER.Y;        
    MINER.Y_MAX= MINER.Y + MINER.COLUMNS * MINER.BLOCK_SIZE

    var canvas = document.getElementById('canvas');
    var width = canvas.width;
    var height = canvas.height;    
    var context = canvas.getContext('2d');   

    $('#output .one').append('X_MIN=' + MINER.X_MIN + '<br>');
    $('#output .one').append('X_MAX=' + MINER.X_MAX + '<br>');
    $('#output .one').append('Y_MIN=' + MINER.Y_MIN + '<br>');
    $('#output .one').append('Y_MAX=' + MINER.Y_MAX + '<br>');
    
    $('#canvas').mousedown(function(event) {
        // get click position on canvas
        var x = event.pageX - $('#canvas').offset().left;
        var y = event.pageY - $('#canvas').offset().top;
    
        $('#output .two').html('click ' + x + ', ' + y);
        if (x > MINER.X_MIN && x < MINER.X_MAX &&
            y > MINER.Y_MIN && y < MINER.Y_MAX) {
            var selRow = Math.floor((x-MINER.X)/MINER.BLOCK_SIZE);
            var selCol = Math.floor((y-MINER.Y)/MINER.BLOCK_SIZE);
            
            printDebug(selRow+','+selCol);  
            
            // If same row or same column, then we want to swap (if possible)
            if (isAdjacent(selRow, selCol, pickedRow, pickedCol)) {
                // Swap arr to easier check if successful streak
                swapJewelsArray(pickedRow, pickedCol, selRow, selCol);
                if (isStreak(pickedRow, pickedCol) || isStreak(selRow, selCol)) {
                    // If successful swap graphical objects
                    printDebug('swap');
                    swapJewelObjects(pickedRow, pickedCol, selRow, selCol);
                    // If picked becomes streak
                    if (isStreak(pickedRow, pickedCol)) {
                        removeGems(pickedRow, pickedCol);
                    } 
                    // If selected becomes streak
                    if (isStreak(selRow, selCol)) {
                        removeGems(selRow, selCol);
                    }
                } else {
                    // Otherwise swap back arr and undo last move
                    swapJewelsArray(pickedRow, pickedCol, selRow, selCol);
                }
                
                pickedRow = NONE;
                pickedCol = NONE;
                selector.hide();
            } else {
                pickedRow = selRow;
                pickedCol = selCol;
                selector.setPosition(selRow, selCol);
                selector.show();
            }
        }
    });
    
    var printDebug = function(text) {
        $('#output .two').append('<br>');
        $('#output .two').append(text);
    };
    
    var removeGems = function(row, col) {
        var remove = [];
        remove.push(row+'_'+col);
        var current = jewels[row][col];
        var tmp;
        if (rowStreak(row, col) > 2) {
            printDebug('vertical streak ' + rowStreak(row, col));
            tmp = col;
            // Check all same gems to left of current
            while (checkGem(current, row, tmp-1)) {
                tmp--;
                remove.push(row+'_'+tmp)
            }
            // Right
            tmp = col;
            while (checkGem(current, row, tmp+1)) {
                tmp++;
                remove.push(row+'_'+tmp)
            }
        }
        if (colStreak(row, col) > 2) {
            printDebug('horizontal streak ' + colStreak(row, col));
            tmp = row;
            // Check all same gems above
            while (checkGem(current, tmp-1, col)) {
                tmp--;
                remove.push(tmp+'_'+col)
            }
            tmp = row;
            // Below
            while (checkGem(current, tmp+1, col)) {
                tmp++;
                remove.push(tmp+'_'+col)
            }
        }
        
        for (var i=0; i<remove.length; i++) {
            var current = remove[i];
            for (var j=0; j<blocks.length; j++) {
                if (blocks[j].name == current) {
                    blocks.splice(j, 1);
                    var coordinates = current.split('_');
                    jewels[coordinates[0]][coordinates[1]] = NONE;
                    break;
                }
            }
        }
        
        adjustGems();
    };
    
    var adjustGems = function() {
        for (var j=0; j<8; j++) {
            // From row at bottom of screen and upwards
            for (var i=7; i>0; i--) {
                if (jewels[i][j] == NONE) {
                    printDebug('replace [' + i + ',' + j + ']');
                    // Search upwards for gem
                    for (var k=i; k>0; k--) {
                        printDebug('[' + k + ',' + j + '] ' + jewels[k][j]);
                        if (jewels[k][j] != NONE) {
                            printDebug('row ' + k + ' > ' + i);
                            jewels[i][j] = jewels[k][j];
                            jewels[k][j] = NONE;
                            var moved = getJewelObject(k, j);
                            // Update position and name on gfx object
                            moved.setPosition(i, j);
                            break;
                        }
                    }
                }
            }
        }
    };
    
    var swapJewelsArray = function(row1, col1, row2, col2) {
        var tmp = jewels[row1][col1];
        jewels[row1][col1] = jewels[row2][col2];
        jewels[row2][col2] = tmp;
    };
    
    var getJewelObject = function(row, col) {
        var name = row + '_' + col
        return getObject(name);
    };
    
    var getObject = function(name) {
        var len = blocks.length;
        for (var i=0; i<len; i++) {
            if (blocks[i].name == name) {
                return blocks[i];
            }
        }
    };
    
    var swapJewelObjects = function(row1, col1, row2, col2) {
        var jewel1 = getJewelObject(row1, col1);
        var jewel2 = getJewelObject(row2, col2);
        jewel1.setPosition(row2, col2);
        jewel2.setPosition(row1, col1);
    };
    
    var background = new Image();
    background.src = 'background.png';
    
    var jewels = [];
    var blocks = [];
    var selector;
    var NONE = -10;
    var pickedRow = NONE;
    var pickedCol = NONE;

    var init = function() {
        for (var i=0; i<8; i++) {
            jewels[i] = [];
            for (var j=0; j<8; j++) {
                jewels[i][j] = -1;
            }
        }
                
        for (var i=0; i<8; i++) {
            for (var j=0; j<8; j++) {
                do {
                    jewels[i][j] = Math.floor(Math.random() * 5);  // 0-4
                } while(isStreak(i, j));
                var block = new Block(context, jewels[i][j], i, j);
                blocks.push(block);
            }   
        }
        
        selector = new Selector(context, 0, 0);
    };
    
    var checkGem = function(gem, row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) {
            return false;
        }
        // Ok, check actual gem
        return gem == jewels[row][col];
    };
    
    var rowStreak = function(row, col) {
        var current = jewels[row][col];
        var streak = 1;
        
        // Check gems to the left
        var tmp = col;
        while (checkGem(current, row, tmp - 1)) {
            tmp--;
            streak++;
        }
        
        // Check gems to the right
        var tmp = col;
        while (checkGem(current, row, tmp + 1)) {
            tmp++;
            streak++;
        }
        
        return streak;
    };
    
    var colStreak = function(row, col) {
        var current = jewels[row][col];
        var streak = 1;
        
        // Check gems up
        var tmp = row;
        while (checkGem(current, tmp - 1, col)) {
            tmp--;
            streak++;
        }
        
        // Check gems down
        var tmp = row;
        while (checkGem(current, tmp + 1, col)) {
            tmp++;
            streak++;
        }
        
        return streak;
    };
    
    // Returns if given position is part of a successful streak of same jewels
    // with length > 2 horizontally or vertically
    var isStreak = function(row, col) {
        return rowStreak(row, col) > 2 || colStreak(row, col) > 2;
    };
    
    // Two gems are adjacent 
    // if they are on the same row 
    // and they are next to each other.
    var isAdjacent = function(row1, col1, row2, col2) {
        // if they are on the same column 
        // and the first gem is right under or right below the second,     
        if (col1 == col2 && (row1 == row2+1 || row1 == row2-1)) {
            return true;
        }
        
        // Optimized
        // return Math.abs(row1-row2) + Math.abs(col1-col2) == 1;
        
        return row1 == row2 && (col1 == col2+1 || col1 == col2-1);
    };    
    
    init();
    
    var update = function() {
    
    };
            
    var draw = function() {
        // Clear screen
        context.clearRect(0, 0, width, height);     
        // Draw background image
        context.drawImage(background, 0, 0);
        // Draw all blocks
        var i = blocks.length;
        while(i--) {
            blocks[i].draw();
        }
        // Draw selector
        selector.draw();
    };

    setInterval(function() {
        update();
        draw();
    }, 1000/60);    
});