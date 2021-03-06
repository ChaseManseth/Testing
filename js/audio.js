// Cookie variables
var radius, n, numberBars, rotAngle;
//var n = Cookies.get('degCookies'); line 44

// Create audio context
var AUDIO = new AudioContext();
if (!AUDIO) {
    console.error('Web Audio API not supported :(');
}

// Create and configure analyser node and storage buffer
var analyser = AUDIO.createAnalyser();
analyser.fftSize = 512;
var bufferLength = analyser.frequencyBinCount;
console.log(bufferLength);
var dataArray = new Uint8Array(bufferLength);

// Cache HTML elements
var viz = document.getElementById('viz'),
    aud = document.getElementById('audio');

// Creates many boxes 
function createBars(numBars) {
    var barCollection = [];

    console.log('numBars', numBars);
    numberBars = numBars;
    for (var i = 0; i <= numBars; i++) {
        var a = document.createElement('div');
        a.classList.add('bar');

        viz.appendChild(a);
        barCollection.push($(a));
    }

    return barCollection;
}

// $bars is an array of all the bars creates
var $bars = 0;
// snip is trimming the last blank buffer length
var snip = 99; // Normal is 99
// n is the degree of the smoothing algorithm

// Verify degree
// Ask a question once for higher degrees
var ans = false;

function degreeSet(x) {
    if (x > 5) {
        if (!ans) {
            toggleState(); // Pause
            $('#degreeWarning').show();

            // User answers yes
            $("#degYes").on("click", function () {
                ans = true;
                $('#degreeWarning').hide();
                degreeSet(x);
            });

            // Users answers no
            $("#degNo").on("click", function () {
                ans = false;
                $('#degreeWarning').hide();
                degreeSet(3);

                // Set the input bar back to three
                $('#degree').val(3);
                $(".degval").html("Current Value: " + $('#degree').val());
            });

            toggleState(); // Play
        } else {
            // Removes all elements
            document.getElementById("viz").innerHTML = '';
            // Sets the seg array to 0 and creates them again with the proper amount of segs
            $bars = 0;
            $bars = createBars((((bufferLength - snip) - 1) * 2) * x);
            // Restyle it because we have more or less segs now and must adjust
            circle();
            n = x;

            // Set the Cookie
            Cookies.set('degCookies', x);
        }
    } else {
        // Removes all elements
        document.getElementById("viz").innerHTML = '';
        // Sets the seg array to 0 and creates them again with the proper amount of segs
        $bars = 0;
        $bars = createBars((((bufferLength - snip) - 1) * 2) * x);
        // Restyle it because we have more or less segs now and must adjust
        circle();
        n = x;

        // Set the Cookie
        Cookies.set('degCookies', x);
    }
}


// Main render and update method
function update() {
    analyser.getByteFrequencyData(dataArray);

    // Copy the dataArray without high frequencies
    var low = [];
    var len = (bufferLength - snip);
    var power = Cookies.get('variability'); // Default value is 3
    for (var i = 0; i <= len; i++) {
        low.push(dataArray[i]);
    }

    // Find the max value frequency per run
    var max = 255;

    // Add the power to increase or decrease variability
    for (var i = 0; i < low.length; i++) {
        low[i] = Math.pow(low[i], power) / (Math.pow(max, power) / 250);
    }

    // Use Scott's parabolic approximation function
    var smooth = [];
    smooth.push(Math.floor(low[0]));

    for (var i = 1; i < low.length - 1; i += 2) {

        var c = low[i];
        var a = (low[i + 1] + low[i - 1] - 2 * low[i]) / 2.0;
        var b = (low[i + 1] - low[i - 1]) / 2.0;

        for (var j = 1; j < n; j++) {
            smooth.push(Math.floor(a * (1.0 / n) * (1.0 / n) * j + b * (1.0 / n) * (-1) * j + c));
        }

        smooth.push(Math.floor(low[i]));
        for (var j = 1; j < n; j++) {
            smooth.push(Math.floor(a * (1.0 / n) * (1.0 / n) * j + b * (1.0 / n) * j + c));
        }

        smooth.push(Math.floor(low[i + 1]));
    }


    var outputArr = [];

    // Add it forward
    for (var i = 0; i < smooth.length; i++) {
        outputArr.push(smooth[i]);
    }
    // Add it backwards
    for (var i = smooth.length - 1; i > 0; i--) {
        outputArr.push(smooth[i]);
    }

    var rotatedArr = arrayRotate(outputArr, rotAngle);


    for (var i = 0; i < rotatedArr.length; i++) {
        var height = rotatedArr[i];
        $bars[i].css('height', height);
    }
}



// Initiate function
function init() {
    pickSong();
    // Connect audio to analyser and analyze audio
    console.log('init');
    var source = AUDIO.createMediaElementSource(aud);
    source.connect(analyser);
    analyser.connect(AUDIO.destination);

    // Setting cookie values in document ready so no issues arise on first site load
    n = Cookies.get('degCookies');
    radius = Cookies.get('radius');
    angle = Cookies.get('rotate');

    $bars = createBars((((bufferLength - snip) - 1) * 2) * n);
    circle();
    start(true);

    // Get rgb color of the first bar and set it
    var rgb = hexToRgb(colorNameToHex(Cookies.get('fc')));
    uploadBtnColorChange(rgb);

}

// Start the song is paused and vice versa
var reload, seek, end, gradient;

function start(x) {
    if (x) {
        aud.play();
        // Plays the song
        reload = setInterval(function () {
            update()
        }, 10);

        // Updates the seek bar
        seek = setInterval(function () {
            seekBar()
        }, 500);

        // Checks if the song has ended
        end = setInterval(function () {
            ended()
        }, 1000);

        // Checks the gradient color
        gradient = setInterval(function () {
            var f = $('#firstColor').val();
            var s = $('#secondColor').val();
            grade(f, s);
        }, 300);
    } else {
        aud.pause();
        clearInterval(reload);
        clearInterval(seek);
        clearInterval(end);
        clearInterval(gradient);
        reload = null;
        seek = null;
        end = null;
        gradient = null;
    }
}


// Rotate and properly position the bars into a circle with a set radius
function circle(x) {
    if (x != null || x != undefined) {
        radius = x;
    }

    var step = Math.PI * 2 / $bars.length;
    var angle = 0;

    for (var i = 0; i < $bars.length; i++) {
        var $elem = $bars[i];
        // Maths
        var x = Math.round(radius * Math.cos(angle));
        var y = Math.round(radius * Math.sin(angle));
        $elem.css('left', x + 'px');
        $elem.css('top', y + 'px');
        var rot = -90 + ((360 / $bars.length) * i);
        $elem.css('transform', 'rotate(' + rot + 'deg)');
        angle += step;
    }
}

// Toggle the music from playing to paused or vice versa
// It also toggles the state or class of the play button
function toggleState() {
    if (aud.paused) {
        start(true);
        $('#stateicon').removeClass('fa fa-play-circle-o');
        $('#stateicon').addClass('fa fa-pause-circle-o');
    } else {
        start(false);
        $('#stateicon').removeClass('fa fa-pause-circle-o');
        $('#stateicon').addClass('fa fa-play-circle-o');
    }
}

// Update the seekBar information such as time and position of the slider

function seekBar() {
    var bef = $('#bef');
    var aft = $('#aft');

    var beforeSec = Math.floor(aud.currentTime);
    var afterSec = Math.floor(aud.duration) - beforeSec;

    seekbar.slider("option", "value", beforeSec);
    bef.html(formatTime(beforeSec));
    aft.html("-" + formatTime(afterSec));

}

// Formats time
function formatTime(seconds) {
    minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    return minutes + ":" + seconds;
}

// Checks if the song has ended and if so it plays the next song
var shuffle = false;
var re = false;

function ended() {
    if (aud.ended) {
        // Shuffle and repeat items if a song has ended
        if (re && shuffle) {
            repeat();
            start(true);
        } else if (shuffle) {
            pickSong();
            start(true);
        } else if (re) {
            repeat();
            start(true);
        } else {
            nextSong();
            start(true);
        }
    }
}

// Get the current value 
function currentSong() {
    var src = aud.src;
    var index = -1;
    // Get the current index of the song playing
    for (var i = 0; i < srcList.length; i++) {
        if (src === srcList[i]) {
            index = i;
        }
    }

    return index;
}

// Get Current song Index
var curIndex = currentSong();
// Increment it by one if out of bounds set to 0
function nextSong() {
    if (curIndex + 1 == srcList.length) {
        curIndex = 0;
    } else {
        ++curIndex;
    }

    // If shuffle is on
    if (shuffle) {
        pickSong();
    } else {
        aud.src = srcList[curIndex];
    }

    getInfo();
    newSong();
}

// Play the previous song
function prevSong() {
    if (aud.currentTime > 5) {
        aud.currentTime = 0;
    } else {
        if (curIndex - 1 < 0) {
            curIndex = srcList.length - 1;
        } else {
            --curIndex;
        }

        // If shuffle is on
        if (shuffle) {
            pickSong();
        } else {
            aud.src = srcList[curIndex];
        }

        getInfo();
        newSong();
    }
}

// Pick a random song
function pickSong() {
    var rand = Math.floor(Math.random() * srcList.length);
    curIndex = rand;

    aud.src = srcList[curIndex];
    getInfo();
    newSong();
}

// Repeat a song
function repeat() {
    aud.src = srcList[curIndex];
    getInfo();
    newSong();
}

// Get information i.e Artist and title rn
function getInfo(index) {
    if (index == null) {
        var title = titleList[curIndex];
        var artist = artistList[curIndex];

        $('.title').html(title);
        $('.artist').html(artist);
    } else {
        var title = titleList[index];
        var artist = artistList[index];

        $('.title').html(title);
        $('.artist').html(artist);
    }
}
