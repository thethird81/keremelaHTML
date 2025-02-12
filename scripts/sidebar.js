"use strict";
if (!Object.values) {
    Object.values = function(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    };
}

// Initialize Firebase (replace with your own config)
var firebaseConfig = {
    apiKey: "AIzaSyD2snpMQF9j3aDJZji-nmcJ_W9wzjLLQLE",
    authDomain: "keremela-508aa.firebaseapp.com",
    databaseURL: "https://keremela-508aa-default-rtdb.firebaseio.com",
    projectId: "keremela-508aa",
    storageBucket: "keremela-508aa.firebasestorage.app",
    messagingSenderId: "555590069435",
    appId: "1:555590069435:web:1296b444545a84a73c8d9e"
  };
  firebase.initializeApp(firebaseConfig);

  var db = firebase.firestore();


// Fetch Data from Firestore
function fetchSubjects() {
   // var grade = "3-4"; // Example: Fetch subjects for Grade 3-4
   var grade = localStorage.getItem('grade');
    var sidebarContent = document.getElementById("sidebarContent");

    db.collection("grades").doc(grade).collection("subjects").get().then(function (subjectSnapshot) {
        subjectSnapshot.forEach(function (subjectDoc) {
            var subjectData = subjectDoc.data();
            var subjectDiv = document.createElement("div");

            // Create Subject Collapsible Button
            var subjectButton = document.createElement("button");
            subjectButton.textContent = subjectData.subject;
            subjectButton.classList.add("collapsible");

            // Container for Units
            var unitDiv = document.createElement("div");
            unitDiv.classList.add("content");

            // Fetch Units inside Subject
            db.collection("grades").doc(grade).collection("subjects").doc(subjectDoc.id).collection("contents").get().then(function (unitSnapshot) {
                unitSnapshot.forEach(function (unitDoc) {
                    var unitData = unitDoc.data();
                    var unitButton = document.createElement("button");
                    unitButton.textContent = unitData.unit;
                    unitButton.classList.add("collapsible");

                    // Container for Subunits
                    var subUnitDiv = document.createElement("div");
                    subUnitDiv.classList.add("content");

                    // Fetch Subunits inside Unit
                    db.collection("grades").doc(grade).collection("subjects").doc(subjectDoc.id).collection("contents").doc(unitDoc.id).collection("subcontents").get().then(function (subUnitSnapshot) {
                        subUnitSnapshot.forEach(function (subUnitDoc) {

                            var subUnitData = subUnitDoc.data();
                            var subUnitPara = document.createElement("div");
                            subUnitPara.classList.add("subunits");
                            subUnitPara.textContent = subUnitData.subcontent;
                            // Add Click Listener to Show Details
                            subUnitPara.addEventListener("click", function () {
                                handleSubcontentClick(grade, subjectData.subject, unitData.unit, subUnitData.subcontent);
                            });
                            subUnitDiv.appendChild(subUnitPara);
                        });
                    });

                    // Toggle Unit Collapsible
                    unitButton.addEventListener("click", function () {
                        subUnitDiv.style.display = subUnitDiv.style.display === "block" ? "none" : "block";
                    });

                    unitDiv.appendChild(unitButton);
                    unitDiv.appendChild(subUnitDiv);
                });
            });

            // Toggle Subject Collapsible
            subjectButton.addEventListener("click", function () {
                unitDiv.style.display = unitDiv.style.display === "block" ? "none" : "block";
            });

            subjectDiv.appendChild(subjectButton);
            subjectDiv.appendChild(unitDiv);
            sidebarContent.appendChild(subjectDiv);
        });
    });
}


// Fetch multiple videos from YouTube API (greater than 3 minutes)
function fetchYouTubeVideos(query, maxResults, callback) {
    var API_KEY = 'AIzaSyC4t0hI2mQx58U3u5hKS6TiTboPMzaienM';
    var URL = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + encodeURIComponent(query) +
              "&type=video&maxResults=" + maxResults + "&videoDuration=medium&key=" + API_KEY;

    fetch(URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var videos = [];
            if (data.items.length > 0) {
                data.items.forEach(function (item) {
                    videos.push({
                        videoId: item.id.videoId,
                        title: item.snippet.title,
                        channelTitle: item.snippet.channelTitle,
                        description: item.snippet.description,
                        publishedAt: item.snippet.publishedAt,
                        thumbnails: {
                            default: item.snippet.thumbnails.default.url,
                            medium: item.snippet.thumbnails.medium.url,
                            high: item.snippet.thumbnails.high.url
                        }
                    });
                });
            }
            callback(videos);
        })
        .catch(function (error) {
            console.error("Error fetching YouTube videos:", error);
            callback([]);
        });
}
function displayTitle(subcontentPath) {
    var outputElement = document.getElementById("output");
    if (outputElement) {
        outputElement.innerHTML = subcontentPath;
    } else {
        console.log("Element not found.");
    }
}
// Handle subcontent click event
function handleSubcontentClick(grade, subject, content, subcontent) {
    var subcontentPath = "grades/" + grade + "/subjects/" + subject + "/contents/" + content + "/subcontents/" + subcontent;
    var title =  subject + "/" + content + "/" + subcontent;
    console.log(subcontentPath);
    displayTitle(title);
    var videosRef = db.collection("grades")
        .doc(grade)
        .collection("subjects")
        .doc(subject)
        .collection("contents")
        .doc(content)
        .collection("subcontents")
        .doc(subcontent)
        .collection("videos");

    // Check if 'videos' collection has any documents
    videosRef.get()
        .then(function (querySnapshot) {
            if (!querySnapshot.empty) {
                console.log("Fetching videos from Firestore...");
                var videos = querySnapshot.docs.map(function (doc) {
                    return doc.data();
                });
                console.log("Fetched Videos:", videos);
                // Save the fetched videos to localStorage
                localStorage.setItem("videoList", JSON.stringify(videos));

               if (window.location.pathname !== "/index.html") {
                    window.location.href = "/index.html";
                    }
                updateVideoList(videos);
                var sidebar = document.querySelector(".sidebar");
                sidebar.classList.toggle("visible");
            } else {
                console.log("No videos collection found. Fetching from YouTube...");

                var query = "grade " + grade +  " " + subcontent ;
                fetchYouTubeVideos(query, 50, function (videos) {
                    if (videos.length > 0) {
                        videos.forEach(function (video) {
                            var videoData = {
                                videoId: video.videoId,
                                title: video.title,
                                channelTitle: video.channelTitle,
                                description: video.description,
                                publishedAt: video.publishedAt,
                                thumbnails: video.thumbnails,
                                path: subcontentPath,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            };

                            videosRef.add(videoData)
                                .then(function () {
                                    console.log("Video saved:", videoData);
                                })
                                .catch(function (error) {
                                    console.error("Error saving video:", error);
                                });
                        });
                        console.log("Fetched Videos:", videos);
                        // Save the fetched videos to localStorage
                        localStorage.setItem("videoList", JSON.stringify(videos));

                       if (window.location.pathname !== "/index.html") {
                            window.location.href = "/index.html";
                            }
                        updateVideoList(videos);
                        var sidebar = document.querySelector(".sidebar");
                         sidebar.classList.toggle("visible");
                    } else {
                        console.log("No suitable videos found.");
                    }
                });
            }
        })
        .catch(function (error) {
            console.error("Error checking videos collection:", error);
        });
}
  // Load sidebar content when the page loads
  document.addEventListener("DOMContentLoaded", function() {
    fetchSubjects();
  });

  // Toggle the sidebar visibility when the menu icon is clicked
  var menuIcon = document.querySelector(".menu-icon");
  menuIcon.addEventListener("click", function() {
    var sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("visible");
  });
