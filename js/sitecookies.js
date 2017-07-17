function checkCookies() {
    // Visualizer bar color cookies
    var fc = Cookies.get('fc');
    var sc = Cookies.get('sc');
    
    // Check if the first color is undefined
    if (fc === undefined) {
        // If so set values to default
        Cookies.set('fc', 'red');
        fc = 'red';
    }
    
    // Check if the second color is undefined
    if (sc === undefined) {
        // If so set values to default
        Cookies.set('sc', 'black');
        sc = 'black';
    }
    
    // Set the values of the inputs
    $('#firstColor').val(fc);
    $('#secondColor').val(sc);
    
    // Finally add the gradient
    grade('' + fc + '', '' + sc + '');
    
    
    // Volume cookies
    var volCook = Cookies.get('vol');
    
    // Check if the value is undefined
    if(volCook === undefined) {
        // If so set volume to 100
        Cookies.set('vol', '1');
        volCook = 1;
    }
    
    // On load it sets the volume and changes the silder
    $(".vol").slider("option", "value", volCook * 100);
    aud.volume = volCook;
    
    
    // Background color cookies
    var bkgColor = Cookies.get('bkgColor');
    
    // Check if background color is undefined
    if(bkgColor === undefined) {
        // If so set the background color to black
        Cookies.set('bkgColor', 'black');
        bkgColor = "black";
    }
    
    // Set Background Color
    $('body').css("background-color", bkgColor);
    // Set color value in the input 
    $('#bkgColor').val(bkgColor);
    
    
    // Degree value Cookie
    var degCookie = Cookies.get('degCookies');
    // Check if the cookie  doesn't have value
    if(degCookie === undefined) {
        // Check if a mobile device is not being used
        if(!detectmob) {
            // Check is the browser is chrome
            var isChrome = !!window.chrome && !!window.chrome.webstore;
            if(isChrome) {
                // If true set to 3
                Cookies.set('degCookies', '3');
            } else {
                // If false set to 2
                Cookies.set('degCookies', '2');
            }
        } else {
            // If mobile device set to 1
            Cookies.set('degCookies', '1');
        }
    }
    
    // Set cookie value
    $(".degree").slider("value", degCookie);
    $(".degval").html("Current Value: " + degCookie);

    
    // Variability value cookie
    var variability = Cookies.get('variability');
    // Check if the cookie doesn't have a value
    if(variability === undefined) {
        // If so, set the default value
        Cookies.set('variability', '3');
        variability = 3;
    }
    
    // Set cookie value
    $(".variability").slider("value", variability);
    $(".variabilityval").html("Current Value: " + variability);
    
    
    // Setting variables for future updates
    var rotate = Cookies.get('rotate'); // Default 0
    var numBars = Cookies.get('numBars'); // Base Number of bars before degree || Maybe remove it
    var reflect = Cookies.get('reflect'); // T/F
    var radius = Cookies.get('radius'); // Browser def = 160px but add functions to adjust based on mobile and browser size
    
    var radiusChangeBass = Cookies.get('rBass'); // Default true
    var minSnip = Cookies.get('minSnip'); // Default 0
    var maxSnip = Cookies.get('maxSnip'); // Default 256 - 99
    
    
}

