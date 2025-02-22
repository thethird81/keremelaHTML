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
    console.log("fetching subjects ....");

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

                                                var sidebar = document.querySelector(".sidebar");
                                                sidebar.classList.toggle("visible");

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
   // var URL = "https://youtube.googleapis.com/youtube/v3/search?q=%22Construction%20and%20interpretation%20of%20graphs%22%20grade%2012&part=snippet&key=AIzaSyC4t0hI2mQx58U3u5hKS6TiTboPMzaienM&videoEmbeddable=true&maxResults=50&type=video";
   var URL = "https://youtube.googleapis.com/youtube/v3/search?q=" + encodeURIComponent(query) +
          "&part=snippet&key=" + API_KEY + "&videoEmbeddable=true&maxResults=" + maxResults +
          "&type=video&relevanceLanguage=en&order=relevance&videoDuration=medium";
              console.log( encodeURIComponent(query) );

              var xhr = new XMLHttpRequest();
              xhr.open("GET", URL, true);
              xhr.onreadystatechange = function () {
                  if (xhr.readyState === 4) { // Request is complete
                      if (xhr.status === 200) { // Successful response
                          var data = JSON.parse(xhr.responseText);
                          var videos = [];
                          if (data.items && data.items.length > 0) {
                              data.items.forEach(function (item) {
                                  videos.push({
                                      videoId: item.id.videoId,
                                      title: item.snippet.title,
                                      channelTitle: item.snippet.channelTitle,
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
                      } else {
                          console.error("Error fetching YouTube videos:", xhr.statusText);
                          callback([]);
                      }
                  }
              };
              xhr.onerror = function () {
                  console.error("Request failed");
                  callback([]);
              };
              xhr.send();
    // fetch(URL)
    //     .then(function (response) {
    //         return response.json();
    //     })
    //     .then(function (data) {
    //         var videos = [];
    //         if (data.items.length > 0) {
    //             data.items.forEach(function (item) {
    //                 videos.push({
    //                     videoId: item.id.videoId,
    //                     title: item.snippet.title,
    //                     channelTitle: item.snippet.channelTitle,
    //                     publishedAt: item.snippet.publishedAt,
    //                     thumbnails: {
    //                         default: item.snippet.thumbnails.default.url,
    //                         medium: item.snippet.thumbnails.medium.url,
    //                         high: item.snippet.thumbnails.high.url
    //                     }
    //                 });
    //             });
    //         }
    //         callback(videos);
    //     })
    //     .catch(function (error) {
    //         console.error("Error fetching YouTube videos:", error);
    //         callback([]);
    //     });
}

function fetchYouTubeVideos1(URL, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", URL, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) { // Request is complete
            if (xhr.status === 200) { // Successful response
                var data = JSON.parse(xhr.responseText);
                var videos = [];
                if (data.items && data.items.length > 0) {
                    data.items.forEach(function (item) {
                        videos.push({
                            videoId: item.id.videoId,
                            title: item.snippet.title,
                            channelTitle: item.snippet.channelTitle,
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
            } else {
                console.error("Error fetching YouTube videos:", xhr.statusText);
                callback([]);
            }
        }
    };
    xhr.onerror = function () {
        console.error("Request failed");
        callback([]);
    };
    xhr.send();
}
function displayTitle(subcontentPath) {
    var outputElement = document.getElementById("output");
    if (outputElement) {
        outputElement.innerHTML = subcontentPath;
    } else {
        console.log("Element not found.");
    }
}
function getQuery(grade, subject, subcontent) {
    var query = "";

    if (grade === 'Pre-KG') {
        query = "grade " + grade + " " + subject + " " + subcontent + " toddler educational songs";
    } else if (grade === 'KG') {
        query = "grade " + grade + " " + subject + " " + subcontent + " toddler educational video, songs";
    } else if (grade === '3-4') {
        var splitGrade = grade.split('-');
        query = "grade " + splitGrade[0] + " " + subject + " " + subcontent + " for kids songs";
    } else {
        var splitGrade = grade.split('-');
        query = "grade " + splitGrade[0] + " " + subject + " " + subcontent
    }

    return query;
}
// Handle subcontent click event
function handleSubcontentClick(grade, subject, content, subcontent) {
    var subcontentPath = "grades/" + grade + "/subjects/" + subject + "/contents/" + content + "/subcontents/" + subcontent;
    var lastWatchedPath = grade + "/" + subject + "/" + content + "/" + subcontent;
    localStorage.setItem('lastWatchedPath',lastWatchedPath);
    var title =  subject
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
                // if(localStorage.getItem("isFirstLogin")=="no")
                //         {
                //             var sidebar = document.querySelector(".sidebar");
                //             sidebar.classList.toggle("visible");
                //         }

            } else {
                console.log("No videos collection found. Fetching from YouTube...");
                var query = getQuery(grade, subject, subcontent);
// if (grade == 'Pre-KG')
// {
//     query = "grade " + grade +  " " + subject +" " + subcontent + " todler educational songs   ";
// }else if(grade == 'KG'){
//     query = "grade " + grade + " " + subject + " " + subcontent + " todler educational video, songs  " ;
// }else if(grade == '3-4'){
//     query = "grade " + grade +  " " + subject +" " + subcontent + "  for kids songs " ;
// }else{
//     query = "grade 12 math Extreme values of functions";
// }

console.log("query " + query);
                fetchYouTubeVideos(query, 30, function (videos) {
                    if (videos.length > 0) {
                        videos.forEach(function (video) {
                            var videoData = {
                                videoId: video.videoId,
                                title: video.title,
                                channelTitle: video.channelTitle,
                                publishedAt: video.publishedAt,
                                thumbnails: video.thumbnails,
                                grade:grade,
                                subject:subject,
                                content:content,
                                subcontent:subcontent,
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

                        // if(localStorage.getItem("isFirstLogin")=="yes")
                        // {
                        //     var sidebar = document.querySelector(".sidebar");
                        //     sidebar.classList.toggle("visible");
                        // }

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


document.addEventListener("DOMContentLoaded", function() {
    var isIndexPage = window.location.pathname.indexOf("index.html") !== -1 || window.location.pathname === "/";
    var isFirstLogin = localStorage.getItem("isFirstLogin"); // Check if the user has logged in before
    var lastWatchedPath = localStorage.getItem('lastWatchedPath');
    var grade = localStorage.getItem("grade");
    var welcome = true;
    console.log("lastWatchedPath  " + lastWatchedPath);

    fetchSubjects();


    if (isIndexPage && isFirstLogin== "yes") {


        if ( lastWatchedPath != "" ){
            var lastWatchedPathParts = lastWatchedPath.split("/");
            handleSubcontentClick(lastWatchedPathParts[0], lastWatchedPathParts[1], lastWatchedPathParts[2], lastWatchedPathParts[3]);


        }else{
            //Bring videos from collection Group
            console.log("Bring videos from collection Group..." );
            var videosRef = db.collectionGroup("videos").where("grade", "==", grade).limit(100);

            videosRef.get().then((querySnapshot) => {
               var videos = querySnapshot.docs.map(function (doc) {
                   return doc.data();

               });

               localStorage.setItem("videoList", JSON.stringify(videos));
               updateVideoList(videos);
           }).catch((error) => {
               console.log("Error getting documents: ", error);
           });
        }
        // Mark that the user has logged in before
        localStorage.setItem("isFirstLogin", "no");

    }
});
  // Toggle the sidebar visibility when the menu icon is clicked
  var menuIcon = document.querySelector(".menu-icon");
  menuIcon.addEventListener("click", function() {
    var sidebarContent = document.getElementById("sidebarContent");
    if(sidebarContent){
        var sidebar = document.querySelector(".sidebar");
        sidebar.classList.toggle("visible");
    }
    else{
        fetchSubjects();
        var sidebar = document.querySelector(".sidebar");
        sidebar.classList.toggle("visible");
    }

  });
