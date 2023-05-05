// Get the room value from the URL

// Initialize Firebase
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// får refrens till "rooms" kollektion inne i datatabase
const db = getFirestore();
const roomsRef = collection(db, "rooms");

const roominput = document.getElementById("room");
const usernameinput = document.getElementById("username");
const joinBtn = document.getElementById("joinRoom");
const deleteBtn = document.getElementById("deleteRoom");
const selects = document.getElementById("select");

document.getElementById("createRoom").addEventListener("click", () => {
  const newOption = new Option(roominput.value);

  let roomExist = false;
  if (roominput.value !== "" && roominput.value !== " ") {
    selects.querySelectorAll("option").forEach((option) => {
      if (option.value === newOption.value) {
        roomExist = true;
        alert("room already exists");
      }
    });
  } else {
    alert("plase enter roomname");
    roomExist = true;
  }

  if (!roomExist) {
    addDoc(collection(db, "rooms"), {
      room: roominput.value,
    })
      .then((docRef) => {
        newOption.id = docRef.id; // set the value of the new option to the document ID
        console.log(newOption);
        selects.appendChild(newOption);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });

    roominput.value = "";
    usernameinput.value = "";
  }
  //hämtar de tigare options som har lagt in innan
  // const options = JSON.parse(localStorage.getItem("options") || "[]");
  //lägger in det nya
  // options.push(roominput.value);
  // localStorage.setItem("options", JSON.stringify(options));
});

//hömtar allt options från localstorge när sidan laddas om
// const options = JSON.parse(localStorage.getItem("options") || "[]");
// options.forEach((optvalue) => {
//   const option = new Option(optvalue);
//   option.value = optvalue;
//   //appendar den en gång till så att den är kvar i sidan när on reload.
//   selects.appendChild(option);
// });

getDocs(roomsRef).then((snapshot) => {
  snapshot.forEach((option) => {
    const newoption = new Option(option.data().room);
    newoption.value = option.data().room;
    newoption.id = option.id; // set the value of the new option to the document ID
    selects.appendChild(newoption);
  });
});

function roomToJoin() {
  if (selects.value === "Choose room") {
    alert("please select a room to joing");
    location.reload();
  } else {
    console.log("room selected");
    window.location.href = `video-chat.html?username=${usernameinput.value}&room=${selects.value}`;
  }
}
joinBtn.addEventListener("click", roomToJoin);

function removeRoom(e) {
  e.preventDefault();
  const selectedOption = selects.options[selects.selectedIndex];
  const selectedRoom = selectedOption.id;
  console.log(selectedRoom);

  const docRef = doc(db, "rooms", selectedRoom);

  deleteDoc(docRef)
    .then(() => {
      console.log("room delete");
      selectedOption.remove();
    })
    .catch((error) => {
      console.error("Error removing room:", error);
    });
}

deleteBtn.addEventListener("click", removeRoom);
