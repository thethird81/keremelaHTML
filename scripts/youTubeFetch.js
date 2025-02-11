"use strict";
// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyD2snpMQF9j3aDJZji-nmcJ_W9wzjLLQLE",
    authDomain: "keremela-508aa.firebaseapp.com",
    databaseURL: "https://keremela-508aa-default-rtdb.firebaseio.com",
    projectId: "keremela-508aa",
    storageBucket: "keremela-508aa.firebasestorage.app",
    messagingSenderId: "555590069435",
    appId: "1:555590069435:web:1296b444545a84a73c8d9e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// YouTube API key
var YOUTUBE_API_KEY = "AIzaSyC4t0hI2mQx58U3u5hKS6TiTboPMzaienM";

// Fetch YouTube videos using Fetch API
function fetchYouTubeVideos(searchQuery, callback) {
    var url = 'https://www.googleapis.com/youtube/v3/search?' +
              'q=' + encodeURIComponent(searchQuery) +
              '&part=snippet&type=video&maxResults=50&key=' + YOUTUBE_API_KEY;

    // Use Fetch API to get the data
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.items && data.items.length > 0) {
                // Pass all items to the callback
                callback(data.items);
            } else {
                callback(null);
            }
        })
        .catch(function(error) {
            console.error('Error fetching YouTube videos:', error);
            callback(null);
        });
}

// Save video to Firestore with all required attributes
function saveToFirestore(ageGroup, topic, video) {
    db.collection("youtubeVideos").add({
        ageGroup: ageGroup,
        topic: topic,
        videoId: video.id.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        thumbnails: video.snippet.thumbnails, // Use 'default', 'medium', or 'high' as needed
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Automatically set the timestamp
    }).then(function() {
        console.log("Video saved successfully for topic:", topic);
    }).catch(function(error) {
        console.error("Error saving video:", error);
    });
}

// Main logic
document.getElementById("fetchVideos").addEventListener("click", function () {
    var ageGroup = document.getElementById("ageGroup").value;
    var topics = sidebarListsByAge[ageGroup];
    if (!topics) {
        alert("No topics found for the selected age group.");
        return;
    }

    var statusDiv = document.getElementById("status");
    statusDiv.innerHTML = "Fetching videos...";

    topics.forEach(function (item) {
        if(item.topic != "All Videos")
        fetchYouTubeVideos(item.searchQuery, function (videos) {
            if (videos) {
                // Save each video in the list
                videos.forEach(function (video) {
                    saveToFirestore(ageGroup, item.topic, video);
                });
            } else {
                console.log("No video found for topic:", item.topic);
            }
        });
    });

    statusDiv.innerHTML = "Videos fetched and saved!";
});
