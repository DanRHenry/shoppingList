// https://developers.google.com/identity/sign-in/web/sign-getElementsByName("email")

const serverURL = "http://127.0.0.1:3498";

const loginForm = document.getElementById("login-form");

const loginBtn = document.getElementById("login-Btn");

const switchBtn = document.getElementById("switchBtn");

const email = document.getElementById("email");
const password = document.getElementById("password");
const family = document.getElementById("family");

const loginWelcomeSection = document.getElementById("loginWelcomeSection");

checkForToken();

async function login(e) {
  e.preventDefault();

  let newLogin = {};

  newLogin.email = email.value;
  newLogin.family = family.value;
  newLogin.password = password.value;

  const URL = `${serverURL}/user/login`;

  try {
    const res = await fetch(URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newLogin),
    });
    const data = await res.json();
    if (data.message === "Login successful!") {
      sessionStorage.token = data.token;
      checkForToken();
    }
  } catch (error) {
    console.log(error);
  }
}


function loadPageContents() {
  fetchShoppingList ()
  function handleClick () {
    const itemInput = document.getElementById("itemInput");
    const costInput = document.getElementById("costInput")
    postNewIngredient(itemInput.value, costInput.value)
  }

  document.getElementById('addNewItem').addEventListener("click", handleClick)
}

async function postNewIngredient (item, cost) {
  const URL = `${serverURL}/ingredient/storeIngredient`;

  if (await checkForExistingIngredient(item) === "Found!") {
    return console.log("it's here")
  } else {
  try {
    const newIngredient = {
      ingredientName: item,
      cost: cost,
      recipe: ""
    }

    const res = fetch(URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newIngredient),
    });
  } catch (error) {
    console.log(error);
  }
}
}

async function checkForExistingIngredient (item) {
  const URL = `${serverURL}/ingredient/find`;

  const ingredientQuery = {
    ingredientName: item,
  }

  const reqOptions = {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(ingredientQuery)
  }

  try {
    const res = await fetch(URL, reqOptions
  );
  const data = await res.json();
    // console.log(data)
    return data.message
  } catch (error) {
    console.log(error);
  }
}


function checkForToken() {
  if (sessionStorage.token) {
    loginWelcomeSection.style.display = `none`;
    switchBtn.style.display = "none";
    loginBtn.style.display = "none";
    loadPageContents()
  } else {
    return;
  }
}


function displayLoginError() {
  switchBtn.textContent = "User Not Found";
  setTimeout(() => {
    switchBtn.textContent = "Login?";
  }, 1000);
}

async function signup(e) {
  e.preventDefault();
  if (family.value.length === 0) {
    console.log("No Family");
    return;
  }

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
  if (switchBtn.textContent === "Login?") {
    family.removeAttribute("required", true);
    family.style.visibility = "hidden";
    loginForm.removeEventListener("submit", login);
    loginForm.addEventListener("submit", signup);
    switchBtn.textContent = "Signup?";
    loginBtn.textContent = "Login";
  } else if (switchBtn.textContent === "Signup?") {
    family.style.visibility = "visible";
    family.setAttribute("required", true);
    loginForm.removeEventListener("submit", signup);
    loginForm.addEventListener("submit", login);
    switchBtn.textContent = "Login?";
    loginBtn.textContent = "Sign Up";
  }
}

async function fetchShoppingList () {

  const URL = `${serverURL}/ingredient`;

  try {
    const res = await fetch(URL, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify(newLogin),
    });
    const data = await res.json();
    console.log(data)
  } catch (error) {
    console.log(error);
  }
}

switchBtn.addEventListener("click", toggleSignup);

loginForm.addEventListener("submit", login);
