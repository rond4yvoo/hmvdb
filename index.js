import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import {
	getFirestore, collection, getDocs, addDoc, deleteDoc, setDoc,
	doc, query, where, orderBy, serverTimestamp, updateDoc, writeBatch, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyDHW8M8jMFzEw-hq-g77mOnvHrNiJBLlfs",
	authDomain: "hmvdb-60e36.firebaseapp.com",
	projectId: "hmvdb-60e36",
	storageBucket: "hmvdb-60e36.appspot.com",
	messagingSenderId: "929718759149",
	appId: "1:929718759149:web:1efbb26698c8614cb1a6e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colref = collection(db, 'hmvs');
const q = query(colref, orderBy('timestamp'))
var hmvdoclist = [];
var hmvlist = [];
var table = document.getElementById("results-table");
var currentID = "EFLC2QHQHIp36KqxsXI9";
var editedID = -1;
var editeddocID = "";

getDocs(colref).then((snapshot) => {
	snapshot.docs.forEach((doc) => {
		hmvdoclist.push({ ...doc.data(), id: doc.id });
	})
	
	var indexoffset = 0;
	var totaloffset = 0;
	hmvdoclist.forEach((hmvdoc, docindex) => {
		totaloffset = indexoffset;
		hmvdoc.mainArray.forEach((hmv, hmvindex) => {
			hmvlist.push(hmv);
			var row = table.getElementsByTagName('tbody')[0].insertRow();
			row.className += 'show-row-info';
			let sum = hmvindex + totaloffset;
			row.onclick = function() { viewOverlayOn(hmvdoc.id, sum) };
			row.id = hmvdoc.id + "-" + sum;
			indexoffset++;
			var tcell = row.insertCell();
			var ccell = row.insertCell();
			var hcell = row.insertCell();
			var scell = row.insertCell();
			var tagcell = row.insertCell();
			let title = document.createTextNode(hmv.title);
			let creators = document.createTextNode(hmv.creators);
			let hentai = document.createTextNode(hmv.hentai);
			let songs = document.createTextNode(hmv.songs);
			let tags = document.createTextNode(hmv.tags);
			tcell.appendChild(title);
			ccell.appendChild(creators);
			hcell.appendChild(hentai);
			scell.appendChild(songs);
			tagcell.appendChild(tags);
		})
	})
	$("#results-table").fancyTable({
		pagination: true,
		perPage: 50,
		inputStyle: `font-family: "Consolas", sans-serif;
			color: white;
			background-color: #110011;
			border-radius: 5px;
			border: 2px solid white;
			font-size: 16px;
			height: 34px;
			padding: 0px 8px 0px 8px;
			cursor: text;`,
		paginationClass: "search-button",
		paginationClassActive: "active-pagination",
		globalSearch:true,
		globalSearchExcludeColumns: getFilterArray()
	});
})

const addHMVForm = document.getElementById("add-form");
addHMVForm.addEventListener('submit', (e) => {
	e.preventDefault();
	addOverlayOff();
	
	let newHMV = {
		title: addHMVForm.title.value,
		creators: addHMVForm.creators.value, 
		hentai: addHMVForm.hentai.value,
		songs: addHMVForm.songs.value,
		link: addHMVForm.link.value,
		tags: addHMVForm.tags.value
	};
	
	let docref = doc(db, 'hmvs', currentID);
	updateDoc(docref, {
		mainArray: arrayUnion(newHMV)
	}).then(() => {
		addHMVForm.reset();
		popupOn("HMV added successfully. Reload to see changes.");
	}).catch(err => {
		popupOn("Error:" + err.message);
	})
})

function viewOverlayOn(hmvdocid, hmvindex) {
	if (hmvindex >= 0) {
		document.getElementById("view-title").innerHTML = hmvlist[hmvindex].title;
		document.getElementById("view-creators").innerHTML = hmvlist[hmvindex].creators;
		document.getElementById("view-hentai").innerHTML = hmvlist[hmvindex].hentai;
		document.getElementById("view-songs").innerHTML = hmvlist[hmvindex].songs;
		document.getElementById("view-link").innerHTML = hmvlist[hmvindex].link;
		document.getElementById("view-tags").innerHTML = hmvlist[hmvindex].tags;
		
		document.getElementById("edit-title").value = hmvlist[hmvindex].title;
		document.getElementById("edit-creators").value = hmvlist[hmvindex].creators;
		document.getElementById("edit-hentai").value = hmvlist[hmvindex].hentai;
		document.getElementById("edit-songs").value = hmvlist[hmvindex].songs;
		document.getElementById("edit-link").value = hmvlist[hmvindex].link;
		document.getElementById("edit-tags").value = hmvlist[hmvindex].tags;
		
		editeddocID = hmvdocid;
		editedID = hmvindex;
	}
	document.getElementById("view-overlay").style.display = "flex";
}

const editHMVForm = document.getElementById("edit-form");

const deletebtn = document.getElementById("delete-button");
deletebtn.addEventListener('click', (e) => {
	warningOn("Warning: This will delete the HMV from this database. Continue?", editeddocID, editedID);
})

const confirmdeletebtn = document.getElementById("confirm-delete-button");
confirmdeletebtn.addEventListener('click', (e) => {
	warningOff();
	editModeOff();
	viewOverlayOff();
	
	let docref = doc(db, 'hmvs', editeddocID);
	updateDoc(docref, {
		mainArray: arrayRemove(hmvlist[editedID])
	}).then(() => {
		editeddocID = "";
		editedID = -1;
		editHMVForm.reset();
		popupOn("HMV deleted successfully. Reload to see changes.");
	}).catch(err => {
		popupOn("Error:" + err.message);
	})
})

editHMVForm.addEventListener('submit', (e) => {
	e.preventDefault();
	editModeOff();
	viewOverlayOff();
	
	let newHMV = {
		title: document.getElementById("edit-title").value,
		creators: document.getElementById("edit-creators").value, 
		hentai: document.getElementById("edit-hentai").value,
		songs: document.getElementById("edit-songs").value,
		link: document.getElementById("edit-link").value,
		tags: document.getElementById("edit-tags").value
	}
	
	const docref = doc(db, 'hmvs', editeddocID);
	updateDoc(docref, {
		mainArray: arrayRemove(hmvlist[editedID])
	}).catch(err => {
		popupOn("Error:" + err.message);
	})
	
	updateDoc(docref, {
		mainArray: arrayUnion(newHMV)
	}).then(() => {
		editeddocID = "";
		editedID = -1;
		editHMVForm.reset();
		popupOn("HMV edited successfully. Reload to see changes.");
	}).catch(err => {
		popupOn("Error:" + err.message);
	})
})

function getFilterArray() {
	let filterArray = [];
	
	if (!document.getElementById("title-checkbox").checked) {
		filterArray.push(1);
	}
	if (!document.getElementById("creators-checkbox").checked) {
		filterArray.push(2);
	}
	if (!document.getElementById("hentai-checkbox").checked) {
		filterArray.push(3);
	}
	if (!document.getElementById("songs-checkbox").checked) {
		filterArray.push(4);
	}
	if (!document.getElementById("tags-checkbox").checked) {
		filterArray.push(5);
	}
	
	return filterArray;
}
