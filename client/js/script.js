// Hamburger
const hamburger = document.querySelector(".hamburger");
const sidebar = document.querySelector(".sidebar");

hamburger.addEventListener("click", function () {
  hamburger.classList.toggle("active");
  sidebar.classList.toggle("active");
});

const taskFormContainer = document.querySelector(".task-form-container");
const taskForm = document.getElementById("task-form");
const addTaskBtn = document.querySelector(".add-task-btn");
const cancelBtn = document.querySelector(".cancel-btn");

// show add task form
addTaskBtn.addEventListener("click", () => {
  taskFormContainer.classList.add("active");
});

// close task form
cancelBtn.addEventListener("click", () => {
  taskFormContainer.classList.remove("active");
});
