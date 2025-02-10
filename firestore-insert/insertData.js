// Import Firebase Admin SDK
var admin = require("firebase-admin");

// Load Service Account Key
var serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Firestore Reference
var db = admin.firestore();

// Data to Insert
var data ={
    "subject": "Computing",
    "grade":"3-4",
    "contents": [
      {
        "unit": "Computational thinking and programming",
        "subunits": [
          "Repeating algorithms",
          "Indefinite loops",
          "Count-controlled loops",
          "Input and output",
          "Decomposition and sub-routines",
          "Creating good programming solutions",
          "Using input and output with a physical device"
        ]
      },
      {
        "unit": "Managing data",
        "subunits": [
          "Collecting data",
          "Storing data",
          "Using data"
        ]
      },
      {
        "unit": "Networks and digital communication",
        "subunits": [
          "Network structures",
          "Efficient networks",
          "Transferring data securely"
        ]
      },
      {
        "unit": "Computer systems",
        "subunits": [
          "Using computer systems",
          "Types of data",
          "Working with computer systems"
        ]
      }
    ]
  }

  ;

// Insert Data into Firestore
function insertData() {
    var gradeRef = db.collection("grades").doc(data.grade);
    var subjectRef = gradeRef.collection("subjects").doc(data.subject);

    // Insert Subject
    subjectRef.set({
        subject: data.subject
    }).then(function () {
        console.log("Subject added:", data.subject);

        // Insert Units
        data.contents.forEach(function (unit) {
            var unitRef = subjectRef.collection("contents").doc(unit.unit);
            unitRef.set({
                unit: unit.unit
            }).then(function () {
                console.log("Unit added:", unit.unit);

                // Insert Subunits
                unit.subunits.forEach(function (subunit) {
                    var subunitRef = unitRef.collection("subcontents").doc();
                    subunitRef.set({
                        subcontent: subunit
                    }).then(function () {
                        console.log("Subunit added:", subunit);
                    }).catch(function (error) {
                        console.error("Error adding subunit:", error);
                    });
                });
            }).catch(function (error) {
                console.error("Error adding unit:", error);
            });
        });
    }).catch(function (error) {
        console.error("Error adding subject:", error);
    });
}

// Run the function
insertData();
