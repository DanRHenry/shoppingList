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
  fetchShoppingList();
  fetchRecipeList();

  function handleIngredientClick() {
    const itemInput = document.getElementById("itemInput");
    const costInput = document.getElementById("costInput");
    postNewIngredient(itemInput.value, costInput.value);
  }

  async function handleNewRecipeClick() {
    const recipeTableBody = document.getElementById("recipeTableBody");

    // Recipe Table Headers
    const trHeaders = document.createElement("tr");
    trHeaders.id = "recipeHeaders";
    // const checkHeading = document.createElement("th");
    // checkHeading.className = "check";
    // checkHeading.id = "checkboxHeader";
    // checkHeading.innerText = "Select";

    const newRecipeNameHeading = document.createElement("th");
    newRecipeNameHeading.className = "ingredient";
    newRecipeNameHeading.id = "newRecipeNameHeading";
    newRecipeNameHeading.innerText = "Recipe Name";

    const ingredientHeading = document.createElement("th");
    ingredientHeading.className = "ingredient";
    ingredientHeading.id = "itemHeader";
    ingredientHeading.innerText = "Ingredient";

    recipeTableBody.innerHTML = "";
    recipeTableBody.append(trHeaders);
    recipeTableBody.append(newRecipeNameHeading);
    // recipeTableBody.append(checkHeading);
    recipeTableBody.append(ingredientHeading);

    // New Recipe Item Input
    const mainContent = document.createElement("tr");
    mainContent.class = "mainContent";

    recipeTableBody.append(mainContent);

    // CheckBox and Item Entry Field
    // const check = document.createElement("td");
    // check.className = "check";
    // mainContent.append(check);

    // const checkInput = document.createElement("input");
    // checkInput.type = "checkbox";
    // checkInput.setAttribute("checked", true);

    // check.append(checkInput);

    const ingredient = document.createElement("td");

    mainContent.append(ingredient);

    const ingredientInputForm = document.createElement("div");
    ingredientInputForm.id = "ingredientInputForm";

    const newRecipeNameInput = document.createElement("input");
    newRecipeNameInput.type = "text";
    newRecipeNameInput.id = "newRecipeNameInput";
    newRecipeNameInput.placeholder = "Name"
    newRecipeNameInput.required = true;

    const ingredientInput = document.createElement("input");
    ingredientInput.type = "text";
    ingredientInput.className = "ingredients";
    ingredientInput.setAttribute("list", "ingredientOptions")
    // ingredientInput.id = "ingredientInput";
    ingredientInput.required = true;

    function handleIngredientInputSubmit() {
        console.log("adding new line")
        const ingredientInput = document.createElement("input");
        ingredientInput.type = "text";
        ingredientInput.className = "ingredients";
        ingredientInput.setAttribute("list", "ingredientOptions")
        // ingredientInput.id = "ingredientInput";
        ingredientInput.required = true;
        ingredientInputForm.append(ingredientInput)
    }


    const ingredientDataList = document.createElement("datalist")
    ingredientDataList.id = "ingredientOptions"

    const ingredientOption = document.createElement("option")
    ingredientOption.value = "Lettuce" //todo - populate this with the list of ingredients from all recipes

    const newIngredientFieldBtn = document.createElement("button")
    newIngredientFieldBtn.id = "newIngredientInputFieldBtn";
    newIngredientFieldBtn.addEventListener("click", handleIngredientInputSubmit)
    newIngredientFieldBtn.textContent = "+"


    const newRecipeInputBtn = document.createElement("input")
    newRecipeInputBtn.type = "submit"
    newRecipeInputBtn.id = "newRecipeInputBtn"

    ingredientInputForm.append(newRecipeNameInput, ingredientInput, ingredientDataList);

    ingredientDataList.append(ingredientOption)

    const br = document.createElement("br")

    ingredient.append(ingredientInputForm, newIngredientFieldBtn, br,newRecipeInputBtn);

    document
      .getElementById("newRecipeInputBtn")
      .addEventListener("click", handleNewRecipeIngredientSubmit);
  }

  document
    .getElementById("addNewItem")
    .addEventListener("click", handleIngredientClick);

  document
    .getElementById("addRecipe")
    .addEventListener("click", handleNewRecipeClick);
}

async function handleNewRecipeIngredientSubmit(e) {
  await e.preventDefault();

  const nameInput = document.getElementById("newRecipeNameInput").value;
  const ingredients = document.getElementsByClassName("ingredients");

  const ingredientValues = []

  for (item of ingredients) {
    ingredientValues.push(item.value)
  }

  postNewRecipe(nameInput, ingredientValues)

  nameInput.value = ""
  for (let item of ingredients) item.value = "";
  console.log("submitted");

  // push to the back end
  // repopulate the list from the back end, appending the form at the end
}

async function postNewIngredient(item, cost) {
  const URL = `${serverURL}/ingredient/storeIngredient`;

  if ((await checkForExistingIngredient(item)) === "Found!") {
    return console.log("it's here");
  } else {
    try {
      const newIngredient = {
        ingredientName: item,
        cost: cost,
        recipe: "",
      };

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

async function postNewRecipe(recipeName, ingredients) {
    console.log("recipeName:",recipeName)
    console.log("ingredients:",ingredients)
  const URL = `${serverURL}/recipe/storeRecipe`;

  if ((await checkForExistingRecipe(recipeName)) === "Found!") {
    return console.log("it's here");
  } else {
    try {
      const newRecipe = {
        recipeName: recipeName,
        ingredients: ingredients,
      };

      const res = fetch(URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecipe),
      });
    } catch (error) {
      console.log(error);
    }
  }
}

async function checkForExistingIngredient(item) {
  const URL = `${serverURL}/ingredient/find`;

  const ingredientQuery = {
    ingredientName: item,
  };

  const reqOptions = {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(ingredientQuery),
  };

  try {
    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    // console.log(data)
    return data.message;
  } catch (error) {
    console.log(error);
  }
}

async function checkForExistingRecipe(item) {
  const URL = `${serverURL}/recipe/find`;

  const ingredientQuery = {
    ingredientName: item,
  };

  const reqOptions = {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(ingredientQuery),
  };

  try {
    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    // console.log(data)
    return data.message;
  } catch (error) {
    console.log(error);
  }
}

function checkForToken() {
  if (sessionStorage.token) {
    loginWelcomeSection.style.display = `none`;
    switchBtn.style.display = "none";
    loginBtn.style.display = "none";
    loadPageContents();
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

async function fetchShoppingList() {
  const URL = `${serverURL}/ingredient`;

  try {
    const res = await fetch(URL, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

async function fetchRecipeList() {
  const URL = `${serverURL}/recipe`;

  try {
    const res = await fetch(URL, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

switchBtn.addEventListener("click", toggleSignup);

loginForm.addEventListener("submit", login);

/* 
<label for="ice-cream-choice">Choose a flavor:</label>
<input list="ice-cream-flavors" id="ice-cream-choice" name="ice-cream-choice" />

<datalist id="ice-cream-flavors">
  <option value="Chocolate"></option>
  <option value="Coconut"></option>
  <option value="Mint"></option>
  <option value="Strawberry"></option>
  <option value="Vanilla"></option>
</datalist>
*/
