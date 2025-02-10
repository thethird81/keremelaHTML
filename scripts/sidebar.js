// Firebase Configuration
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

// Sidebar Toggle
document.getElementById("menuBtn").addEventListener("click", function () {
    document.getElementById("sidebar").classList.add("open");
});

document.getElementById("closeBtn").addEventListener("click", function () {
    document.getElementById("sidebar").classList.remove("open");
});

// Fetch Data from Firestore
function fetchSubjects() {
    var grade = "3-4"; // Example: Fetch subjects for Grade 3-4
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
                            var subUnitPara = document.createElement("p");
                            subUnitPara.textContent = subUnitData.subcontent;
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

// Load Data
fetchSubjects();
