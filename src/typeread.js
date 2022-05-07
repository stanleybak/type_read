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
         "call", "cold", "does", "fast", "first", "five", "found", "gave", "goes", "green", "its", "made",
         "many", "off", "or", "pull", "read", "right", "sing", "sit", "sleep", "tell", "their", "these", "those",
         "upon", "us", "use", "very", "wash", "which", "why", "wish", "work", "would", "write", "your", "about",
         "better", "bring", "carry", "clean", "cut", "done", "draw", "drink", "eight", "fall", "far", "full", "got",
         "grow", "hold", "hot", "hurt", "if", "keep", "kind", "laugh", "light", "long", "much", "myself", "never",
         "only", "own", "pick", "seven", "shall", "show", "six", "small", "start", "ten", "today", "together", "try",
         "warm", "apple", "baby", "back", "ball", "bear", "bed", "bell", "bird", "birthday", "boat", "box", "boy",
         "bread", "brother", "cake", "car", "cat", "chair", "chicken", "children", "coat", "corn",
         "cow", "day", "dog", "doll", "door", "duck", "egg", "eye", "farm", "farmer", "father", "feet", "fire",
         "fish", "floor", "flower", "game", "garden", "girl", "grass", "ground", "hand", "head", "hill",
         "home", "horse", "house", "kitty", "leg", "letter", "man", "men", "milk", "money", "morning", "mother",
         "name", "nest", "night", "paper", "party", "picture", "pig", "rabbit", "rain", "ring", "robin", "school",
         "seed", "sheep", "shoe", "sister", "snow", "song", "squirrel", "stick", "street", "sun", "table", "thing",
         "time", "top", "toy", "tree", "watch", "water", "way", "wind", "window", "wood"];

// constants
var LIGHT_BLUE = 'rgb(0,153,255)';
var TEXT_BACKGROUND = 'rgba(255,255,255,0.85)';
var MAX_TYPED_LEN = 10;
var NUM_PRAISES = 12;
var REMOVE_TROPHY_MS = 2000;
var MOVE_TROPHY_MS = 1000;
var SELECT_VIDEO_BORDER = 4;
var VIDEO_PLAY_SECS = 75;
var WIN_TROPHY_COUNT = 10;
var WIN_SHUFFLE_COUNT = 10;
var NUM_TROPHIES_REMOVE_WRONG = 3;
var NUM_TROPHIES = 6;
var WIN_REDIRECT_URL = '/typer/games'; //undefined;

// variables
var repaintRequested = false;
//var trophyImages = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
var trophyImages = [];
var trophies = []; // list of dicts with x, y coords and other info
var videos = [];
var video = 0; // selected video

var mouseOverVideoIndex = -1;
var mathAnswer = -1;
var video_counter = 6;
var trophyOffset = 0;
var gameEnded = false;
var winShuffles = 0;

var mouseClickedTrophyIndex = -1;
var mouseLastX = 0;
var mouseLastY = 0;

// assigned on init
var canvas;
var currentWord;
var showFirstLetter = 0;
var currentWordFont;
var typedWord;
var incorrectCount;
    
function keyPress(e)
{  
    var keynum = -1;
    
    if (window.event) // IE
        keynum = e.keyCode;
    else if (e.which) // Netscape/Firefox/Opera
        keynum = e.which;

    var charStr = String.fromCharCode(keynum).toLowerCase();
    
    if (!video.paused && !video.ended)
    {
        // pause video
        if (charStr == " ")
            video.pause();
        else
        {
            var w = window.innerWidth - 20;
            var h = window.innerHeight - 20;

            if (w != canvas.width)
            {
                canvas.width = w;
                canvas.height = h;
            }
            else
            {
                canvas.width = w - 1;
                canvas.height = h - 1;
                console.log("canvas.width = " + canvas.width);
            }
        }
    }
    else if (!e.repeat && !gameEnded)
    {
        if (charStr.match(/^[0-9a-z]+$/))
        {
            if (typedWord.length + 1 > MAX_TYPED_LEN)
                typedWord = typedWord.substring(0, MAX_TYPED_LEN - 1);

            if (mathAnswer == -1 && (typedWord.length == 0 || (typedWord + charStr == currentWord)))
                new Audio(currentWord + '.mp3').play();
            
            typedWord += charStr;
        }
        else if (keynum == 8) // backspace
        {
            // backspace
            if (typedWord.length > 0)
                typedWord = typedWord.substring(0, typedWord.length - 1);
        }
        else if (keynum == 13 && typedWord.length > 0)
            checkAnswer();

        repaint();
    }
}

function getDateString()
{
    const options = { 
      month: '2-digit', 
      day: '2-digit',
      year: 'numeric', 
    };

    return new Date().toLocaleDateString('en-US', options); // mm/dd/yyyy
}

function saveState()
{
    // save state to local storage
    var today = getDateString();
    var ls = window.localStorage;

    ls.setItem('today', today);
    ls.setItem('trophies', JSON.stringify(trophies));
    ls.setItem('video_counter', JSON.stringify(video_counter));
    ls.setItem('trophyOffset', JSON.stringify(trophyOffset));
    ls.setItem('gameEnded', JSON.stringify(gameEnded));
}

function loadState()
{
    var ls = window.localStorage;
    var today = ls.getItem('today');

    if (today != null && today == getDateString())
    {
        var ended = JSON.parse(ls.getItem('gameEnded'));
        // if gameEnded, do not load

        if (!ended)
        {
            trophies = JSON.parse(ls.getItem('trophies'));
            video_counter = JSON.parse(ls.getItem('video_counter'));
            trophyOffset = JSON.parse(ls.getItem('trophyOffset'));

            repaint();
        }
    }
}

function rand()
{
    //return new Date().getTime();
    return Math.floor(Math.random() * 100000);
}

function playVideo()
{
    video.play();

    window.setTimeout(function (){video.pause();}, VIDEO_PLAY_SECS * 1000);
}

function moveTrophies(moveMs, moveAll)
{
    var now = mills();
    
    for (var i = 0; i < trophies.length; ++i)
    {
        var t = trophies[i];

        var loc = randomTrophyLocation();

        if (moveAll || !('manuallyMoved' in t))
        {
            t.moveX = loc[0];
            t.moveY = loc[1];
            t.stillMoving = true;
            t.moveTime = now + moveMs;
        }
    }

    repaint();
}

function randomTrophyLocation()
{
    var x = rand() % (canvas.width - 70);
    var y = rand() % (canvas.height - 90);

    return [x, y];
}

function checkAnswer()
{
    if (typedWord == "restart")
    {
        gameEnded = false;
        trophies = [];
        video_counter = 6;
        trophyOffset = 0;
        nextWord();
        repaint();
    }
    else if ((mathAnswer == -1 && typedWord == currentWord) || (mathAnswer != -1 && typedWord == "" + mathAnswer))
    {
        // play "jia you!"
        var filename = "praise" + (rand() % NUM_PRAISES) + ".mp3";
        new Audio(filename).play();
        
        var type = -1; // trophy type

        if (rand() % 100 == 0)
        {
            type = 5; // random red trophy
        }
        else if (mathAnswer == -1)
        {
            // word
            
            if (currentWord.length < 5)
                type = 0;
            else if (currentWord.length < 7)
                type = 3;
            else
                type = 4;
        }
        else if (currentWord.includes("-"))
        {
            // minus
            type = 2;
        }
        else
        {
            // plus
            type = 1;
        }
        
        var loc = randomTrophyLocation();

        var x = loc[0];
        var y = loc[1];
        var w = 30 + rand() % 40;
        var h = 3 * w / 2;

        if (rand() % 50 == 0)
        {
            // really big (maybe)
            w += 100;
            h = 3 * w / 2;
        }

        var t = {'x': x, 'y': y, 'w': w, 'h': h, 'type': type};
        trophies.push(t);
        currentWord = "";
        typedWord = "";
        repaint();
        
        if (trophies.length - trophyOffset >= video_counter)
        {
            trophyOffset = trophies.length; 
            video_counter += 1;

            if (video_counter >= WIN_TROPHY_COUNT)
            {
                playVideo();
                gameEnded = true;
            }
            else
            {
                window.setTimeout(function (){moveTrophies(MOVE_TROPHY_MS, false);}, 500);
                window.setTimeout(function (){playVideo(); nextWord();}, MOVE_TROPHY_MS + 1500);
            }
        }
        else
            window.setTimeout(function (){nextWord();}, 1000);
    }
    else
    {
        new Audio('wrong.mp3').play();
        
        if (incorrectCount >= 5)
        {
            currentWord = "";
            typedWord = "";

            if (trophies.length > 0)
            {
                for (var k = 0; k < NUM_TROPHIES_REMOVE_WRONG; ++k)
                {
                    var i = rand() % trophies.length;
                    trophies[i]['deathTime'] = REMOVE_TROPHY_MS + mills(); // set death time
                }
            }
            
            repaint();
            
            window.setTimeout(function (){nextWord();}, REMOVE_TROPHY_MS + 100);
        }
        else
            incorrectCount += 1;
    }

    saveState();
}

function mills()
{
    return new Date().getTime();
}

function nextWord()
{
    mathAnswer = -1;
    
    if (rand() % 3 == 0)
    { // math
        if (rand() % 3 > 0)
        {
            // add
            var a = rand() % 11;
            var b = rand() % 11;
            currentWord = a + " + " + b;
            mathAnswer = a + b;
        }
        else
        { // subtract
            var b = rand() % 5;
            var a = b + rand() % 13;
            currentWord = a + " - " + b;
            mathAnswer = a - b;
        }
    }
    else
    {
        var index = rand() % words.length; // time returned is milliseconds 
        currentWord = words[index];

        showFirstLetter = rand() % 3;

        if (!showFirstLetter)
        {
            // play sound
            new Audio(currentWord + '.mp3').play();
        }
    }
    
    var size = 35 + rand() % 30;
    var fonts = ["serif", "sans-serif", "courier", "Arial", "Verdana", "Helvetica"];
    var font = fonts[rand() % fonts.length];
        
    currentWordFont = size + "px " + font;

    typedWord = "";
    incorrectCount = 0;
    repaint();
}

function windowResize(event)
{
    var w = window.innerWidth - 20;
    var h = window.innerHeight - 20;

    canvas.width = w;
    canvas.height = h;

    repaint();
};

function requestFullScreen(element)
{
    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement ||
        document.webkitFullscreenElement || document.msFullscreenElement;
    
    if (fullscreenElement)
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
}

function repaint()
{
    if (!repaintRequested)
    {
        repaintRequested = true;
        window.requestAnimationFrame(draw);
    }
}

function drawVideoPlaying(ctx)
{
    drawBackground(ctx, 'black');

    var vidRatio = video.videoWidth / video.videoHeight;
    var canvasRatio = canvas.width / canvas.height;

    if (vidRatio > canvasRatio)
    {
        var w = canvas.width;
        var h = canvas.width / vidRatio;
        var y = (canvas.height - (canvas.width / vidRatio)) / 2;

        ctx.drawImage(video, 0, y, w, h); //, canvas.width, canvas.height);
    }
    else
    {
        var w = canvas.height * vidRatio;
        var h = canvas.height;
        var x = (canvas.width - (canvas.height * vidRatio)) / 2;

        ctx.drawImage(video, x, 0, w, h); //, canvas.width, canvas.height);
    }
    
    repaint();
}

function drawGame(ctx)
{
    drawBackground(ctx, 'white');

    // draw trophies
    var now = mills();
    var eraseTrophyIndex = -1;
    var anyTrophiesMoving = false;

    for (var i = 0; i < trophies.length; ++i)
    {
        var t = trophies[i];
        var x = t.x;
        var y = t.y;
        var w = t.w;
        var h = t.h;
        var type = t.type;
        var im = trophyImages[type];

        if ('deathTime' in t)
        {
            // erase trophy slowly
            var deathTime = t.deathTime;                

            var t = 0; // goes from 1 down to 0

            if (now >= deathTime)
                eraseTrophyIndex = i;
            else
                t = (deathTime - now) / REMOVE_TROPHY_MS;

            // scale goes from (1, 1), (0.5, 2), (0, 0)
            // use a parabola
            var scale = 7*t - 6*t*t
            
            var oldW = w;
            var oldH = h;
            w *= scale;
            h *= scale;

            x = x + (oldW - w) / 2;
            y = y + (oldH - h) / 2;

            repaint();
        }
        else if ('moveTime' in t)
        {
            // move trophy over time
            var moveTime = t.moveTime;
            var stillMoving = t.stillMoving;

            if (stillMoving)
            {
                anyTrophiesMoving = true; 
                var fracOld = 0.0;

                if (now >= moveTime)
                {
                    // done moving
                    t.stillMoving = false;
                    t.x = t.moveX;
                    t.y = t.moveY;
                }
                else
                    fracOld = (moveTime - now) / MOVE_TROPHY_MS;

                x = fracOld * t.x + (1 - fracOld) * t.moveX;
                y = fracOld * t.y + (1 - fracOld) * t.moveY;

                repaint();
            }
        }

        ctx.drawImage(im, x, y, w, h);
    }

    if (eraseTrophyIndex != -1)
    {
        mouseClickedTrophyIndex = -1; // in case there's a current dragging selection
        trophies.splice(eraseTrophyIndex, 1);
    }

    if (gameEnded)
    {
        if (!anyTrophiesMoving)
        {
            moveTrophies(MOVE_TROPHY_MS, true);
            winShuffles += 1;

            if (winShuffles > WIN_SHUFFLE_COUNT && WIN_REDIRECT_URL !== undefined)
                window.location.replace(WIN_REDIRECT_URL);
        }

        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.font = "60px serif";

        ctx.fillText("You Win!", canvas.width/2, canvas.height/2);
    }
    else
    {
        ctx.fillStyle = 'grey';
        ctx.textAlign = 'left';
        ctx.font = "30px serif";

        var remaining = video_counter - (trophies.length - trophyOffset);
        ctx.fillText("" + remaining, 5, canvas.height - 10);

        ctx.fillStyle = 'black';
        ctx.font = currentWordFont;

        var x = canvas.width / 2;
        var y = canvas.height / 3;
        //ctx.fillText(currentWord, x, y);

        if (mathAnswer != -1)
            boxText(ctx, currentWord, "black", x, y);
        else if (currentWord.length > 0)
        {
            if (showFirstLetter != 0)
                boxText(ctx, currentWord, "black", x, y);
            else if (incorrectCount > 0 && currentWord.substring(1) == typedWord.substring(1))
                boxText(ctx, currentWord, "black", x, y);
            else
                boxText(ctx, "*" + currentWord.substring(1), "black", x, y);
        }
        
        ctx.font = "40px serif";
        var y = 2 * canvas.height / 3;
        //ctx.fillStyle = "red";
        //ctx.fillText(typedWord, x, y);
        boxText(ctx, typedWord, "red", x, y);
    }
}

function drawVideoSelection(ctx)
{
    drawBackground(ctx, 'gray');

    var cw = canvas.width;
    var ch = canvas.height;
    
    var w = cw / 2 - 50;
    var h = ch / 2 - 50;
    var xs = [cw / 4 - w/2, 3 * cw / 4 - w/2, cw / 4 - w/2, 3 * cw / 4 - w/2];
    var ys = [ch / 4 - h/2, ch / 4 - h/2, 3 * ch / 4 - h/2, 3 * ch / 4 - h/2];

    var b = SELECT_VIDEO_BORDER;

    for (var i = 0; i < 4; ++i)
    {
        ctx.fillStyle = (i == mouseOverVideoIndex ? 'red' : 'black');
        ctx.fillRect(xs[i] - b, ys[i] - b, w + 2*b, h + 2*b);
        
        ctx.drawImage(videos[i], xs[i], ys[i], w, h);

        if (!videos[i].paused && !videos[i].ended)
            repaint();
    }
}

function getOverVideoIndex(x, y)
{
    var cw = canvas.width;
    var ch = canvas.height;

    var w = cw / 2 - 50;
    var h = ch / 2 - 50;
    var xs = [cw / 4 - w/2, 3 * cw / 4 - w/2, cw / 4 - w/2, 3 * cw / 4 - w/2];
    var ys = [ch / 4 - h/2, ch / 4 - h/2, 3 * ch / 4 - h/2, 3 * ch / 4 - h/2];

    var over = -1;

    for (var i = 0; i < 4; ++i)
    {
        // check if in region
        if (x >= xs[i] && x <= xs[i] + w && y >= ys[i] && y <= ys[i] + h)
            over = i;
    }

    return over;
}

function mouseMove(e)
{
    var mx = e.offsetX;
    var my = e.offsetY;
    
    if (video == 0)
    {
        var over = getOverVideoIndex(mx, my);

        if (over != mouseOverVideoIndex)
        {
            mouseOverVideoIndex = over;
            repaint();
        }
    }
    else
    {
        var pressed = e.buttons === undefined ? e.which & 1 == 1 : e.buttons & 1 == 1;

        if (pressed && mouseClickedTrophyIndex != -1)
        {
            var dx = mx - mouseLastX;
            var dy = my - mouseLastY;

            var t = trophies[mouseClickedTrophyIndex];
            t.x += dx;
            t.y += dy;
            t['manuallyMoved'] = true;
            repaint();
        }
        else
        {
            mouseClickedTrophyIndex = -1;
        }
    }

    mouseLastX = mx;
    mouseLastY = my;
}

function checkTrophyClicked(mx, my)
{
    mouseClickedTrophyIndex = -1;
    
    for (var i = trophies.length - 1; i >= 0; --i)
    {
        var t = trophies[i];

        // cannot select moving trophies
        if ('moveTime' in t && t.stillMoving)
            continue;

        if (mx >= t.x && mx <= t.x + t.w && my >= t.y && my <= t.y + t.h)
        {
            // draw it last (move to top)
            for (var j = i; j < trophies.length - 1; ++j)
                trophies[j] = trophies[j + 1];
            
            trophies[trophies.length - 1] = t;
            
            mouseClickedTrophyIndex = trophies.length - 1;
            break;
        }
    }
}
    
function mouseDown(e)
{
    var mx = e.offsetX;
    var my = e.offsetY;
    
    if (video == 0)
    {
        var over = getOverVideoIndex(mx, my);

        if (over != -1)
        {
            requestFullScreen(document.documentElement);
            
            video = videos[over];

            loadState();
            repaint();
        }
    }
    else if (!gameEnded)
        checkTrophyClicked(mx, my);
}

function draw()
{
    repaintRequested = false;
    var ctx = canvas.getContext('2d');
    ctx.save();

    if (video == 0)
        drawVideoSelection(ctx);
    else if (!video.paused && !video.ended)
        drawVideoPlaying(ctx);
    else
        drawGame(ctx);

    drawBoundary(ctx);

    ctx.restore();
}

function boxText(ctx, str, textColor, x, y)
{
    ctx.save();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    ctx.fillStyle = TEXT_BACKGROUND;
    
    var width = ctx.measureText(str).width;

    // note height is hardcoded
    ctx.fillRect(x - width/2, y, width, 45);
    
    ctx.fillStyle = textColor;

    ctx.fillText(str, x, y);
    
    ctx.restore();
}

function drawBackground(ctx, color)
{
    ctx.fillStyle = color;
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
    window.addEventListener('mousemove', mouseMove, false);
    window.addEventListener('mousedown', mouseDown, false);

    window.onresize = windowResize;

    nextWord();

    //for (var i = 0; i < trophyImages.length; ++i)
    //    trophyImages[i].src = 'trophy' + i + '.png'; // in theory we should wait until it loads before drawing

    for (var i = 0; i < NUM_TROPHIES; ++i)
    {
        trophyImages.push(document.getElementById('trophy' + i));
    }

    for (var i = 0; i < 4; ++i)
    {
        videos[i] = document.getElementById('vid' + i);

        // random start point in video
        videos[i].currentTime = rand() % videos[i].duration;
    }

    // updates video frame after loading
    for (var i = 1; i < 20; ++i)
        window.setTimeout(repaint, 100 * i); 

    windowResize();

    repaint();
};

    return self;

}());

function init(id)
{
    Canvas.init(id);
}
