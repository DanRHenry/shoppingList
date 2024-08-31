// https://developers.google.com/identity/sign-in/web/sign-getElementsByName("email")

// const serverURL = "http://127.0.0.1:3498";
const serverURL = "https://www.danhenrydev.com/api/shoppinglist";
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
//remove this later
loadPageContents();
function loadPageContents() {
  fetchShoppingList();
  populateRecipeList();
}

async function handleNewRecipeIngredientSubmit(e) {
  await e.preventDefault();

  const nameInput = document.getElementById("newRecipeNameInput").value;
  const ingredients = document.getElementsByClassName("ingredients");

  const ingredientValues = [];

  for (item of ingredients) {
    if (item.value.length > 0) {
      ingredientValues.push(item.value);
    }
  }

  await postNewRecipe(nameInput, ingredientValues);
  // setTimeout(() => {
  await populateRecipeList();
  // }, 100);
  nameInput.value = "";
  for (let item of ingredients) item.value = "";
  console.log("submitted");

  // repopulate the list from the back end, appending the form at the end
}

async function postNewIngredient(item, qty) {
  const URL = `${serverURL}/ingredient/storeIngredient`;

  if ((await checkForExistingIngredient(item)) === "Found!") {
    document.getElementById(
      "itemInput"
    ).value = `The list already has ${item}.`;
    setTimeout(() => {
      document.getElementById("itemInput").value = "";
    }, 3000);
    return;
  } else {
    try {
      const newIngredient = {
        ingredientName: item,
        qty: qty,
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
  await fetchShoppingList();
}

async function postNewRecipe(recipeName, ingredients) {
  console.log("recipeName:", recipeName);
  console.log("ingredients:", ingredients);
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
    return data.message;
  } catch (error) {
    // console.log(error);
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
    populateRecipeList(data);
    populateShoppingList(data.getAllIngredients);
    addShoppingListInput();
  } catch (error) {
    console.log(error);
  }
}

function populateShoppingList(items) {
  const shoppingListTableBody = document.getElementById(
    "shoppingListTableBody"
  );
  shoppingListTableBody.innerHTML = "";

  const headers = document.createElement("tr");
  headers.id = "headers";
  const checkboxHeader = document.createElement("th");
  checkboxHeader.id = "checkboxHeader";
  checkboxHeader.textContent = "Select All";
  checkboxHeader.addEventListener("click", handleSelectAllClick);
  headers.append(checkboxHeader);

  const ingredientHeader = document.createElement("th");
  ingredientHeader.id = "ingredientHeader";
  ingredientHeader.textContent = "Ingredient";
  headers.append(ingredientHeader);

  const qtyHeader = document.createElement("th");
  qtyHeader.id = "qtyHeader";
  qtyHeader.textContent = "Quantity";
  headers.append(qtyHeader);

  shoppingListTableBody.append(headers);

  const removeSelectedItemsRow = document.createElement("tr");
  const removeSelectedItems = document.createElement("td");
  removeSelectedItems.id = "removeSelectedItemsContainer";

  const removeSelectedItemsBtn = document.createElement("button");
  removeSelectedItemsBtn.addEventListener(
    "click",
    handleRemovingShoppingListItems
  );
  removeSelectedItemsBtn.id = "removeSelectedItems";
  removeSelectedItemsBtn.textContent = "Remove";
  removeSelectedItems.append(removeSelectedItemsBtn);
  removeSelectedItemsRow.append(removeSelectedItems);

  shoppingListTableBody.append(removeSelectedItemsRow);

  for (let ingredient of items) {
    // console.log(ingredient)

    const mainContent = document.createElement("tr");
    mainContent.className = "mainContent";

    const check = document.createElement("td");
    check.className = "check";
    mainContent.append(check);
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.className = "shoppingListCheckBoxes";
    check.append(checkBox);

    const item = document.createElement("td");
    item.className = "item";
    item.textContent = ingredient.ingredientName;
    mainContent.append(item);

    const itemQuantity = document.createElement("td");
    itemQuantity.className = "qty";
    const qtyInput = document.createElement("input");
    qtyInput.placeholder = "1";
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = 1;
    itemQuantity.append(qtyInput);
    mainContent.append(itemQuantity);

    shoppingListTableBody.append(mainContent);
  }

  const mainContent = document.createElement("tr");
  mainContent.className = "mainContent";

  // const check = document.createElement("td")
  // check.className = "check"
  // mainContent.append(check)

  // const addNewItemBtn = document.createElement("button")
  // addNewItemBtn.textContent = "Add"
  // addNewItemBtn.id = "addNewItem"
  // addNewItemBtn.addEventListener("click", handlePostNewItem)
  // check.append(addNewItemBtn)

  const itemInput = document.createElement("input");
  itemInput.type = "text";
  itemInput.required = true;
  mainContent.append(itemInput);

  const qtyInput = document.createElement("input");
  qtyInput.id = "qtyInput";
  qtyInput.type = "number";
  qtyInput.placeholder = "qty";
  mainContent.append(qtyInput);
}

function addShoppingListInput() {
  const shoppingListTableBody = document.getElementById(
    "shoppingListTableBody"
  );
  const mainContent = document.createElement("tr");
  mainContent.className = "mainContent";

  const check = document.createElement("td");
  check.className = "check";
  mainContent.append(check);

  const addNewItemBtn = document.createElement("button");
  addNewItemBtn.id = "addNewItem";
  addNewItemBtn.textContent = "Add";
  addNewItemBtn.addEventListener("click", handlePostNewItem);
  check.append(addNewItemBtn);

  const item = document.createElement("td");
  item.className = "item";
  const itemInput = document.createElement("input");
  itemInput.id = "itemInput";
  itemInput.type = "text";
  itemInput.required = "true";
  item.append(itemInput);
  mainContent.append(item);

  const qty = document.createElement("td");
  qty.className = "qty";
  const qtyInput = document.createElement("input");
  qtyInput.id = "qtyInput";
  qtyInput.type = "text";
  qtyInput.placeholder = "1";
  qtyInput.style = "text-align: center";
  qty.append(qtyInput);
  mainContent.append(qty);

  shoppingListTableBody.append(mainContent);
  /* 
              <!-- <tr class="mainContent">
              <td class="check">
                  <div></div>
                  <button id="addNewItem">Add</button>
                </td>
                <td class="item">
                  <input  id="itemInput" type="text" required>
                </td>
                <td class="qty">
                  <input id="qtyInput" type="text" placeholder="1" value=1 style="text-align: center;">
                </td>
            </tr>
  */
}

function handlePostNewItem() {
  const item = document.getElementById("itemInput").value;
  const qty = document.getElementById("qtyInput").value;
  if (item.length > 0) {
    postNewIngredient(item, qty);
  }
}

function handleSelectAllClick() {
  const shoppingListCheckBoxes = document.getElementsByClassName(
    "shoppingListCheckBoxes"
  );
  for (let i = 0; i < shoppingListCheckBoxes.length; i++) {
    shoppingListCheckBoxes[i].checked = true;
  }
}

async function handleRemovingShoppingListItems() {
  const shoppingListCheckBoxes = document.getElementsByClassName(
    "shoppingListCheckBoxes"
  );
  const item = document.getElementsByClassName("item");

  for (let i = 0; i < shoppingListCheckBoxes.length; i++) {
    if (shoppingListCheckBoxes[i].checked === true) {
      const URL = `${serverURL}/ingredient/delete/`;

      let delItem = {};
      delItem.ingredientName = item[i].textContent;
      try {
        const res = await fetch(URL, {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(delItem),
        });
        const data = await res.json();
        if (data.message === "The ingredient was successfully deleted!") {
          // console.log("the item was deleted")
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  fetchShoppingList();
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
    // console.log(data);
    return data.getAllRecipes;
  } catch (error) {
    console.log(error);
  }
}

async function populateRecipeList() {
  const recipes = await fetchRecipeList();

  //   console.log(recipes);
  const selections = document.getElementById("selections");
  selections.innerHTML = "";

  const addRecipeContainer = document.createElement("div");
  addRecipeContainer.id = "addRecipeContainer";

  const addRecipeBtn = document.createElement("button");
  addRecipeBtn.id = "addRecipe";
  addRecipeBtn.textContent = "New Recipe";
  selections.append(addRecipeContainer);
  addRecipeContainer.append(addRecipeBtn);
  addRecipeBtn.addEventListener("click", handleNewRecipeClick);

  async function handleNewRecipeClick() {
    if (document.getElementById("addRecipeIngredientsToShoppingListBtn")) {
      document.getElementById("addRecipeIngredientsToShoppingListBtn").remove()
    }
    const recipeTableBody = document.getElementById("recipeTableBody");

    // Recipe Table Headers
    const trHeaders = document.createElement("tr");
    trHeaders.id = "recipeHeaders";

    recipeTableBody.innerHTML = "";
    recipeTableBody.append(trHeaders);

    // New Recipe Item Input
    const mainContent = document.createElement("tr");
    mainContent.class = "mainContent";

    recipeTableBody.append(mainContent);

    const ingredient = document.createElement("td");

    mainContent.append(ingredient);

    const ingredientInputForm = document.createElement("div");
    ingredientInputForm.id = "ingredientInputForm";

    const newRecipeNameInput = document.createElement("input");
    newRecipeNameInput.type = "text";
    newRecipeNameInput.id = "newRecipeNameInput";
    newRecipeNameInput.placeholder = "Name";
    newRecipeNameInput.required = true;

    const ingredientInput = document.createElement("input");
    ingredientInput.type = "text";
    ingredientInput.className = "ingredients";
    ingredientInput.id = "newIngredients";
    ingredientInput.setAttribute("list", "ingredientOptions");
    ingredientInput.placeholder = "Ingredient";
    ingredientInput.required = true;

    if (document.getElementById("ingredientInputForm")) {
      document
        .getElementById("addRecipeIngredientsToShoppingListBtn")
        ?.remove();
    }

    function handleIngredientInputSubmit() {
      const ingredients = document.getElementsByClassName("ingredients");
      for (let ingredient of ingredients) {
        if (ingredient.value === "") {
          return;
        }
      }
      console.log("adding new line");
      const ingredientInput = document.createElement("input");
      ingredientInput.type = "text";
      ingredientInput.className = "ingredients";
      ingredientInput.setAttribute("list", "ingredientOptions");
      // ingredientInput.id = "ingredientInput";
      ingredientInput.required = true;
      ingredientInputForm.append(ingredientInput);
    }

    const ingredientDataList = document.createElement("datalist");
    ingredientDataList.id = "ingredientOptions";

    const ingredientOption = document.createElement("option");
    ingredientOption.value = "Lettuce"; //todo - populate this with the list of ingredients from all recipes

    const newIngredientFieldBtn = document.createElement("button");
    newIngredientFieldBtn.id = "newIngredientInputFieldBtn";
    newIngredientFieldBtn.addEventListener(
      "click",
      handleIngredientInputSubmit
    );
    newIngredientFieldBtn.textContent = "+";

    const newRecipeInputBtn = document.createElement("input");
    newRecipeInputBtn.type = "submit";
    newRecipeInputBtn.id = "newRecipeInputBtn";

    ingredientInputForm.append(
      newRecipeNameInput,
      ingredientInput,
      ingredientDataList
    );

    ingredientDataList.append(ingredientOption);

    const br = document.createElement("br");

    ingredient.append(
      ingredientInputForm,
      newIngredientFieldBtn,
      br,
      newRecipeInputBtn
    );

    document
      .getElementById("newRecipeInputBtn")
      .addEventListener("click", handleNewRecipeIngredientSubmit);
  }

  recipes.map((recipe) => {
    const entry = document.createElement("div");
    entry.className = "recipeName";
    entry.value = recipe.recipeName;
    entry.textContent = recipe.recipeName;
    entry.addEventListener("click", handleEntryClick);

    selections.append(entry);

    function handleEntryClick() {
      const recipeTableBody = document.getElementById("recipeTableBody");
      recipeTableBody.innerHTML = "";

      const recipeHeaders = document.createElement("tr");

      const checkboxHeader = document.createElement("th");
      checkboxHeader.textContent = "Select";

      const ingredientHeader = document.createElement("th");
      ingredientHeader.textContent = "Ingredient";

      //   recipeHeaders.append(checkboxHeader, ingredientHeader);

      recipeTableBody.append(recipeHeaders);
      // const recipeHeaders = document.getElementById("recipeHeaders")
      // recipeHeaders.innerHTML = ""

      recipe.ingredients.map((item) => {
        const mainContent = document.createElement("tr");
        mainContent.className = "mainContent";

        const check = document.createElement("td");
        check.className = "ingredientCheck";
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.checked = "true";
        check.append(checkBox);

        const ingredient = document.createElement("td");
        ingredient.className = "ingredient";
        ingredient.textContent = item;
        mainContent.append(check);
        mainContent.append(ingredient);
        recipeTableBody.append(mainContent);
      });

      const addRecipeIngredientsToShoppingListBtnContainer =
        document.createElement("div");
      addRecipeIngredientsToShoppingListBtnContainer.id =
        "addRecipeIngredientsToShoppingListBtnContainer";

      const addRecipeIngredientsToShoppingListBtn =
        document.createElement("button");
      addRecipeIngredientsToShoppingListBtn.id =
        "addRecipeIngredientsToShoppingListBtn";
      addRecipeIngredientsToShoppingListBtn.textContent =
        "Add to Shopping List";
      addRecipeIngredientsToShoppingListBtn.addEventListener(
        "click",
        handleAddRecipeIngredientsToShoppingList
      );

      if (document.getElementById("addRecipeIngredientsToShoppingListBtn")) {
        document
          .getElementById("addRecipeIngredientsToShoppingListBtn")
          .remove();
        document
          .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
          .remove();
      }
      document
        .getElementById("recipeItem")
        .append(addRecipeIngredientsToShoppingListBtnContainer);
      document
        .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
        .append(addRecipeIngredientsToShoppingListBtn);
    }
  });
}

async function handleAddRecipeIngredientsToShoppingList() {
  const ingredientCollection = document.getElementsByClassName("ingredient");
  const ingredientCheck = document.getElementsByClassName("ingredientCheck");

  for (let i = 0; i < ingredientCollection.length; i++) {
    if (ingredientCheck[i].children[0].checked === true) {
      // console.log(ingredientCollection[i].textContent)
      postNewIngredient(ingredientCollection[i].textContent, 0);
    }
  }
  // setTimeout(() => {
  await fetchShoppingList();
  // }, 500);
}

switchBtn?.addEventListener("click", toggleSignup);

loginForm?.addEventListener("submit", login);

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
