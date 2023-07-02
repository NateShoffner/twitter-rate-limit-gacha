console.clear = () => {}

var timelinePatterns = [
    "/graphql/[a-zA-Z0-9-_]+/HomeLatestTimeline$",    // latest tweets for the "Home" page
    "/graphql/[a-zA-Z0-9-_]+/HomeTimeline$"    // additional tweets for the "Home" page
  ];

(function() {

    const networkFilters = {
        urls: [
            "*://twitter.com/*"
        ]
    };

    chrome.webRequest.onHeadersReceived.addListener(function(details){
        var url = details.url;
        var match = false;
        for (var i = 0; i < timelinePatterns.length; i++) {
            var regex = new RegExp(timelinePatterns[i]);
            if (regex.test(url)) {
                match = true;
                break;
            }
        }
        
        if (!match)
            return;

        var headers = details.responseHeaders;

        var rateLimit = headers.find(function(header) {
            return header.name === "x-rate-limit-limit";
        });

        var rateLimitRemaining = headers.find(function(header) {        
            return header.name === "x-rate-limit-remaining";
        });

        var rateLimitReset = headers.find(function(header) {
            return header.name === "x-rate-limit-reset";
        });

        var rateLimitUsed = rateLimit.value - rateLimitRemaining.value;

        var rateLimitResetDate = new Date(rateLimitReset.value * 1000);
        var resetTimeRemaining = new Date(rateLimitResetDate - Date.now());

        console.log("URL: " + url);
        console.log("Rate limit: " + rateLimit.value);
        console.log("Rate limit remaining: " + rateLimitRemaining.value);
        console.log("Rate limit used: " + rateLimitUsed);
        console.log("Next Reset: " + rateLimitResetDate + " (" + resetTimeRemaining.toISOString().substring(11, 19) + ")");

        chrome.action.setBadgeText({text: rateLimitRemaining.value});
        //chrome.action.setBadgeBackgroundColor({color: "#1DA1F2"});
        chrome.action.setBadgeTextColor({color: "#FFFFFF"});
        var title = rateLimitRemaining.value + "/" + rateLimit.value;
        chrome.action.setTitle({title: title});

        chrome.storage.local.set({ 
            'rate_limit': rateLimit.value,
            'rate_limit_remaining': rateLimitRemaining.value,
            'next_reset': rateLimitReset.value,
        });

    }, networkFilters, ["responseHeaders"]);

}());
