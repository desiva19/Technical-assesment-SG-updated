"use strict";

const account1 = { user: "Siva", email: "siva@dso.org.sg" };
const account2 = { user: "Deepa", email: "deepa@dso.org.sg" };
const account3 = { user: "Surya", email: "Surya@dso.org.sg" };

const accounts = [account1, account2, account3];
const btnLogin = document.getElementById("loginButton");
const btnSubmit = document.getElementById("submitButton");
const emailSection = document.getElementById("emailSection");
const otpSection = document.getElementById("otpSection");
const emailBodySection = document.getElementById("emailBodySection");
const alertSection = document.getElementById("alertSection");
const otpBlock = document.querySelector(".otp-timer");
const otpLabel = document.querySelector(".timer");
const emailBody = document.querySelector(".otpEmailBody");
const otpContainer = document.querySelector(".otp-container");
const alertBody = document.querySelector(".alert-body");
const alertHeader = document.querySelector(".alert-header");

let mainTimer;
let currentAccount;
let count = 10;

//Email Login button click
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  //Email Validation

  const email_address = document.getElementById("email").value;

  //Checking for maximum length of email address to be 20
  if (email_address.length > 20) {
    alertMessage(
      "EMAIL_LENGTH_TOO_LONG",
      "Email address contains too many characters"
    );
    return;
  }

  //Check for invalid domain
  const isValidEmail = CheckEmailDomain(email_address);
  !isValidEmail &&
    alertMessage("STATUS_EMAIL_INVALID", "Email address invalid");

  //Check for special characters
  const isSpecialCharacterExist = CheckSpecialCharacters(email_address);
  if (isSpecialCharacterExist) {
    alertMessage(
      "EMAIL_INVALID_SPECIALCHARACTER",
      "Email address contains special characters"
    );
    return;
  }

  //Check whether the email exists in our in-memory databse
  if (isValidEmail) {
    currentAccount = accounts.find((acc) => acc.email === email_address);
    if (currentAccount == null) {
      alertMessage("STATUS_EMAIL_FAIL", "Email address does not exist");
      return;
    }

    //Hide the alert section
    alertSection.classList.add("hidden");

    //Hide email section to display otp section
    emailSection.style.display = "none";

    //Remoce hidde from otp section
    otpSection.classList.remove("hidden");

    const otp = GenerateOtp();
    const userInfo = [currentAccount.email, otp];
    const email_body = `Your OTP Code is ${otp}`;

    Send_Email(email_address, email_body);

    //The following method stores user EmaiID and corresponding otp in local storage of the browser
    storeUserInfo(userInfo);

    if (mainTimer) clearInterval(mainTimer);
    mainTimer = startExpiryTimer();

    emailBodySection.classList.remove("hidden");
  }
});

function CheckEmailDomain(email) {
  const [username, domain] = email.split("@");

  if (domain === "dso.org.sg") {
    return true;
  } else {
    return false;
  }
}

function CheckSpecialCharacters(email) {
  var specialCharacters = /[!#$%^&*()+=\[\]\\';,/{}|":<>?\s]/;
  const [username, domain] = email.split("@");

  return specialCharacters.test(email);
}

function GenerateOtp() {
  const availableNum = "0123456789";
  let otpString = "";
  for (let i = 0; i < 6; i++) {
    const digit = Math.round(Math.random() * (availableNum.length - 1));
    otpString += availableNum[digit];
  }
  return otpString;
}

const Send_Email = function (email, body) {
  emailBody.textContent = body;
  alertMessage(
    "STATUS_EMAIL_OK:",
    "Email containing OTP has been sent successfully."
  );
};

const storeUserInfo = function (userInfo) {
  const userString = JSON.stringify(userInfo);

  // Store the records in local storage
  localStorage.setItem("LoginInfo", userString);

  //Set a timeout to remove the recordsafter 1 minute

  setTimeout(() => {
    localStorage.removeItem("LoginInfo");
    alert("OTP expired");
    location.reload();
  }, 60000);
};

const startExpiryTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    otpLabel.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer
    if (time === 0) {
      clearInterval(timer);
    }

    // Decrease 1s
    time--;
  };

  // Set time to 1 minute
  let time = 60;

  // Call the timer every second
  //tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//OTP submit button click
btnSubmit.addEventListener("click", function (e) {
  e.preventDefault();

  const otpValue = document.getElementById("otp").value;

  const [userEmail, userOtp] = JSON.parse(localStorage.getItem("LoginInfo"));

  count--;
  if (
    count >= 0 &&
    currentAccount.email === userEmail &&
    otpValue === userOtp
  ) {
    alert("Login Successfull");
    location.reload();
    return;
  } else if (count <= 0 && otpValue !== userOtp) {
    alert(`No retries Left`);
    location.reload();
  }

  alertMessage("Error", `Invalid Otp.Enter Again. Retries left: ${count}`);
});

const alertMessage = function (header, msg) {
  if (header.includes("OK")) {
    alertBody.style.color = "green";
  } else {
    alertBody.style.color = "red";
  }
  alertHeader.textContent = header;
  alertBody.textContent = msg;
  alertSection.classList.remove("hidden");
};
