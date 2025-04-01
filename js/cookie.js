function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/';
}

// For tracking consent
function hasTrackingConsent() {
    return getCookie('trackingConsent') === 'true';
}

function setTrackingConsent(consent) {
    setCookie('trackingConsent', consent, 365); // Store for a year
    // Removed page reload to prevent disrupting user experience
}

// Google Analytics initialization
function initializeTracking() {
    if (hasTrackingConsent()) {
        // Google Analytics example (replace with your tracking ID)
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        
        ga('create', 'UA-XXXXX-Y', 'auto'); // Replace with your tracking ID
        ga('send', 'pageview');
        
        console.log("Analytics tracking initialized");
    } else {
        console.log("User hasn't provided tracking consent");
    }
}

// When page loads, check cookie status and set up listeners
document.addEventListener('DOMContentLoaded', function() {
    // If consent hasn't been given, show the cookie banner
    if (getCookie('trackingConsent') === null) {
        document.getElementById('cookieBanner').style.display = 'block';
    } else {
        // Make sure the banner is hidden if consent was previously given
        document.getElementById('cookieBanner').style.display = 'none';
    }
    
    // Set up event listeners for accept/decline buttons
    const acceptButton = document.getElementById('acceptCookies');
    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            setTrackingConsent(true);
            document.getElementById('cookieBanner').style.display = 'none';
            // Initialize tracking immediately after consent
            initializeTracking();
        });
    }
    
    const declineButton = document.getElementById('declineCookies');
    if (declineButton) {
        declineButton.addEventListener('click', function() {
            setTrackingConsent(false);
            document.getElementById('cookieBanner').style.display = 'none';
        });
    }
    
    // Initialize tracking if consent was previously given
    initializeTracking();
});