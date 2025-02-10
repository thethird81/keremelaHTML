// firebase-config.js
firebaseConfig = {
    apiKey: "AIzaSyD2snpMQF9j3aDJZji-nmcJ_W9wzjLLQLE",
    authDomain: "keremela-508aa.firebaseapp.com",
    databaseURL: "https://keremela-508aa-default-rtdb.firebaseio.com",
    projectId: "keremela-508aa",
    storageBucket: "keremela-508aa.firebasestorage.app",
    messagingSenderId: "555590069435",
    appId: "1:555590069435:web:1296b444545a84a73c8d9e"
};
var menuIcon = document.querySelector(".menu-icon");
var sidebar = document.querySelector(".sidebar");
var container = document.querySelector(".container");
var signOutButton = document.getElementById('signOut');
var age ;
var sideBarList =[];


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
 var auth = firebase.auth();
   // Listen for authentication state changes
auth.onAuthStateChanged(function(user) {
    var loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        console.log(user);
    } else {
        window.location.href = '/pages/login-register.html';
        console.log("User Id not found in local storage");
    }
});



menuIcon.onclick = function(){
    if (document.title === "KeremelaKIDS") {
        sidebar.classList.toggle("small-sidebar");
        container.classList.toggle("large-container");
    } else {
        //renderSidebar(age);
        sidebar.classList.toggle("small-sidebar");
    }

}

document.addEventListener('DOMContentLoaded', function () {
    var nickName = localStorage.getItem('nickName');
    var age = localStorage.getItem('age');
    var grade = localStorage.getItem('grade');

    if (!nickName || !age) {
        alert("User data is missing. Redirecting to login page.");
        //window.location.href = '/pages/login-register.html';
        return;
    }

    // Display nickName in the navbar
    document.getElementById('nickName').innerText = nickName;

    // Generate age-specific sidebar

    var savedTopic = localStorage.getItem("selectedTopic");
        var selectedTopic;

        if (savedTopic) {
            // If a topic is saved in localStorage, use it
            selectedTopic = JSON.parse(savedTopic);
        } else {
            // Otherwise, select a random topic
            selectedTopic = {topic:'All Videos'};
            localStorage.setItem("selectedTopic", JSON.stringify(selectedTopic));
        }

        fetchVideosFromFirebase(selectedTopic.topic);
        highlightSelectedTopic(selectedTopic.topic);
        renderSidebar(age);
        fetchQuestionFromFirebase(grade);

});
function fetchQuestionFromFirebase(grade) {
    var db = firebase.firestore();

    // Dynamically construct the path using the provided grade
    var questionsRef = db.collection('quiz').doc(grade).collection('questions');

    // Query the questions collection for the specified grade
    questionsRef.get()
      .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          console.log('No questions found for grade: ' + grade);
          return;
        }

        var questions = [];

        // Process each document in the snapshot
        querySnapshot.forEach(function(doc) {
          var questionData = doc.data();
          var question = {
            questionImage: questionData.questionImage || "",
            createdAt: questionData.createdAt || "",
            grade: questionData.grade,
            subject: questionData.subject,
            topic: questionData.topic,
            question: questionData.question,
            options: questionData.options.map(function(option) {
              return {
                text: option.text,
                optionImage: option.optionImage || ""
              };
            }),
            correctAnswer: questionData.correctAnswer || 0
          };
          questions.push(question);
        });

        // Save the questions to localStorage
        localStorage.setItem('questions', JSON.stringify(questions));
        console.log('Questions saved to localStorage for grade: ' + grade);
      })
      .catch(function(error) {
        console.log('Error getting documents: ', error);
      });
  }

// Function to get the correct sidebar list based on the user's age
function getSidebarListByAge(age) {
    if (age === "0-2") {
        return sidebarListsByAge["0-2"];
    } else if (age === "3-4") {
        return sidebarListsByAge["3-4"];
    } else if (age === "5-7") {
        return sidebarListsByAge["5-7"];
    } else if (age === "8-10") {
        return sidebarListsByAge["8-10"];
    } else if (age === "11+") {
        return sidebarListsByAge["11+"];
    } else {
        return []; // Default empty list for invalid age
    }
}
// Updated renderSidebar function
function renderSidebar(userAge) {
    var shortcutLinks = document.querySelector(".shortcut-links");
    shortcutLinks.innerHTML = ""; // Clear existing links

     sideBarList = getSidebarListByAge(userAge); // Get the appropriate list
    sideBarList.forEach(function(item) {
        var link = document.createElement("a");
        link.innerHTML = "<i class='" + item.icon + "'></i><p>" + item.topic + "</p>";
        link.addEventListener("click", function() {
            fetchVideosFromFirebase(item.topic);
        });
        shortcutLinks.appendChild(link);
    });
}
document.addEventListener('DOMContentLoaded', function () {
    var userIcon = document.getElementById('userIcon');
    var dropdownMenu = document.getElementById('dropdownMenu');

    userIcon.addEventListener('click', function () {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Close the dropdown when clicking outside
    document.addEventListener('click', function (event) {
        if (!userIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });
});
signOutButton.addEventListener('click', function() {
    localStorage.clear();
    auth.signOut()
        .then(function() {
            console.log('User signed out successfully');

            window.location.href = '/pages/login-register.html';
        })
        .catch(function(error) {
            console.error('Error signing out:', error);
        });
});
// Fetch videos from Firebase by topic
function fetchVideosFromFirebase(topic) {
    // Update the selected topic in localStorage
    var selectedTopic = sideBarList.find(function (item) {
        return item.topic === topic;
    });
    console.log("Selected Topic:", selectedTopic);
    if (selectedTopic) {
        localStorage.setItem("selectedTopic", JSON.stringify(selectedTopic));
    }

    var age = localStorage.getItem('age');

    console.log("Retrieved Age:", age);
    console.log("Age Type:", typeof age);

    // Create a reference to the 'youtubeVideos' collection
    var videosRef = db.collection("youtubeVideos");
    let q;

    if (age) {
        if (topic === 'All Videos') {
            q = videosRef.where("ageGroup", "==", age).limit(50);
            console.log("Query for All Videos with Age:", age);
        } else {
            q = videosRef.where("topic", "==", topic).where("ageGroup", "==", age);
            console.log("Query for Topic:", topic, "and Age:", age);
        }

        // Get the documents that match the query
        q.get().then(function (querySnapshot) {
            if (!querySnapshot.empty) {
                var videos = querySnapshot.docs.map(function (doc) {
                    return doc.data();
                });
                console.log("Fetched Videos:", videos);
                // Save the fetched videos to localStorage
                localStorage.setItem("videoList", JSON.stringify(videos));
                updateVideoList(videos);

            } else {
                console.log("No videos found for topic:", topic);
            }
        }).catch(function (error) {
            console.error("Error Fetching Videos:", error);
        });
    } else {
        console.log("Age is null or undefined");
    }

    // Highlight the selected topic in the sidebar
    console.log("Highlighting Topic:", topic);
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
        var thumbnail = video.thumbnails && video.thumbnails.high ? video.thumbnails.medium : video.thumbnails && video.thumbnails.default;

        // Correctly append `enablejsapi=1` to the URL
        videoElement.innerHTML = "<a href='pages/play-video.html?videoId=" + video.videoId + "&enablejsapi=1'>" +
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




