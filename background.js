function isChrome() {
    var isChromium = window.chrome,
        winNav = window.navigator,
        vendorName = winNav.vendor,
        isOpera = winNav.userAgent.indexOf("OPR") > -1,
        isIEedge = winNav.userAgent.indexOf("Edge") > -1,
        isIOSChrome = winNav.userAgent.match("CriOS");

    if (isIOSChrome) {
        return true;
    } else if (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
        return true;
    } else {
        return false;
    }
}

function updateTabStatus() {
    chrome.tabs.query({
        currentWindow: true
    }, function(tabs) {
        var urlArray = [];
        tabs.forEach(function(currentValue, i, array) {
            urlArray.push(tabs[i].url);
        });
        localforage.setItem('lastSession', urlArray)
            .then(function(value) {}).catch(function(err) {});
    });
}

var continousSave;

if (isChrome()) {
    localforage.getItem("lastSession", function(err, thoughtspaceArray) {
        for (var j = 0; j < thoughtspaceArray.length; j++) {
            chrome.tabs.create({
                url: thoughtspaceArray[j]
            });
        }
        chrome.tabs.query({
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.remove(tabs[0].id, function() {
                continousSave = setInterval(updateTabStatus, 2000);
            })
        });
    }).catch(function(err) {});
}