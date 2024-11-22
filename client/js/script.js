const apiUrl = "http://localhost:8080"; // Base URL of the API

let currentPage = 1; // Current page for pagination
const tasksPerPage = 10; // Number of tasks per page

// Load user data and tasks when the page loads
async function loadUserData() {
  const token = localStorage.getItem("taskmasterToken");

  if (!token) {
    window.location.href = "login.html"; // Redirect to login if not authenticated
  }

  // Decode token to get user information (you can use a library like jwt-decode)
  const userPayload = JSON.parse(atob(token.split(".")[1]));

  if (userPayload.firstname && userPayload.lastname && userPayload.email) {
    document.querySelector(
      ".profile-detail .profile-name"
    ).innerText = `${userPayload.firstname} ${userPayload.lastname}`;
    document.querySelector(".profile-detail .profile-email").innerText =
      userPayload.email;
    document.querySelector("#user_firstname").innerText = userPayload.firstname;
  } else {
    displayAlertMessage("User information is not available.", "danger");
  }

  await loadTasks();
}

// Fetch and display tasks from the API
async function loadTasks() {
  const token = localStorage.getItem("taskmasterToken");

  try {
    const response = await fetch(
      `${apiUrl}/api/tasks?page=${currentPage}&limit=${tasksPerPage}`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { tasks, totalTasks, totalUncompleted, totalCompleted } =
      await response.json();

    displayTasks(tasks);
    updateTaskStats(totalUncompleted, totalCompleted);

    // Update pagination controls
    updatePaginationControls(totalTasks);
  } catch (error) {
    displayAlertMessage(`Error loading tasks: ${error}`, "danger");
    console.error("Error loading tasks:", error);
  }
}

// Display tasks in the task list
function displayTasks(tasks) {
  const taskList = document.getElementById("taskTable");
  taskList.innerHTML = ""; // Clear existing tasks

  tasks?.forEach((task) => {
    const tableRow = document.createElement("tr");
    tableRow.innerHTML = `<td>
  <div class="content">
    ${task.title}
  </div>
  <aside class="task-action-container">
    <button type="button" class="done-btn">
      <i class="far fa-square-check"></i>
    </button>
    <button type="button" class="edit-btn">
      <i class="fas fa-edit"></i>
    </button>
    <button type="button" class="delete-btn">
      <i class="fas fa-trash"></i>
    </button>
  </aside>
</td>`;
    // tableRow.innerText = `${task.title} - ${task.description} (Due: ${new Date(
    //   task.deadline
    // ).toLocaleDateString()})`;

    // Create Edit and Delete buttons
    const editButton = document.createElement("button");
    editButton.innerText = "Edit";
    editButton.onclick = () => editTask(task._id); // Call editTask function with task ID

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.onclick = () => deleteTask(task._id); // Call deleteTask function with task ID
    const doneButton = document.createElement("button");
    doneButton.innerText = "Mark as done";
    doneButton.onclick = () => markTaskAsDone(task._id); // Call markTaskAsDone with task ID

    // Create Mark as Pending button
    const pendingButton = document.createElement("button");
    pendingButton.innerText = "Mark as Pending";
    pendingButton.onclick = () => markTaskAsPending(task._id); // Call markTaskAsPending with task ID

    tableRow.appendChild(editButton);
    tableRow.appendChild(deleteButton);
    tableRow.appendChild(doneButton);
    tableRow.appendChild(pendingButton);

    taskList.appendChild(tableRow);
  });
}

// Update total uncompleted and completed tasks count
function updateTaskStats(uncompletedCount, completedCount) {
  document.getElementById("uncompletedCount").innerText = uncompletedCount;
  document.getElementById("completedCount").innerText = completedCount;
  document.getElementById("totalTask").innerText =
    uncompletedCount + completedCount;
}

// Update pagination controls based on current page
function updatePaginationControls(totalTasks) {
  document.getElementById("currentPage").innerText = currentPage;
  const totalPage = Math.ceil(totalTasks / tasksPerPage); // round up to a page if there is a remainder
  document.getElementById("totalPage").innerText = totalPage;
  // Hide or show pagination buttons based on task count
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  if (totalTasks === 0 || currentPage < 1) {
    prevPageBtn.style.display = "none";
    nextPageBtn.style.display = "none";
  } else {
    prevPageBtn.style.display = currentPage > 1 ? "block" : "none"; // Show/hide previous button
    nextPageBtn.style.display =
      currentPage * tasksPerPage < totalTasks ? "block" : "none"; // Show/hide next button
  }
}

// Handle add new task submission
document
  .getElementById("task-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const taskTitle = document.getElementById("task-title").value;
    const taskDescription = document.getElementById("task-description").value;
    const taskPriority = document.getElementById("task-priority").value;
    const taskDeadline = document.getElementById("task-deadline").value;

    // check if fields are empty space
    if (!taskTitle.trim()) {
      displayAlertMessage("Title can't be empty", "danger");
    } else if (!taskPriority.trim() || !taskDeadline.trim()) {
      displayAlertMessage("Please choose task priority and deadline", "danger");
    } else {
      try {
        const response = await fetch(`${apiUrl}/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: taskTitle,
            description: taskDescription,
            priority: taskPriority,
            deadline: taskDeadline,
          }),
        });

        if (response.ok) {
          await loadTasks(); // Reload tasks after adding a new one
          displayAlertMessage("Task added successfully!", "success");
        } else {
          const data = await response.json();
          displayAlertMessage(`failed to add task: ${data.error}`, "danger");
        }
      } catch (error) {
        console.error("Error adding task:", error);
        displayAlertMessage(`An error occurred. Please try again.`, "danger");
      }
    }
  });

// Search tasks by title or description
async function searchTasks() {
  const query = document.getElementById("searchBar").value.toLowerCase();

  // Fetch filtered tasks based on search query
  const token = localStorage.getItem("taskmasterToken");

  try {
    const response = await fetch(`${apiUrl}/api/tasks/search?query=${query}`, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    const { tasks } = await response.json();

    displayTasks(tasks); // Update displayed tasks based on search results
  } catch (error) {
    displayAlertMessage(`Error searching tasks`, "danger");
    console.error("Error searching tasks:", error);
  }
}

// filtering tasks by priority
async function filterTasks() {
  const priority = document.getElementById("filterPriority").value; // Get selected priority
  const status = document.querySelector('input[name="status"]:checked')?.value; // Get selected status (if using radio buttons)

  const token = localStorage.getItem("taskmasterToken");

  try {
    let url = `${apiUrl}/api/tasks?page=${currentPage}&limit=${tasksPerPage}`;

    if (priority) {
      url += `&priority=${priority}`; // Append priority filter if selected
    }

    if (status) {
      url += `&status=${status}`; // Append status filter if selected
    }

    const response = await fetch(url, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { tasks } = await response.json();
    displayTasks(tasks); // Update displayed tasks based on filter results
  } catch (error) {
    console.error("Error filtering tasks:", error);
    displayAlertMessage(
      "An error occurred while filtering tasks. Please try again.",
      "danger"
    );
  }
}

// mark task as done functionality
async function markTaskAsDone(taskId) {
  const token = localStorage.getItem("taskmasterToken");

  try {
    const response = await fetch(`${apiUrl}/api/tasks/${taskId}/complete`, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await loadTasks(); // Reload tasks after marking one as done
    displayAlertMessage("Task marked as done!", "success");
  } catch (error) {
    console.error("Error marking task as done:", error);
    displayAlertMessage(
      "An error occurred while marking the task as done.",
      "danger"
    );
  }
}

// unmark completed task as uncompleted
async function markTaskAsPending(taskId) {
  const token = localStorage.getItem("taskmasterToken");

  try {
    const response = await fetch(`${apiUrl}/api/tasks/${taskId}/pending`, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await loadTasks(); // Reload tasks after marking one as pending
    displayAlertMessage("Task marked as pending!", "success");
  } catch (error) {
    console.error("Error marking task as pending:", error);
    displayAlertMessage(
      "An error occurred while marking the task as pending.",
      "danger"
    );
  }
}

// Delete a task by ID
async function deleteTask(taskId) {
  const confirmDelete = confirm("Are you sure you want to delete this task?");

  if (!confirmDelete) return;

  const token = localStorage.getItem("taskmasterToken");

  try {
    const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      await loadTasks(); // Reload tasks after deletion
      displayAlertMessage("Task deleted successfully!", "success");
    } else {
      const data = await response.json();
      displayAlertMessage(`${data.error}`, "danger");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    displayAlertMessage("An error occurred while deleting the task.", "danger");
  }
}

// Edit a task by ID
async function editTask(taskId) {
  const newTitle = prompt("Enter new title:");
  const newDescription = prompt("Enter new description:");
  const newDeadline = prompt("Enter new deadline (YYYY-MM-DD):");
  const newPriority = prompt("Enter new priority (low, medium, high):");

  if (!newTitle || !newDescription || !newDeadline || !newPriority) {
    displayAlertMessage("All fields are required!", "danger");
    return;
  }

  const token = localStorage.getItem("taskmasterToken");

  try {
    const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        deadline: newDeadline,
        priority: newPriority,
      }),
    });

    if (response.ok) {
      await loadTasks(); // Reload tasks after editing one
      displayAlertMessage("Task updated successfully!", "success");
    } else {
      const data = await response.json();
      displayAlertMessage(`${data.error}`, "danger");
    }
  } catch (error) {
    console.error("Error updating task:", error);
    displayAlertMessage("An error occurred while updating the task.", "danger");
  }
}

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
  if (content.clientWidth < 312 && content.textContent.trim().length > 45) {
    content.textContent = `${content.textContent.trim().slice(0, 45)}...`;
  } else if (
    content.clientWidth > 530 &&
    content.textContent.trim().length > 130
  ) {
    content.textContent = `${content.textContent.trim().slice(0, 130)}...`;
  }
  // displaying details when task is clicked
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

const token = localStorage.getItem("taskmasterToken");
if (token) {
  // user is logged in fetch tasks
  loadTasks();
} else {
  // redirect to login page if no token is found
  window.location.href = "login.html";
}

// Pagination functions for next pages
function nextPage() {
  currentPage++;
  loadTasks(); // Reload tasks for the next page
}

// Pagination functions for previous pages
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    loadTasks(); // Reload tasks for the previous page
  }
}

// Logout functionality
function logout() {
  localStorage.removeItem("taskmasterToken"); // remove token on logout
  window.location.href = "login.html";
}
