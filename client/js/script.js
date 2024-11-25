// alert message
const alertContainer = document.querySelector(".alert-container");
const alertText = document.querySelector(".alert-container .text");
function displayAlertMessage(msg, action) {
  alertText.textContent = msg;
  alertContainer.classList.add(`alert-${action}`);

  // remove alert message
  setTimeout(function () {
    alertContainer.classList.remove(`alert-${action}`);
    alertText.textContent = "";
  }, 2000);
}
