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
}

// Hide the cookie banner
function hideCookieBanner() {
    // Try different possible selectors for the cookie banner
    const possibleBannerSelectors = [
        '#cookieBanner',
        '.cookie-banner',
        '.cookie-consent',
        '.cookie-notice',
        '[data-cookie-banner]',
        '.cookies-eu-banner',
        '#cookie-law-info-bar',
        '#cookie-notice'
    ];

    for (const selector of possibleBannerSelectors) {
        const banner = document.querySelector(selector);
        if (banner) {
            banner.style.display = 'none';
            console.log(`Cookie banner hidden: ${selector}`);
            return true;
        }
    }

    // If no selector matched, try to find it by common content
    const allElements = document.querySelectorAll('div, section, aside');
    for (const element of allElements) {
        if (element.textContent.toLowerCase().includes('cookie') && 
            (element.textContent.toLowerCase().includes('accept') || 
             element.textContent.toLowerCase().includes('consent'))) {
            element.style.display = 'none';
            console.log('Cookie banner hidden based on content');
            return true;
        }
    }
    
    console.warn('Could not find cookie banner to hide');
    return false;
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

// Set up the event handlers for cookie acceptance buttons
function setupCookieConsentHandlers() {
    // Try different possible selectors for accept buttons
    const acceptButtonSelectors = [
        '#acceptCookies',
        '.accept-cookies',
        '[data-action="accept-cookies"]',
        '.cookie-accept',
        '.accept-button',
        'button:contains("Accept")',
        'a:contains("Accept")'
    ];
    
    // Try different possible selectors for decline buttons
    const declineButtonSelectors = [
        '#declineCookies',
        '.decline-cookies',
        '[data-action="decline-cookies"]',
        '.cookie-decline',
        '.decline-button',
        'button:contains("Decline")',
        'a:contains("Decline")'
    ];
    
    // Helper function to find and add event listener to buttons
    function addListenerToButtons(selectors, consentValue) {
        for (const selector of selectors) {
            // Handle standard selectors
            const buttons = document.querySelectorAll(selector.replace(':contains', ''));
            if (buttons.length) {
                buttons.forEach(button => {
                    if (selector.includes(':contains')) {
                        // Check if text contains the keyword
                        const buttonText = button.textContent.toLowerCase();
                        const keyword = selector.match(/"([^"]+)"/)[1].toLowerCase();
                        if (!buttonText.includes(keyword)) return;
                    }
                    
                    // Remove existing listeners to prevent duplicates
                    const clonedButton = button.cloneNode(true);
                    button.parentNode.replaceChild(clonedButton, button);
                    
                    // Add the new listener
                    clonedButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        setTrackingConsent(consentValue);
                        hideCookieBanner();
                        if (consentValue) {
                            initializeTracking();
                        }
                        console.log(`Cookie consent ${consentValue ? 'accepted' : 'declined'}`);
                    });
                    
                    console.log(`Event listener added to ${consentValue ? 'accept' : 'decline'} button`);
                });
                return true;
            }
        }
        
        // If no selector matched, try to find buttons by text content
        const allButtons = document.querySelectorAll('button, a.button, input[type="button"], a');
        for (const button of allButtons) {
            const buttonText = button.textContent.toLowerCase();
            const isTargetButton = consentValue ? 
                (buttonText.includes('accept') || buttonText.includes('agree')) : 
                (buttonText.includes('decline') || buttonText.includes('reject'));
                
            if (isTargetButton && buttonText.includes('cookie')) {
                // Remove existing listeners
                const clonedButton = button.cloneNode(true);
                button.parentNode.replaceChild(clonedButton, button);
                
                // Add the new listener
                clonedButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    setTrackingConsent(consentValue);
                    hideCookieBanner();
                    if (consentValue) {
                        initializeTracking();
                    }
                    console.log(`Cookie consent ${consentValue ? 'accepted' : 'declined'} via text content button`);
                });
                return true;
            }
        }
        
        return false;
    }
    
    const acceptHandled = addListenerToButtons(acceptButtonSelectors, true);
    const declineHandled = addListenerToButtons(declineButtonSelectors, false);
    
    if (!acceptHandled && !declineHandled) {
        console.warn('Could not find cookie consent buttons');
    }
}

// When page loads, check cookie status and set up listeners
document.addEventListener('DOMContentLoaded', function() {
    // Only show banner if consent hasn't been given yet
    if (getCookie('trackingConsent') !== null) {
        hideCookieBanner();
    }
    
    // Set up event handlers for the consent buttons
    setupCookieConsentHandlers();
    
    // Initialize tracking if consent was given previously
    initializeTracking();
});

// For cases where the DOM might be modified after load
// (e.g., cookie banners injected by third-party scripts)
window.addEventListener('load', function() {
    setTimeout(function() {
        // If consent already given, make sure banner is hidden
        if (getCookie('trackingConsent') !== null) {
            hideCookieBanner();
        }
        
        // Refresh the event handlers
        setupCookieConsentHandlers();
    }, 1000); // Wait a second for any scripts to inject content
});