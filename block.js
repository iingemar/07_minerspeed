var block = function(gameContext) {
    var that = {};
    var context = gameContext;
    var image = new Image();
    var markedImage = new Image();
    markedImage.src = 'marked.png';
    var gfxIndex = Math.floor(Math.random()*5);
    var gfx = [
        'block_blue.png', 
        'block_green.png', 
        'block_pink.png', 
        'block_red.png',
        'block_yellow.png',         
    ];
    image.src = gfx[gfxIndex];
    var color = gfx[gfxIndex];
    var position = {x:0, y:0};
    var target = {x:0, y:300};
    var width = 45;
    var height = 45;
    var marked = false;
    
    that.getColor = function() {
        return color;
    }
    
    that.getPosition = function() {
        return position;
    }
    
    that.setPosition = function(newPosition) {
        position = newPosition;
    }        
    
    that.getTarget = function() {
        return target;
    }
    
    that.setTarget = function(newTarget) {
        target = newTarget;
    }
    
    that.getWidth = function() {
        return width;
    }    
    
    that.getHeight = function() {
        return height;
    }
    
    that.setMarked = function(newMarked) {
        marked = newMarked;
    }
    
    that.tween = function(time) {
        var tween = new TWEEN.Tween(position).to(target, time);    
        tween.start();        
    }
    
    that.update = function() {
        // yo
    }
    
    that.draw = function() {
        if(position.y > 80) {
            context.drawImage(image, position.x, position.y);
            if(marked) {
                context.drawImage(markedImage, position.x, position.y);
            }
        }
    }
    
    return that;
}