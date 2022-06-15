// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import {
	getFirestore, collection, getDocs, addDoc, deleteDoc, 
	doc, query, where, orderBy, serverTimestamp, updateDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
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
var hmvlist = [];
var table = document.getElementById("results-table");
var currentID = "";

getDocs(colref).then((snapshot) => {
	snapshot.docs.forEach((doc) => {
		hmvlist.push({ ...doc.data(), id: doc.id });
	})
	hmvlist.forEach((hmv) => {
		var row = table.getElementsByTagName('tbody')[0].insertRow();
		row.setAttribute("id", hmv.id);
		row.className += 'show-row-info';
		row.onclick = function() { viewOverlayOn(hmv.id) };
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
	addDoc(colref, {
		title: addHMVForm.title.value,
		creators: addHMVForm.creators.value,
		hentai: addHMVForm.hentai.value,
		songs: addHMVForm.songs.value,
		link: addHMVForm.link.value,
		tags: addHMVForm.tags.value,
		timestamp: serverTimestamp()
	})
	.then(() => {
		addHMVForm.reset();
		popupOn("HMV added successfully.");
	})
})

function viewOverlayOn(id) {
	var foundindex = -1;
	for (var i=0; i < hmvlist.length; i++) {
		if (hmvlist[i].id === id) {
			foundindex = i;
		}
	}
	if (foundindex >= 0) {
		document.getElementById("view-title").innerHTML = hmvlist[foundindex].title;
		document.getElementById("view-creators").innerHTML = hmvlist[foundindex].creators;
		document.getElementById("view-hentai").innerHTML = hmvlist[foundindex].hentai;
		document.getElementById("view-songs").innerHTML = hmvlist[foundindex].songs;
		document.getElementById("view-link").innerHTML = hmvlist[foundindex].link;
		document.getElementById("view-tags").innerHTML = hmvlist[foundindex].tags;
		
		document.getElementById("edit-title").value = hmvlist[foundindex].title;
		document.getElementById("edit-creators").value = hmvlist[foundindex].creators;
		document.getElementById("edit-hentai").value = hmvlist[foundindex].hentai;
		document.getElementById("edit-songs").value = hmvlist[foundindex].songs;
		document.getElementById("edit-link").value = hmvlist[foundindex].link;
		document.getElementById("edit-tags").value = hmvlist[foundindex].tags;
		
		currentID = id;
	}
	document.getElementById("view-overlay").style.display = "flex";
}

const editHMVForm = document.getElementById("edit-form");

const deletebtn = document.getElementById("delete-button");
deletebtn.addEventListener('click', (e) => {
	if (currentID != "") {
		warningOn("Warning: This will delete the HMV from this database. Continue?", currentID);
	}
})

const confirmdeletebtn = document.getElementById("confirm-delete-button");
confirmdeletebtn.addEventListener('click', (e) => {
	warningOff();
	editModeOff();
	viewOverlayOff();
	
	const docref = doc(db, 'hmvs', currentID);
	deleteDoc(docref)
	.then(() => {
		currentID = "";
		editHMVForm.reset();
		popupOn("HMV deleted successfully.");
	})
})

editHMVForm.addEventListener('submit', (e) => {
	e.preventDefault();
	if (currentID != "") {
		editModeOff();
		viewOverlayOff();
		
		const docref = doc(db, 'hmvs', currentID);
		updateDoc(docref, {
			title: document.getElementById("edit-title").value,
			creators: document.getElementById("edit-creators").value, 
			hentai: document.getElementById("edit-hentai").value,
			songs: document.getElementById("edit-songs").value,
			link: document.getElementById("edit-link").value,
			tags: document.getElementById("edit-tags").value,
			timestamp: serverTimestamp()
		}).then(() => {
			currentID = "";
			editHMVForm.reset();
			popupOn("HMV edited successfully.");
		});
	}
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

var checkboxes = document.querySelectorAll("input[type=checkbox]")
checkboxes.forEach(function(checkbox) {
	checkbox.addEventListener('change', () => {
		let filters = Array.from(checkboxes)
			.filter(i => !i.checked)
			.map(i => i.name)
		
		let filterArray = [];
		if (filters.includes("title")) {
			filterArray.push(1);
		}
		if (filters.includes("creators")) {
			filterArray.push(2);
		}
		if (filters.includes("hentai")) {
			filterArray.push(3);
		}
		if (filters.includes("songs")) {
			filterArray.push(4);
		}
		if (filters.includes("tags")) {
			filterArray.push(5);
		}
	})
})