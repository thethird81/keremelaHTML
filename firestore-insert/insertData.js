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
  "subject": "Science",
  "grade":"3-4",
  "contents": [
    {
      "unit": "Living things",
      "subunits": [
        "Bones and skeletons",
        "Why we need a skeleton",
        "Skeletons and movement",
        "Different kinds of skeletons",
        "Medicines and infectious diseases"
      ]
    },
    {
      "unit": "Energy",
      "subunits": [
        "Energy around us",
        "Energy transfers",
        "Energy changes",
        "Energy and living things"
      ]
    },
    {
      "unit": "Materials",
      "subunits": [
        "Materials, substances and particles",
        "How do solids and liquids behave?",
        "Melting and solidifying",
        "Chemical reactions"
      ]
    },
    {
      "unit": "Earth and its habitats",
      "subunits": [
        "The structure of the Earth",
        "Volcanoes",
        "Earthquakes",
        "Different habitats"
      ]
    },
    {
      "unit": "Light",
      "subunits": [
        "How we see things",
        "Light travels in straight lines",
        "Light reflects off different surfaces",
        "Light in the solar system",
        "Day and night",
        "Investigating shadow lengths"
      ]
    },
    {
      "unit": "Electricity",
      "subunits": [
        "Which materials conduct electricity?",
        "Does water conduct electricity?",
        "Using conductors and insulators in electrical appliances",
        "Switches",
        "Changing the number of components in a circuit"
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
                    var subunitRef = unitRef.collection("subcontents").doc(subunit);
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
