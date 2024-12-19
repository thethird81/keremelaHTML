// Firebase config
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

var menuIcon = document.querySelector(".menu-icon");
var sidebar = document.querySelector(".sidebar");
var container = document.querySelector(".container");

menuIcon.onclick = function(){
    sidebar.classList.toggle("small-sidebar");
    container.classList.toggle("large-container");
}

// Sidebar topics
var sideBarList = [
    { icon: "fa-solid fa-calculator", topic: "Math" },
    { icon: "fa-solid fa-book", topic: "English" },
    { icon: "fa-solid fa-flask", topic: "Science" },
    { icon: "fa-solid fa-music", topic: "Music" },
    { icon: "fa-solid fa-laptop", topic: "Computer" },
    { icon: "fa-solid fa-palette", topic: "Art" },
    { icon: "fa-solid fa-scissors", topic: "Craft" },
    { icon: "fa-solid fa-book-open", topic: "Story" },
    { icon: "fa-solid fa-film", topic: "Movie" },
    { icon: "fa-solid fa-rocket", topic: "Space" },
    { icon: "fa-solid fa-globe", topic: "Social Science" },
    { icon: "fa-solid fa-microphone", topic: "Spoken English" },
    { icon: "fa-solid fa-code", topic: "Coding" },
    { icon: "fa-solid fa-flag", topic: "Ye Ethiopia Lijoch" }
];

// Render the sidebar dynamically
var shortcutLinks = document.querySelector(".shortcut-links");
sideBarList.forEach(function(item) {
    var link = document.createElement("a");
    link.innerHTML = "<i class='" + item.icon + "'></i><p>" + item.topic + "</p>";
    link.addEventListener("click", function() {
        fetchVideosFromFirebase(item.topic);
    });
    shortcutLinks.appendChild(link);
});
// Select a random topic and fetch videos on page load
window.onload = function () {
    var savedTopic = localStorage.getItem("selectedTopic");
    var selectedTopic;

    if (savedTopic) {
        // If a topic is saved in localStorage, use it
        selectedTopic = JSON.parse(savedTopic);
    } else {
        // Otherwise, select a random topic
        selectedTopic = getRandomTopic();
        localStorage.setItem("selectedTopic", JSON.stringify(selectedTopic));
    }

    fetchVideosFromFirebase(selectedTopic.topic);
    highlightSelectedTopic(selectedTopic.topic);
};

// Fetch videos from Firebase by topic
function fetchVideosFromFirebase(topic) {
    // Update the selected topic in localStorage
    var selectedTopic = sideBarList.find(function (item) {
        return item.topic === topic;
    });
    if (selectedTopic) {
        localStorage.setItem("selectedTopic", JSON.stringify(selectedTopic));
    }

    // Create a reference to the 'youtubeVideos' collection
    var videosRef = db.collection("youtubeVideos");

    // Create a query to filter by topic
    var q = videosRef.where("topic", "==", topic);

    // Get the documents that match the query
    q.get().then(function (querySnapshot) {
        if (!querySnapshot.empty) {
            var videos = querySnapshot.docs.map(function (doc) {
                return doc.data();
            });
            updateVideoList(videos);
        } else {
            console.log("No videos found for topic: " + topic);
        }
    }).catch(function (error) {
        console.error("Error fetching videos from Firebase:", error);
    });

    // Highlight the selected topic in the sidebar
    highlightSelectedTopic(topic);
}

// Highlight the selected topic
function highlightSelectedTopic(topic) {
    var sidebarLinks = document.querySelectorAll(".shortcut-links a");

    // Loop through all sidebar links
    Array.prototype.forEach.call(sidebarLinks, function (link) {
        var linkText = link.querySelector("p").textContent;

        if (linkText === topic) {
            link.style.color = "#ed3833"; // Highlight color
        } else {
            link.style.color = ""; // Reset color
        }
    });
}

// Select a random topic
function getRandomTopic() {
    var randomIndex = Math.floor(Math.random() * sideBarList.length);
    return sideBarList[randomIndex];
}

// Update video list
function updateVideoList(videos) {
    var listContainer = document.querySelector(".list-container");
    listContainer.innerHTML = ""; // Clear existing videos

    videos.forEach(function (video) {
        var videoElement = document.createElement("div");
        videoElement.classList.add("vid-list");

        // Select thumbnail resolution (prefer medium, fallback to default)
        var thumbnail = video.thumbnails && video.thumbnails.medium ? video.thumbnails.medium : video.thumbnails && video.thumbnails.default;

        videoElement.innerHTML = "<a href='html/play-video.html?videoId=" + video.videoId + "'>" +
            "<img src='" + thumbnail.url + "' alt='' class='thumbnail'>" +
            "</a>" +
            "<div class='flex-div'>" +
            "<img src='" + video.channelThumbnail + "' alt=''>" +
            "<div class='vid-info'>" +
            "<a href='https://www.youtube.com/watch?v=" + video.videoId + "' target='_blank'>" + video.title + "</a>" +
            "<p>" + video.channelTitle + "</p>" +
            "</div>" +
            "</div>";

        listContainer.appendChild(videoElement);
    });
}

// Add event listeners to sidebar links
sideBarList.forEach(function (item) {
    var link = document.querySelector(".shortcut-links a p:contains('" + item.topic + "')");
    if (link) {
        link.addEventListener("click", function () {
            fetchVideosFromFirebase(item.topic);
        });
    }
});

