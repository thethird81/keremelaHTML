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
document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the video list from localStorage
    const videoList = JSON.parse(localStorage.getItem('videoList'));

    if (videoList) {
        const rightSidebar = document.querySelector('.right-sidebar');
        rightSidebar.innerHTML = ''; // Clear existing sidebar content

        // Loop through the video list and add each video to the sidebar
        videoList.forEach(function (video) {
            const videoElement = document.createElement('div');
            videoElement.classList.add('side-video-list');

            // Select thumbnail resolution (prefer medium, fallback to default)
            const thumbnail = video.thumbnails && video.thumbnails.medium ? video.thumbnails.medium : video.thumbnails && video.thumbnails.default;

            // Create the HTML structure for each video
            videoElement.innerHTML = `
                <a href="play-video.html?videoId=${video.videoId}"  class="small-thumbnail">
                    <img src="${thumbnail.url}" alt="Thumbnail">
                </a>
                <div class="vid-info">
                    <a href="play-video.html?videoId=${video.videoId}" >${video.title}</a>
                    <p>${video.channelTitle}</p>
                    <p>${video.viewCount} Views</p>
                </div>
            `;

            // Append the video to the sidebar
            rightSidebar.appendChild(videoElement);
        });
    } else {
        console.log("No video list found in localStorage.");
    }
});
