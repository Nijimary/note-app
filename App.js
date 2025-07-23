// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCrA18O3B-Kj_tbobnVNaU4J6k1ld1TmFM",
    authDomain: "todo-b9986.firebaseapp.com",
    projectId: "todo-b9986",
    storageBucket: "todo-b9986.firebasestorage.app",
    messagingSenderId: "494084497952",
    appId: "1:494084497952:web:844a5a3154bd96bea2d245"
};
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

let notesArray = [];
let editIndex = -1;
let docId = null;

$(document).ready(function () {

    $("#addBtn").click(function () {
        const title = $("#noteTitle").val().trim();
        const content = $("#noteContent").val().trim();

        if (title === "" || content === "") {
        alert("Please enter both title and content.");
        return;
        }

        const currentTime = new Date().toLocaleString();
        const noteObj = { title, content, time: currentTime };
        saveNotes(noteObj);
        loadNotes();

        $("#noteTitle").val("");
        $("#noteContent").val("");
    });

    $("#clearBtn").click(function () {
        $("#noteTitle").val("");
        $("#noteContent").val("");
        $("#addBtn").show();
        $("#updateBtn").hide();
        editIndex = -1;
    });

    $("#notesList").on("click", ".delete-btn", function () {
        const docid = $(this).data("docid");

        const confirmDelete = confirm("Are you sure you want to delete this note?");
        if (!confirmDelete) return;

        db.collection("todo_table").doc(docid).delete().then(() => {
            console.log("Document deleted!");
        }).catch((error) => {
            console.error("Error deleting document: ", error);
        });
        loadNotes();
    });

    $("#notesList").on("click", ".edit-btn", function () {
        editIndex = $(this).data("index");
        docid = $(this).data("docid");
        const note = notesArray[editIndex];
        $("#noteTitle").val(note.title);
        $("#noteContent").val(note.content);
        $("#addBtn").hide();
        $("#updateBtn").show();
    });

    $("#updateBtn").click(function () {
        const title = $("#noteTitle").val().trim();
        const content = $("#noteContent").val().trim();

        if (editIndex === -1 || title === "" || content === "") {
            alert("Invalid update.");
            return;
        }

        const updatedTime = new Date().toLocaleString();
        const editedNote = { title: title, content: content, time: updatedTime };
        updateNote(docid, editedNote);
        loadNotes();

        $("#noteTitle").val("");
        $("#noteContent").val("");
        $("#addBtn").show();
        $("#updateBtn").hide();
        editIndex = -1;
    });

    $("#searchBtn").click(function () {
        const query = $("#searchInput").val().toLowerCase().trim();
        notesArray = notesArray.filter(
        (note) =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );
        displayNotes();
    });

    loadNotes();
});

function loadNotes() {
    notesArray = []; // Clear previous notes to avoid duplicates
    db.collection("todo_table").get()
    .then((querySnapshot) => {
        if (querySnapshot.empty) {
            console.log("No notes found in Firestore.");
        }
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} =>`, doc.data());
            notesArray.push({content: doc.data().content, id: doc.id, time: doc.data().time, title: doc.data().title});
        });
        console.log(notesArray)
        displayNotes(); // Call after data is loaded
    })
    .catch((error) => {
        console.error("Error getting documents: ", error);
    });
}

function displayNotes() {
    $("#notesList").empty();

    if (notesArray.length === 0) {
        $("#notesList").append(
            '<li class="list-group-item text-muted text-center py-4">No matching notes found.</li>'
        );
        return;
    }

    notesArray.forEach((note, index) => {
    const noteItem = `
            <li class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 py-3 shadow-sm mb-3 note-item-custom">
                <div class="flex-grow-1 mb-2 mb-md-0">
                <strong class="fs-5">${note.title}</strong><br>
                <span class="d-block mt-1 mb-2">${note.content}</span>
                <small class="text-muted"><i class='bi bi-clock me-1'></i>${note.time}</small>
                </div>
                <div class="d-flex flex-row gap-2 align-items-center">
                <button class="btn btn-sm btn-warning edit-btn d-flex align-items-center gap-1" data-docid="${note.id}" data-index="${index}" title="Edit">
                  <i class="bi bi-pencil-square"></i>
                  <span class="d-none d-md-inline">Edit</span>
                </button>
                <button class="btn btn-sm btn-danger delete-btn d-flex align-items-center gap-1" data-docid="${note.id}" data-index="${index}" title="Delete">
                  <i class="bi bi-trash3"></i>
                  <span class="d-none d-md-inline">Delete</span>
                </button>
                </div>
            </li>
            `;
    $("#notesList").append(noteItem);
    });
}

function saveNotes(note) {
    db.collection("todo_table").add(note).then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    }).catch((error) => {
        console.error("Error adding document: ", error);
    });
}

function updateNote(docId, note) {
        db.collection("todo_table").doc(docId).update(note).then(() => {
        console.log("Document updated!");
    }).catch((error) => {
        console.error("Error updating document: ", error);
    });
}
