const apiUrl = "http://localhost:8080"; // Base URL of the API

// Hamburger
const hamburger = document.querySelector(".hamburger");
const sidebar = document.querySelector(".sidebar");

hamburger.addEventListener("click", function () {
  hamburger.classList.toggle("active");
  sidebar.classList.toggle("active");
});

// Getting Current Date
const tellDate = document.getElementById("tellDate");
const today = new Date();
const daysOfTheWeek = [
  { fullName: "Sunday", shortName: "Sun" },
  { fullName: "Monday", shortName: "Mon" },
  { fullName: "Tuesday", shortName: "Tue" },
  { fullName: "Wednesday", shortName: "Wed" },
  { fullName: "Thursday", shortName: "Thur" },
  { fullName: "Friday", shortName: "Fri" },
  { fullName: "Saturday", shortName: "Sat" },
];
const monthsOfTheYear = [
  { fullName: "January", shortName: "Jan" },
  { fullName: "February", shortName: "Feb" },
  { fullName: "March", shortName: "Mar" },
  { fullName: "April", shortName: "Apr" },
  { fullName: "May", shortName: "May" },
  { fullName: "June", shortName: "Jun" },
  { fullName: "July", shortName: "Jul" },
  { fullName: "August", shortName: "Aug" },
  { fullName: "September", shortName: "Sep" },
  { fullName: "October", shortName: "Oct" },
  { fullName: "November", shortName: "Nov" },
  { fullName: "December", shortName: "Dec" },
];
const currentDay = daysOfTheWeek[today.getDay()].fullName;
const currentMonth = monthsOfTheYear[today.getMonth()].fullName;
const currentDate = today.getDate();
// const currentYear = today.getFullYear();
tellDate.textContent = `${currentDay}, ${currentDate} ${currentMonth}`;

// alert message
const alertContainer = document.querySelector(".alert-container");
const alertText = document.querySelector(".alert-container .text");
function displayAlertMessage(msg, action) {
  alertText.textContent = msg;
  alertContainer.classList.add(`alert-${action}`);

  // remove alert message
  setTimeout(function () {
    alertContainer.classList.remove(`alert-${action}`);
  }, 2000);
}

const taskFormContainer = document.querySelector(".task-form-container");
const taskForm = document.getElementById("task-form");
const addTaskBtn = document.querySelector(".add-task-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const selectedItemContainer = document.querySelector(".selectedItem-container");
const selectedItemCloseBtn = document.querySelector(".close-btn");

// show add task form
addTaskBtn.addEventListener("click", () => {
  taskFormContainer.classList.add("active");
});

// close task form
cancelBtn.addEventListener("click", () => {
  taskFormContainer.classList.remove("active");
});

// close selected Item Container Modal
selectedItemCloseBtn.addEventListener("click", () => {
  selectedItemContainer.classList.remove("active");
});

// Truncating the title when too long
tdContents = document.querySelectorAll("table .content");
tdContents.forEach((content) => {
  if (content.textContent.trim().length > 80) {
    content.textContent = `${content.textContent.trim().slice(0, 80)}...`;
  }
  content.addEventListener("click", displayTaskDetails);
});

// displaying all details of a selected task
function displayTaskDetails(event) {
  selectedItemContainer.classList.add("active");
  getDetails(
    "This is the task title",
    "Possible long line of description.",
    "Medium",
    "Tuesday, 19 November"
  );
  // alert(event.currentTarget);
}

function getDetails(title, description, priority, deadline) {
  document.querySelector("#selectedItem-body .title").textContent = `${title}`;
  document.querySelector(
    "#selectedItem-body .description"
  ).textContent = `${description}`;
  document.querySelector(
    "#selectedItem-body .priority"
  ).textContent = `${priority}`;
  document.querySelector(
    "#selectedItem-body .deadline"
  ).textContent = `${deadline}`;
}

// Handle add new task submission
document
  .getElementById("task-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const taskTitle = document.getElementById("task-title").value;
    const taskDescription = document.getElementById("task-description").value;
    const taskPriority = document.getElementById("task-priority").value;
    const taskDeadline = document.getElementById("deadline").value;

    // check if fields are empty space
    if (!taskTitle.trim()) {
      displayAlertMessage("Title can't be empty", "danger");
    } else if (!taskPriority.trim() || !taskDeadline.trim()) {
      displayAlertMessage("Please choose task priority and deadline", "danger");
    } else {
      try {
        const response = await fetch(`${apiUrl}/add_task`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskTitle,
            taskDescription,
            taskPriority,
            taskDeadline,
          }),
        });

        if (response.ok) {
          displayAlertMessage("Task added successfully!", "success");
        } else {
          displayAlertMessage(
            `failed to add task ${response.statusText}`,
            "danger"
          );
        }
      } catch (error) {
        displayAlertMessage(`failed ${error}`, "danger");
      }
    }
  });
