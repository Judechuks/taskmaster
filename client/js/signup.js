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

// Handle registration form submission
document
  .getElementById("register-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    // check if fields are empty space
    if (!firstName.trim() || !lastName.trim()) {
      displayAlertMessage("You have to enter your names", "danger");
    } else if (!password.trim()) {
      displayAlertMessage("password can not be empty spaces", "danger");
    } else if (password !== confirmPassword) {
      displayAlertMessage("Both passwords do not match", "danger");
    } else {
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      if (response.ok) {
        displayAlertMessage("Registration successful!", "success");
        window.location = "/login.html";
      } else {
        displayAlertMessage(
          `Registration failed! ${response.statusText}`,
          "danger"
        );
      }
    }
  });