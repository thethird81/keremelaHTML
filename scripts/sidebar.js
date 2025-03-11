"use strict";
if (!Object.values) {
    Object.values = function(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    };
}
var allSubcontents=[];
var grade = localStorage.getItem('grade');
var loggedInUserId = localStorage.getItem('loggedInUserId');
var sidebarContent = document.getElementById("sidebarContent");
var menuIcon = document.querySelector(".menu-icon");
var signinSignup = document.querySelector(".signin-signup");



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



// Fetch Data from Firestore or use cached data from localStorage
function fetchSubjects() {




    // Check if data exists in localStorage
    var cachedData = localStorage.getItem('sidebarData_Grade_'+ grade);
    if (cachedData) {
        console.log("Using cached sidebar data from localStorage" );
        var data = JSON.parse(cachedData);
        renderSubjects(data.subjects); // Render subjects using cached data
    } else {
        console.log("Fetching sidebar data from Firestore");
        // Fetch the document containing the subjects and their contents
        db.collection("sidebar_contents").doc("Sidebar_Grade_" + grade).get().then(function (doc) {
            if (doc.exists) {
                var data = doc.data();
                // Save data to localStorage for future use
                localStorage.setItem('sidebarData_Grade_' + grade, JSON.stringify(data));
                renderSubjects(data.subjects); // Render subjects using fetched data
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }
}

// Function to render subjects, contents, and subcontents
function renderSubjects(subjects) {


    sidebarContent.innerHTML = ""; // Clear existing content

    // Loop through each subject
    subjects.forEach(function (subject) {
        var subjectDiv = document.createElement("div");

        // Create Subject Collapsible Button
        var subjectButton = document.createElement("button");
        subjectButton.textContent = subject.subject;
        subjectButton.classList.add("collapsible");

        // Container for Contents
        var contentDiv = document.createElement("div");
        contentDiv.classList.add("content");

        // Loop through each content in the subject
        subject.contents.forEach(function (content) {
            var contentButton = document.createElement("button");
            contentButton.textContent = content.content;
            contentButton.classList.add("collapsible");

            // Container for Subcontents
            var subContentDiv = document.createElement("div");
            subContentDiv.classList.add("content");

            // Loop through each subcontent in the content
            content.subcontents.forEach(function (subcontent) {
                var subContentPara = document.createElement("div");
                subContentPara.classList.add("subunits");
                subContentPara.textContent = subcontent;

                // Add Click Listener to Show Details
                subContentPara.addEventListener("click", function () {
                    console.log("subcontent =>" + subcontent);
                    handleSubcontentClick(grade, subject.subject, content.content, subcontent);
                    var sidebar = document.querySelector(".sidebar");
                    sidebar.classList.toggle("visible");
                });

                subContentDiv.appendChild(subContentPara);
            });

            // Toggle Content Collapsible
            contentButton.addEventListener("click", function () {
                subContentDiv.style.display = subContentDiv.style.display === "block" ? "none" : "block";
            });

            contentDiv.appendChild(contentButton);
            contentDiv.appendChild(subContentDiv);
        });

        // Toggle Subject Collapsible
        subjectButton.addEventListener("click", function () {
            contentDiv.style.display = contentDiv.style.display === "block" ? "none" : "block";
        });

        subjectDiv.appendChild(subjectButton);
        subjectDiv.appendChild(contentDiv);
        sidebarContent.appendChild(subjectDiv);
    });

    displayFavouriteButton() ;
}



function displayFavouriteButton() {
 // Draw a line separator at the end of the content
 var separator = document.createElement("hr");
 separator.style.margin = "10px 0";
 sidebarContent.appendChild(separator);

 // Create "Favorite Videos" button
 var favoriteButton = document.createElement("button");
 favoriteButton.textContent = "Show Favorite Videos";
 favoriteButton.classList.add("favorite-videos-btn");
 favoriteButton.addEventListener("click", fetchFavoriteVideos);
 sidebarContent.appendChild(favoriteButton);

}
// Fetch favorite videos from Firestore using collectionGroup
function fetchFavoriteVideos() {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    localStorage.setItem("videoList", JSON.stringify(favorites));
    if (favorites.length === 0) {
        console.log("No favorite videos found.");
        updateVideoList([]); // Clear the list if no favorites exist
        return;
    }

    window.location.href = '/index.html';
}



// Fetch multiple videos from YouTube API (greater than 3 minutes)
function fetchYouTubeVideos(query, maxResults, callback) {
    var API_KEY = 'AIzaSyC4t0hI2mQx58U3u5hKS6TiTboPMzaienM';
   // var URL = "https://youtube.googleapis.com/youtube/v3/search?q=%22Construction%20and%20interpretation%20of%20graphs%22%20grade%2012&part=snippet&key=AIzaSyC4t0hI2mQx58U3u5hKS6TiTboPMzaienM&videoEmbeddable=true&maxResults=50&type=video";
   var URL = "https://youtube.googleapis.com/youtube/v3/search?q=" + encodeURIComponent(query) +
          "&part=snippet&key=" + API_KEY + "&videoEmbeddable=true&maxResults=" + maxResults +
          "&type=video&relevanceLanguage=en&order=relevance";
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

}


function displayTitle(subcontent) {
    var outputElement = document.getElementById("subcontent-title");
    if (outputElement) {
        outputElement.innerHTML = subcontent;
    } else {
        console.log("Element not found.");
    }
}
function getQuery(grade, subcontent) {
    var query = "";

    if (grade === 'Pre-KG') {
        query = grade  + " " + subcontent + " toddler educational songs";
    } else if (grade === 'KG') {
        query =subcontent + " for toddler";
    } else if (grade === '3') {

        query = subcontent ;
    } else {

        query = "grade " + grade  + " " + subcontent
    }

    return query;
}

function getLastWatchedVideos(){
    var lastWatchedPath = localStorage.getItem('lastWatchedPath');
    var lastWatchedPath = lastWatchedPath.split("_")[0] + "_" + lastWatchedPath.split("_")[3] ;

      // Reference to the subcontent document
      var subcontentRef = db.collection("subcontents")
      .doc( lastWatchedPath  );
    subcontentRef.get()
    .then(function (doc) {
        if (doc.exists && doc.data().videos) {
            // If videos are already available in the 'videos' field
            console.log("Fetching videos from subcontent document...");
            var videos = doc.data().videos;
            console.log("Fetched Videos:", videos);

            // Save the fetched videos to localStorage
            localStorage.setItem("videoList", JSON.stringify(videos));

            // Redirect to the main page if not already there
            if (window.location.pathname !== "/index.html") {
                window.location.href = "/index.html";
            }

            // Update the video list on the page
            updateVideoList(videos);
        }
        else{
            console.log("No last watched videos found");
        }
    }).catch(function (error) {
        console.error("Error fetching subcontent document:", error);
    });
}
function handleSubcontentClick(grade, subject, content, subcontent) {

    var lastWatchedPath = grade + "_" + subject + "_" + content + "_" + subcontent;
    localStorage.setItem("lastWatchedPath", lastWatchedPath);
    displayTitle(subcontent);

    var contentId = grade + "_" + subject + "_" + content;
    var contentRef = db.collection("contents").doc(contentId);

    contentRef.get().then(function (doc) {
        var subcontents = [];
        if (doc.exists) {
            var contentData = doc.data();
            subcontents = contentData.subcontents || [];

            var subcontentData = subcontents.find(function (item) {
                return item.subcontent === subcontent;
            });

            if (subcontentData && subcontentData.videos) {
                console.log("Fetching videos from Firestore...");
                localStorage.setItem("videoList", JSON.stringify(subcontentData.videos));
                window.location.href = "/index.html";
                updateVideoList(subcontentData.videos);
                return;
            }
        }

        console.log("No videos found, fetching from YouTube...");
        var query = getQuery(grade, subcontent);
        console.log("query: " +query);

        fetchYouTubeVideos(query, 50, function (youtubeVideos) {
            if (youtubeVideos.length > 0) {
                var videosData = youtubeVideos.map(function (video) {
                    return {
                        videoId: video.videoId,
                        title: video.title,
                        channelTitle: video.channelTitle,
                        publishedAt: video.publishedAt,
                        thumbnails: video.thumbnails,
                        grade: grade,
                        subject: subject,
                        content: content,
                        subcontent: subcontent
                    };
                });

                updateFirestore(contentRef, subcontent, videosData);
            } else {
                console.log("No suitable YouTube videos found.");
            }
        });
    }).catch(function (error) {
        console.error("Error fetching content document:", error);
    });
}

function updateFirestore(contentRef, subcontent, videosData) {
    console.log("Updating Firestore for:" + contentRef.id);

    var idParts = contentRef.id.split("_");
    if (idParts.length < 3) {
        console.error("Invalid document ID format:" + contentRef.id);
        return Promise.reject("Invalid document ID format: " + contentRef.id);
    }

    var grade = idParts[0] || "Unknown";
    var subject = idParts[1] || "Unknown";
    var content = idParts[2] || "Unknown";

    console.log("Parsed values - Grade:" + grade + ", Subject:" + subject + ", Content:" + content + ", Subcontent:" + subcontent);

    // Ensure subcontent and videosData are not undefined
    if (!subcontent) {
        console.error("subcontent is undefined! Assigning default value.");
        subcontent = "Unknown Subcontent";
    }

    videosData = Object.prototype.toString.call(videosData) === "[object Array]" ? videosData : [];

    return contentRef.get().then(function (doc) {
        var subcontents = [];

        if (doc.exists && doc.data().subcontents) {
            subcontents = doc.data().subcontents;
        }

        // Remove undefined values from videosData
        videosData = videosData.filter(function (video) {
            return video !== undefined && video !== null;
        });

        // Remove undefined fields dynamically
        function removeUndefinedFields(obj) {
            var cleanedObj = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
                    cleanedObj[key] = obj[key];
                }
            }
            return cleanedObj;
        }

        // Push cleaned data
        subcontents.push(removeUndefinedFields({
            subcontent: subcontent,
            videos: videosData
        }));

        // Prepare Firestore data
        var firestoreData = removeUndefinedFields({
            grade: grade,
            subject: subject,
            content: content,
            subcontents: subcontents
        });

        console.log("Saving to Firestore:", JSON.parse(JSON.stringify(firestoreData)));

        return contentRef.set(JSON.parse(JSON.stringify(firestoreData)), { merge: true })
            .then(function () {
                console.log("YouTube videos added to subcontents array in subcontent document.");

                // Save the fetched videos to localStorage
                localStorage.setItem("videoList", JSON.stringify(videosData));

                // Redirect to the main page if not already there
                if (window.location.pathname !== "/index.html") {
                    window.location.href = "/index.html";
                }

                // Update the video list on the page
                updateVideoList(videosData);
            })
            .catch(function (error) {
                console.error("Error updating subcontents array in Firestore:", error);
            });
    });
}


document.addEventListener("DOMContentLoaded", function() {

if(loggedInUserId){
    var isIndexPage = window.location.pathname.indexOf("index.html") !== -1 || window.location.pathname === "/";
    var isFirstLogin = localStorage.getItem("isFirstLogin"); // Check if the user has logged in before
    var lastWatchedPath = localStorage.getItem('lastWatchedPath');

    console.log("lastWatchedPath  " + lastWatchedPath);


    console.log("user logged in sidebar ");
    signinSignup.style.display = "none";
    sidebarContent.style.display = "block";
    fetchSubjects();
    fetchSubcontentsForGrade(grade);

      // Search functionality
      var searchBar = document.getElementById("searchBar");
      var searchResults = document.getElementById("searchResults");
      var resultsList = document.getElementById("resultsList");

      searchBar.addEventListener("input", function (event) {
        var searchQuery = event.target.value.toLowerCase(); // Get the search query

        if (searchQuery === "") {
          searchResults.style.display = "none"; // Hide results if search bar is empty
          return;
        }

        // Filter subcontents by name
        var filteredSubcontents = allSubcontents.filter(function (subcontent) {
          return subcontent.subcontent.toLowerCase().includes(searchQuery);
        });

        // Display the filtered results
        displaySearchResults(filteredSubcontents);
      });

      if (isIndexPage && isFirstLogin== "yes") {


        if ( lastWatchedPath != "" ){
            // var lastWatchedPathParts = lastWatchedPath.split("/");
            // handleSubcontentClick(lastWatchedPathParts[0], lastWatchedPathParts[1], lastWatchedPathParts[2], lastWatchedPathParts[3]);

            getLastWatchedVideos();
        }else{
             // Reference to the subcontent document
      var subcontentRef = db.collection("subcontents")
      .doc( "3_2D shapes and tessellation"  );
    subcontentRef.get()
    .then(function (doc) {
        if (doc.exists && doc.data().videos) {
            // If videos are already available in the 'videos' field
            console.log("Fetching videos from subcontent document...");
            var videos = doc.data().videos;
            console.log("Fetched Videos:", videos);

            // Save the fetched videos to localStorage
            localStorage.setItem("videoList", JSON.stringify(videos));

            // Redirect to the main page if not already there
            if (window.location.pathname !== "/index.html") {
                window.location.href = "/index.html";
            }

            // Update the video list on the page
            updateVideoList(videos);
        }
        else{
            console.log("No last watched videos found");
        }
    }).catch(function (error) {
        console.error("Error fetching subcontent document:", error);
    });
        }
        // Mark that the user has logged in before
        localStorage.setItem("isFirstLogin", "no");

    }

}else{
    sidebarContent.style.display = "none";
    console.log("no user logged in sidebar ");
    signinSignup.style.display = "block"
}
});
  // Toggle the sidebar visibility when the menu icon is clicked

  menuIcon.addEventListener("click", function() {

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


 // Display search results
 function displaySearchResults(subcontents) {
    // Clear previous results
    resultsList.innerHTML = "";

    if (subcontents.length === 0) {
      resultsList.innerHTML = "<li>No results found.</li>";
      searchResults.style.display = "block"; // Show results dropdown
      return;
    }

    // Render each subcontent
    subcontents.forEach(function (subcontent) {
      var listItem = document.createElement("li");
      listItem.textContent = subcontent.subcontent;

      // Store the full path in a data attribute
      listItem.setAttribute("data-path", subcontent.path);

      // Add click listener to handle subcontent selection
      listItem.addEventListener("click", function () {
        handleSubcontentSelection(subcontent);
      });

      resultsList.appendChild(listItem);
    });

    // Show results dropdown
    searchResults.style.display = "block";
  }

  // Handle subcontent selection
  function handleSubcontentSelection(subcontent) {
    console.log("Subcontent selected:", subcontent.grade);


    // Hide the search results dropdown
    searchResults.style.display = "none";

    // Clear the search bar
    searchBar.value = "";
handleSubcontentClick(subcontent.grade,subcontent.subject,subcontent.content,subcontent.subcontent);

  }
  //=========================== search ==============================
  function fetchSubcontentsForGrade(grade) {
    return db.collection("subcontents")
        .where("grade", "==", grade) // Filter by grade
        .get()
        .then(function (querySnapshot) {
            allSubcontents = querySnapshot.docs.map(function (doc) {
                // Create a new object and copy properties from doc.data()

                return Object.assign({}, doc.data());

            });
            console.log("Subcontents fetched:", allSubcontents);

        })
        .catch(function (error) {
            console.error("Error fetching subcontents:", error);
        });
}
// function getSizeOfObjects(objects,objectName) {
//     const jsonString = JSON.stringify(objects);
//     const blob = new Blob([jsonString]);
//     console.log(objectName);
//     console.log("Size in bytes:", blob.size);
//     console.log("Size in KB:", (blob.size / 1024).toFixed(2) + " KB");
//     console.log("Size in MB:", (blob.size / (1024 * 1024)).toFixed(2) + " MB");
// }