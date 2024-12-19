// Function to get URL parameters
function getURLParameter(name) {
    var url = window.location.href;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Get videoId from URL parameters
var videoId = getURLParameter('videoId');

// Set the video source dynamically based on the videoId
if (videoId) {
    var youtubePlayer = document.getElementById("youtube-player");
    youtubePlayer.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1"; // Use YouTube embed URL format
} else {
    console.error("No videoId found in URL.");
}
