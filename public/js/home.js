// Get the room value from the URL
const roominput = document.getElementById("room");
const usernameinput = document.getElementById("username");
const joinBtn = document.getElementById("joinRoom");
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
    alert("room added");
    newOption.value = roominput.value;
    console.log(newOption);
    // appendar den så att den går att se direkt i sidan när den adderas
    selects.appendChild(newOption);
    //hämtar de tigare options som har lagt in innan
    const options = JSON.parse(localStorage.getItem("options") || "[]");
    //lägger in det nya
    options.push(roominput.value);
    localStorage.setItem("options", JSON.stringify(options));

    roominput.value = "";
    usernameinput.value = "";
  }
});

//hömtar allt options från localstorge när sidan laddas om
const options = JSON.parse(localStorage.getItem("options") || "[]");
options.forEach((optvalue) => {
  const option = new Option(optvalue);
  option.value = optvalue;
  //appendar den en gång till så att den är kvar i sidan när on reload.
  selects.appendChild(option);
});

function roomToJoin() {


  if (selects.value === "Choose room") {
    alert("please select a room to joing");
    location.reload();
  } else {
    console.log("room selected");
    window.location.href =`video-chat.html?username=${usernameinput.value}&room=${selects.value}`
  }
}
joinBtn.addEventListener("click", roomToJoin);
