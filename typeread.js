"use strict";
// Stanley Bak, Dec 24th

var Canvas = (function() {

var self = {}; // exported functions

console.log("in canvas");
    
// words slightly filtered from from https://en.wikipedia.org/wiki/Dolch_word_list
var words = ["and", "away", "big", "blue", "can", "come", "down", "find", "for", "funny", "go", "help", "here", "in",
         "is", "it", "jump", "little", "look", "make", "me", "my", "not", "one", "play", "red", "run", "said", "see",
         "the", "three", "to", "two", "up", "we", "where", "yellow", "you", "all", "am", "are", "at", "ate", "be",
         "black", "brown", "but", "came", "did", "do", "eat", "four", "get", "good", "have", "he", "into", "like",
         "must", "new", "no", "now", "on", "our", "out", "please", "pretty", "ran", "ride", "saw", "say", "she",
         "so", "soon", "that", "there", "they", "this", "too", "under", "want", "was", "well", "went", "what",
         "white", "who", "will", "with", "yes", "after", "again", "an", "any", "as", "ask", "by", "could", "every",
         "fly", "from", "give", "going", "had", "has", "her", "him", "his", "how", "just", "know", "let", "live",
         "may", "of", "old", "once", "open", "over", "put", "round", "some", "stop", "take", "thank", "them", "then",
         "think", "walk", "were", "when", "always", "around", "because", "been", "before", "best", "both", "buy",
         "call", "cold", "does", "don't", "fast", "first", "five", "found", "gave", "goes", "green", "its", "made",
         "many", "off", "or", "pull", "read", "right", "sing", "sit", "sleep", "tell", "their", "these", "those",
         "upon", "us", "use", "very", "wash", "which", "why", "wish", "work", "would", "write", "your", "about",
         "better", "bring", "carry", "clean", "cut", "done", "draw", "drink", "eight", "fall", "far", "full", "got",
         "grow", "hold", "hot", "hurt", "if", "keep", "kind", "laugh", "light", "long", "much", "myself", "never",
         "only", "own", "pick", "seven", "shall", "show", "six", "small", "start", "ten", "today", "together", "try",
         "warm", "apple", "baby", "back", "ball", "bear", "bed", "bell", "bird", "birthday", "boat", "box", "boy",
         "bread", "brother", "cake", "car", "cat", "chair", "chicken", "children", "coat", "corn",
         "cow", "day", "dog", "doll", "door", "duck", "egg", "eye", "farm", "farmer", "father", "feet", "fire",
         "fish", "floor", "flower", "game", "garden", "girl", "good-bye", "grass", "ground", "hand", "head", "hill",
         "home", "horse", "house", "kitty", "leg", "letter", "man", "men", "milk", "money", "morning", "mother",
         "name", "nest", "night", "paper", "party", "picture", "pig", "rabbit", "rain", "ring", "robin", "school",
         "seed", "sheep", "shoe", "sister", "snow", "song", "squirrel", "stick", "street", "sun", "table", "thing",
         "time", "top", "toy", "tree", "watch", "water", "way", "wind", "window", "wood"];

var repaintRequested = false;
var LIGHT_BLUE = 'rgb(0,153,255)';

// assigned on init
var canvas;
var current_word;
var current_word_font;
var typed;
    
function keyPress(e)
{
    console.log('key down ' + e);

    var audio = new Audio(current_word + '.mp3');
    audio.play();
}

function nextWord()
{
    var index = new Date().getTime() % words.length; // time returned is milliseconds 
    current_word = words[index];

    var size = 24 + new Date().getTime() % 20;
    var fonts = ["serif", "sans-serif", "courier"];
    var font = fonts[new Date().getTime() % fonts.length];

    current_word_font = size + "px " + font;

    typed = "";
}

function windowResize(event)
{
    if (isFullScreen())
    {
        var w = window.innerWidth;
        var h = window.innerHeight;

        canvas.width = w;
        canvas.height = h;

        canvasSizeChanged();
    }
};

function requestFullScreen(element)
{
    if (element.requestFullscreen)
        element.requestFullscreen();
    else if (element.msRequestFullscreen)
        element.msRequestFullscreen();
    else if (element.mozRequestFullScreen)
        element.mozRequestFullScreen();
    else if (element.webkitRequestFullscreen)
        element.webkitRequestFullscreen();
}

function fullScreenChange()
{
    if (!isFullScreen())
    {
        // exiting full screen
        canvas.width = originalCanvasW;
        canvas.height = originalCanvasH;

        document.body.classList.remove(FULL_SCREEN_CLASS);
        buttons.full.extra = extraFull;
    }
    else
    {
        // entering full screen
        document.body.classList.add(FULL_SCREEN_CLASS);
        buttons.full.extra = extraRestore;

        // canvas size when entering full screen is handled by windowResize()
    }

    canvasSizeChanged();
}

function isFullScreen()
{
    return (document.fullScreenElement && document.fullScreenElement !== null)
         || document.mozFullScreen
         || document.webkitIsFullScreen;
}

function canvasSizeChanged()
{
    // update things that depend on canvas size 
    //var fullX = canvas.width - 1.5*BUTTON_W - BUTTON_BUF;
    //var fullY = canvas.height - BUTTON_W - BUTTON_BUF;

    //updateButtonRectangles();
    //recenter();
    //repaint();
}

function repaint()
{
    if (!repaintRequested)
    {
        repaintRequested = true;
        window.requestAnimationFrame(draw);
    }
}

function draw()
{
    repaintRequested = false;
    
    var ctx = canvas.getContext('2d');
    ctx.save();
    
    ctx.font = current_word_font;
    ctx.fillText(current_word, 50, 50);

    drawBoundary(ctx);

    ctx.restore();
    console.log("draw()");
}

function drawBoundary(ctx)
{
    ctx.lineWidth = 1;
    ctx.strokeStyle = LIGHT_BLUE;
    ctx.strokeRect(0,0,canvas.width, canvas.height);
}

self.init = function init(canvasId)
{
    canvas = document.getElementById(canvasId);
    
    window.addEventListener('keydown', keyPress, false);

    canvasSizeChanged();
    window.onresize = windowResize;

    // add full screen listener
    document.addEventListener("fullscreenchange", fullScreenChange, false);
    document.addEventListener("mozfullscreenchange", fullScreenChange, false);
    document.addEventListener("webkitfullscreenchange", fullScreenChange, false);
    document.addEventListener("msfullscreenchange", fullScreenChange, false);

    nextWord();

    //requestFullScreen(document.documentElement);
    repaint();
};

    return self;

}());

function init(id)
{
    Canvas.init(id);
}