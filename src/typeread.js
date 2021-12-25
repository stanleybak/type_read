"use strict";
// Stanley Bak, Dec 24th

var Canvas = (function() {

var self = {}; // exported functions
    
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

// constants
var LIGHT_BLUE = 'rgb(0,153,255)';
var MAX_TYPED_LEN = 10;
var TROPHY_PATH = 'trophy.png';
var TYPE_DELAY_MS = 500; // 500 ms typing delay

// variables
var repaintRequested = false;
var trophyImage = new Image();
var trophies = []; // list of x coords

var v = document.getElementById('vid1');

// assigned on init
var canvas;
var currentWord;
var currentWordFont;
var typedWord;
var lastTypeMs;
var incorrectCount = 0;
    
function keyPress(e)
{
    if (!e.repeat)
    {
        lastTypeMs = ms();
        
        var keynum = -1;

        if (window.event) // IE
            keynum = e.keyCode;
        else if (e.which) // Netscape/Firefox/Opera
            keynum = e.which;

        var charStr = String.fromCharCode(keynum).toLowerCase();

        if (charStr.match(/^[0-9a-z]+$/))
        {
            if (typedWord.length + 1 > MAX_TYPED_LEN)
                typedWord = typedWord.substring(0, MAX_TYPED_LEN - 1);

            if (typedWord.length == 0)
                new Audio(currentWord + '.mp3').play();
            
            typedWord += charStr;
        }
        else if (keynum == 8) // backspace
        {
            // backspace
            if (typedWord.length > 0)
                typedWord = typedWord.substring(0, typedWord.length - 1);
        }
        else if (keynum == 13)
            checkAnswer();

        repaint();
    }
}

function ms()
{
    return new Date().getTime();
}

function checkAnswer()
{
    if (typedWord == currentWord)
    {
        new Audio(currentWord + '.mp3').play();
        
        var x = 100 + ms() % (canvas.width - 200);
        trophies.push(x);
        nextWord();
    }
    else
    {
        new Audio('wrong.mp3').play();
        
        if (incorrectCount >= 1)
        {
            console.log("incorrect; next word");
            nextWord();
        }
        else
            incorrectCount += 1;
    }
}

function nextWord()
{
    var index = ms() % words.length; // time returned is milliseconds 
    currentWord = words[index];

    var size = 40 + ms() % 30;
    var fonts = ["serif", "sans-serif", "courier"];
    var font = fonts[ms() % fonts.length];

    currentWordFont = size + "px " + font;

    typedWord = "";
    incorrectCount = 0;
    repaint();
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

    if (!v.paused && !v.ended)
    {
        console.log('frame');
        ctx.drawImage(v, 0, 0,canvas.width, canvas.height);
        //setTimeout(draw,20,v,c,w,h);
        repaint();
    }
    else
    {
        drawBackground(ctx);

        // trophies
        var y = 10; //canvas.height / 10;
        var img = document.getElementById("trophy");

        for (var i = 0; i < trophies.length; ++i)
        {
            var x = trophies[i];

            // draw trophy at x, y
            ctx.drawImage(trophyImage, x, y, 50, 80);
        }

        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.font = currentWordFont;

        var x = canvas.width / 2;
        var y = canvas.height / 3;
        ctx.fillText(currentWord, x, y);

        ctx.font = "serif";
        var y = 2 * canvas.height / 3;
        ctx.fillStyle = "red";
        ctx.fillText(typedWord, x, y);

        drawBoundary(ctx);
    }

    ctx.restore();
}

function drawBackground(ctx)
{
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width, canvas.height);
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

    trophyImage.src = TROPHY_PATH; // in theory we should wait until it loads before drawing

    lastTypeMs = ms();

    //requestFullScreen(document.documentElement);
    repaint();
};

    return self;

}());

function init(id)
{
    Canvas.init(id);
}
