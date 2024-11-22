const apiUrl = "http://localhost:8080"; // Base URL of the API

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

// Toggle hide and show password
const showPassword = document.querySelectorAll(".show-password");
showPassword.forEach((item) => {
  item.addEventListener("click", () => {
    const input = item.parentElement.nextElementSibling;
    const icon = item.firstElementChild;
    if (input.type === "password") {
      input.type = "text";
      icon.nextSibling.textContent = " Hide ";
    } else {
      input.type = "password";
      icon.nextSibling.textContent = " Show ";
    }
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
});

// Handle login form submission
document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // check if fields are empty space
    if (!password.trim()) {
      displayAlertMessage("password can not be empty spaces", "danger");
    } else {
      try {
        const response = await fetch(`${apiUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          // localStorage.setItem("token", data.token); // Store token in local storage
          displayAlertMessage("Login successful!", "success");
          window.location = "/dashboard.html";
          // loadTasks(); // Load tasks after successful login
        } else {
          displayAlertMessage(`Login failed! ${response.statusText}`, "danger");
        }
      } catch (error) {
        displayAlertMessage(`failed ${error}`, "danger");
      }
    }
  });
