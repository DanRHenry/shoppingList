// https://developers.google.com/identity/sign-in/web/sign-getElementsByName("email")

const serverURL = "http://127.0.0.1:3498";

const loginForm = document.getElementById("login-form");

const signupBtn = document.getElementById("signup")

async function login(e) {
  e.preventDefault();
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const family = document.getElementById("family");

  let newLogin = {};

  newLogin.email = email.value;
  newLogin.family = family.value;
  newLogin.password = password.value;

  const URL = `${serverURL}/user/login`;
  await fetch(URL, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newLogin),
  });
}

async function signup(e) {
    e.preventDefault()
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const family = document.getElementById("family");
  
    let newSignup = {};
  
    newSignup.email = email.value;
    newSignup.family = family.value;
    newSignup.password = password.value;
  
    const URL = `${serverURL}/user/signup`;
    await fetch(URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSignup),
    });
}

function toggleSignup() {
    if (signupBtn.textContent === "Login?") {
        loginForm.removeEventListener("submit", login)
        loginForm.addEventListener("submit", signup)
        signupBtn.textContent = "Signup?"
    }
    else if (signupBtn.textContent === "Signup?") {
        loginForm.removeEventListener("submit", signup)
        loginForm.addEventListener("submit", login)
        signupBtn.textContent = "Login?"
    }
}

signupBtn.addEventListener("click", toggleSignup)

loginForm.addEventListener("submit", login);

