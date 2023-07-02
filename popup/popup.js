let font = new FontFace("GenshinFont", "url('fonts/zh-cn.ttf')");
document.fonts.add(font);

function updateRefreshTime(next_reset) {
    var rateLimitReset = new Date(next_reset * 1000);
    var resetTimeRemaining = new Date(rateLimitReset - Date.now());
    document.getElementById("refresh_display").innerText = resetTimeRemaining.toISOString().substring(11, 19);
}

document.getElementById("refresh_button").onclick = function() {
    chrome.tabs.create({ url: "https://twitter.com/i/verified-choose" });
};  

chrome.storage.local.get(["last_updated", "rate_limit", "rate_limit_remaining", "next_reset"], function(result) {
    document.getElementById("limit_remaining").innerHTML = result.rate_limit_remaining;
    document.getElementById("limit").innerHTML = result.rate_limit;

    var x = setInterval(function() {
        updateRefreshTime(result.next_reset);
    }, 1000);

});