// const serverURL = "http://127.0.0.1:3498/api/shoppinglist";
// const serverURL = "https://www.danhenrydev.com/api/shoppinglist";
// import { url } from "inspector";
import { serverURL } from "../helpers/serverURL.js";

/* 
Known bugs:
When the new recipe button is clicked, the fields load in badly
*/

// https://developers.google.com/identity/sign-in/web/sign-getElementsByName("email")
// https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
// https://github.com/john-doherty/swiped-events/blob/master/src/swiped-events.js

const loginForm = document.getElementById("login-form");

const loginBtn = document.getElementById("login-Btn");

const switchBtn = document.getElementById("switchBtn");

const email = document.getElementById("emailInput");
const password = document.getElementById("passwordInput");
const family = document.getElementById("familyInput");
let selectAllFlag = false

const loginWelcomeSection = document.getElementById("loginWelcomeSection");
let token;
sessionStorage.token ? (token = sessionStorage.token) : (token = "");

checkForToken();

function checkForToken() {
  if (sessionStorage.token) {
    document.getElementById("title_page").remove();
    createMenuPage();
    // loadPageContents();
  } else {
    return;
  }
}

function loadShoppingList() {
  selectAllFlag = false
  removeRecipeIngredients();
  document.getElementById("addRecipeIngredientsToShoppingListBtnContainer")?.remove()
  document.getElementById("newIngredientSection")?.remove()

  createShoppingListSection();
  fetchShoppingList();
}

function loadRecipesList() {
  removeRecipeIngredients();
  // createRecipeContent(); // adds headers
  createRecipesContainer();
  createRecipeWindow();
  fetchShoppingList();
}

function createMenuPage() {
  const menuPage = document.createElement("div");
  menuPage.id = "menuPage";

  const navbar = document.createElement("div");
  navbar.id = "navbar";
  menuPage.append(navbar);

  const shoppingMenuBtn = document.createElement("button");
  shoppingMenuBtn.textContent = "Shopping List";
  shoppingMenuBtn.addEventListener("click", loadShoppingList);

  const recipesMenuBtn = document.createElement("button");
  recipesMenuBtn.textContent = "Recipes";
  recipesMenuBtn.addEventListener("click", loadRecipesList);

  const calorieCountingMenuBtn = document.createElement("button");
  calorieCountingMenuBtn.textContent = "Calorie Counting";

  navbar.append(shoppingMenuBtn, recipesMenuBtn, calorieCountingMenuBtn);
  document.querySelector("body").append(menuPage);
}
async function login(e) {
  e.preventDefault();

  let newLogin = {};

  newLogin.email = email.value;
  newLogin.family = family.value;
  newLogin.password = password.value;

  let URL;
  if (
    (document.getElementById("loginRegisterToggleBtn").textContent = "Sign Up")
  ) {
    URL = `${serverURL}/user/login`;
  } else if (
    (document.getElementById("loginRegisterToggleBtn").textContent = "Log In")
  ) {
    URL = `${serverURL}/user/signup`;
  }

  console.log("url: ", URL);

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
      token = data.token;
      checkForToken();
    }
  } catch (error) {
    console.log(error);
  }
}

function removeExistingMenus() {
  document.getElementById("shoppingListContainer")?.remove();

  document.getElementById("recipesContainer")?.remove();

  document.getElementById("recipeWindow")?.remove();

  document.getElementById("recipeContent")?.remove();
}

function createShoppingListSection() {
  const shoppingListContainer = document.createElement("div");
  shoppingListContainer.id = "shoppingListContainer";
  const shoppingListTable = document.createElement("table");
  shoppingListTable.id = "shoppingListTable";
  const shoppingListTableBody = document.createElement("tbody");
  shoppingListTableBody.id = "shoppingListTableBody";

  shoppingListTable.append(shoppingListTableBody);

  shoppingListContainer.append(shoppingListTable);

  removeExistingMenus();

  return document.getElementById("navbar").after(shoppingListContainer);
}

function createRecipesContainer() {
  removeExistingMenus();
  const recipesContainer = document.createElement("div");
  recipesContainer.id = "recipesContainer";
  const recipesContainerHeaders = document.createElement("div");
  recipesContainerHeaders.className = "headers";
  recipesContainerHeaders.textContent = "Recipes";

  const recipesSelections = document.createElement("div");
  recipesSelections.id = "selections";

  recipesContainer.append(recipesContainerHeaders, recipesSelections);
  // removeExistingMenus()
  // return document.getElementsByTagName("body")[0].append(recipesContainer);
  // return (recipesContainer)
  return document.getElementById("navbar").after(recipesContainer);
}

function createRecipeContent() {
  const recipeContent = document.createElement("div");
  recipeContent.id = "recipeContent";

  const recipeContentHeaders = document.createElement("div");
  recipeContentHeaders.className = "headers";
  recipeContentHeaders.textContent = "Recipe Ingredients";

  const recipeItem = document.createElement("div");
  recipeItem.id = "recipeItem";

  const recipeTableBody = document.createElement("div");
  recipeTableBody.id = "recipeTableBody";

  recipeItem.append(recipeTableBody);

  recipeContent.append(recipeContentHeaders, recipeItem);

  // return document.getElementsByTagName("body")[0].append(recipeContent);
  // return(recipeContent)
  return document.getElementById("recipesContainer").after(recipeContent);
}

function createRecipeWindow() {
  const recipeWindow = document.createElement("div");
  recipeWindow.id = "recipeWindow";

  const recipeWindowContent = document.createElement("div");
  recipeWindowContent.id = "recipeWindowContent";

  const recipeText = document.createElement("div");
  recipeText.id = "recipeText";

  recipeWindowContent.append(recipeText);

  recipeWindow.append(recipeWindowContent);

  // return document.getElementsByTagName("body")[0].append(recipeWindow);
  // return(recipeWindow)
  return document.getElementById("navbar").after(recipeWindow);
}

document
  .getElementById("loginRegisterToggleBtn")
  ?.addEventListener("click", toggleLoginRegister);

function toggleLoginRegister() {
  const toggleLoginRegisterBtn = document.getElementById(
    "loginRegisterToggleBtn"
  );
  // console.log(toggleLoginRegisterBtn.textContent)
  if (toggleLoginRegisterBtn.textContent === "Sign Up") {
    toggleLoginRegisterBtn.textContent = "Log In";
    document.getElementById("familyInput").style.visibility = "visible";
    document.getElementById("familyInputLabel").style.visibility = "visible";
  } else {
    toggleLoginRegisterBtn.textContent = "Sign Up";
    document.getElementById("familyInput").style.visibility = "hidden";
    document.getElementById("familyInputLabel").style.visibility = "hidden";
  }
}

document.getElementById("loginSection")?.addEventListener("submit", login);

async function handleNewRecipeSubmit(e) {
  await e.preventDefault();

  const nameInput = document.getElementById("newRecipeNameInput").value;
  const timeInput = document.getElementById("recipeCookTimeInputField").value;
  const temperatureInput = document.getElementById(
    "recipeTempInputField"
  ).value;
  const recipeInstructionsInput = document.getElementById(
    "recipeInstructionsInputField"
  ).value;

  const numberOfServingsInput = document.getElementById(
    "numberOfServingsInputField"
  ).value;

  const newIngredients = document.getElementsByClassName("newIngredients");
  const newIngredientAmtInputs = document.getElementsByClassName(
    "newIngredientAmtInputs"
  );
  const measurementUnit = document.getElementsByClassName("measurementUnit");
  const newIngredientCalorieInputs = document.getElementsByClassName(
    "newIngredientCalorieInputs"
  );

  let newRecipe = {};

  newRecipe.recipeName = nameInput;
  newRecipe.time = timeInput;
  newRecipe.temperature = temperatureInput;
  newRecipe.ingredients = [];
  newRecipe.numberOfServings = numberOfServingsInput;

  newRecipe.instructions = [recipeInstructionsInput];

  for (let i = 1; i < newIngredients.length; i++) {
    const newIngredient = {};
    newIngredient.name = newIngredients[i].textContent;
    newIngredient.amount = newIngredientAmtInputs[i].textContent;
    newIngredient.measurementUnit = measurementUnit[i].textContent;
    newIngredient.newIngredientCalorieInput =
      newIngredientCalorieInputs[i].textContent;
    newRecipe.ingredients.push(newIngredient);
  }

  const recipeSteps = document.getElementsByClassName("recipeSteps");
  for (let i = 0; i < recipeSteps.length; i++) {
    if (recipeSteps[i].value.trim().length > 0) {
      newRecipe.instructions.push(recipeSteps[i].value);
    }
  }

  if ((await checkForExistingRecipe(nameInput)) === "Found!") {
    return;
  }
  await postNewRecipe(newRecipe);
  await populateRecipeList();
}

async function postNewIngredient(item, qty) {
  const URL = `${serverURL}/ingredient/storeIngredient`;

  if ((await checkForExistingIngredient(item)) === "Found!") 
    {
    return;
  } 
  else 
  {
    try {
      const newIngredient = {
        ingredientName: item,
        qty: qty,
        recipe: "",
      };

      const res = await fetch(URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(newIngredient),
      });
    } catch (error) {
      console.log(error);
    }
  }
  await fetchShoppingList();
}

async function postNewRecipe(newRecipeInformation) {
  const {
    ingredients,
    instructions,
    recipeName,
    temperature,
    time,
    numberOfServings,
  } = newRecipeInformation;

  console.log("newRecipeInformation: ", newRecipeInformation);
  const URL = `${serverURL}/recipe/storeRecipe`;

  if ((await checkForExistingRecipe(recipeName)) === "Found!") {
    return console.log("it's here");
  } else {
    try {
      const newRecipe = {
        recipeName: recipeName,
        time: time,
        temperature: temperature,
        ingredients: ingredients,
        instructions: instructions,
        numberOfServings: numberOfServings,
      };

      await fetch(URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(newRecipe),
      });
      console.log("recipe saved");
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
      Authorization: token
    }),
    body: JSON.stringify(ingredientQuery),
  };

  try {
    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    if (data.message === "Can't Find the Ingredient.") {
      return;
    }
    return data.message;
  } catch (error) {}
}

async function checkForExistingRecipeIngredient(item) {
  const URL = `${serverURL}/recipeingredient/find`;

  const ingredientQuery = {
    ingredientName: item,
  };

  const reqOptions = {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: token,
    }),
    body: JSON.stringify(ingredientQuery),
  };

  try {
    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    return data;
  } catch (error) {}
}

async function checkForExistingRecipe(item) {
  const URL = `${serverURL}/recipe/find`;

  const ingredientQuery = {
    recipeName: item,
  };

  const reqOptions = {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: token,
    }),
    body: JSON.stringify(ingredientQuery),
  };

  try {
    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    return data.message;
  } catch (error) {}
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
        Authorization: token,
      },
    });
    const data = await res.json();
    if (document.getElementById("recipesContainer")) {
      populateRecipeList(data);
    }

    if (document.getElementById("shoppingListContainer")) {
      populateShoppingList(data.getAllIngredients);
    }
    // console.log("adding input now...")
    if (!document.getElementById("shoppingListTableInputLine")) {
    addShoppingListInput();
  }
  } catch (error) {
    console.log(error);
  }
}

function populateShoppingList(items) {
  const shoppingListTableBody = document.getElementById(
    "shoppingListTableBody"
  );
  shoppingListTableBody.innerHTML = ""

  const shoppingListItems = document.getElementsByClassName("shoppingListItems")

  for (let i = shoppingListItems.length -1; i > 0; i --) {
    shoppingListItems[i]?.remove()
  }

  document.getElementById("headers")?.remove()
  // shoppingListTableBody.innerHTML = "";

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

  const shoppingListTitle = document.createElement("div")
  shoppingListTitle.textContent = "Shopping List"
  shoppingListTitle.id = "shoppingListTitle"

  shoppingListTableBody?.append(headers);

  if (!document.getElementById("shoppingListTitle")) {
    document.getElementById("shoppingListTable").before(shoppingListTitle)
  }
  for (let ingredient of items) {
    const shoppingListItems = document.createElement("tr");
    shoppingListItems.className = "shoppingListItems";

    const check = document.createElement("td");
    check.className = "check";
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.className = "shoppingListCheckBoxes";
    check.append(checkBox);

    const item = document.createElement("td");
    item.className = "item";
    item.textContent = ingredient.ingredientName;
    item.style.textDecoration = "none";

    checkBox.addEventListener("click", handleShoppingListCheckboxClick);

    function handleShoppingListCheckboxClick() {
      console.log("click");
      // console.log(item)
      // console.log(item.style.textDecoration)
      if (item.style.textDecoration === "line-through") {
        item.style.textDecoration = "none";
      } else if (item.style.textDecoration === "none") {
        item.style.textDecoration = "line-through";
      }
    }
    const itemQuantity = document.createElement("td");
    itemQuantity.className = "qty";
    itemQuantity.addEventListener("change", handleUpdatingItemQuantity);

    async function handleUpdatingItemQuantity() {
      const URL = `${serverURL}/ingredient/updateIngredient`;
    }

    const qtyInput = document.createElement("input");
    qtyInput.placeholder = "1";
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = 1;

    itemQuantity.append(qtyInput);

    shoppingListItems.append(check, item, itemQuantity);

    shoppingListTableBody?.append(shoppingListItems);
  }
}

function addShoppingListInput() {
  const shoppingListTableBody = document.getElementById(
    "shoppingListTableBody"
  );
  const shoppingListTableInputLine = document.createElement("tr");
  shoppingListTableInputLine.className = "shoppingListTableInputLine";

  const check = document.createElement("td");
  check.className = "check";

  const addNewItemBtn = document.createElement("button");
  addNewItemBtn.id = "addNewItem";
  addNewItemBtn.className = "button";
  addNewItemBtn.textContent = "+";
  addNewItemBtn.addEventListener("click", handlePostNewItem);

  const item = document.createElement("td");
  item.className = "item";
  const itemInput = document.createElement("input");
  itemInput.id = "itemInput";
  itemInput.type = "text";
  itemInput.required = "true";
  itemInput.placeholder = "Enter New Item";
  item.append(itemInput);

  itemInput.addEventListener("keypress", handlPostNewItemKeypress);
  function handlPostNewItemKeypress(e) {
    if (e.key === "Enter" || e.keyCode === "13" || e.keyCode === "9") {
      e.preventDefault();
      handlePostNewItem();
    }
  }

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

  shoppingListTableInputLine.append(removeSelectedItems, item, addNewItemBtn);

  if (shoppingListTableBody) {
    shoppingListTableBody.append(shoppingListTableInputLine);
  }
}

function handlePostNewItem() {
  const item = document.getElementById("itemInput").value;
  const qty = 1;
  // console.log(item)
  // console.log(item.length)
  if (item.length > 0) {
    postNewIngredient(item, qty);
  }
}

function handleSelectAllClick() {
  selectAllFlag = !selectAllFlag
  const shoppingListCheckBoxes = document.getElementsByClassName(
    "shoppingListCheckBoxes"
  );
  for (let i = 0; i < shoppingListCheckBoxes.length; i++) {
    shoppingListCheckBoxes[i].checked = selectAllFlag;
    if (selectAllFlag === false) {
      document.getElementsByClassName("item")[i].style.textDecoration = "none"
    } else {
      document.getElementsByClassName("item")[i].style.textDecoration = "line-through"
    }
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
            Authorization: token,
          },
          body: JSON.stringify(delItem),
        });
        const data = await res.json();
        if (data.message === "The ingredient was successfully deleted!") {
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
        Authorization: token,
      },
    });
    const data = await res.json();
    return data.getAllRecipes;
  } catch (error) {
    console.log(error);
  }
}

async function populateRecipeList() {
  // document.getElementById("selections")?.removeChild()

  const recipes = await fetchRecipeList();

  const selections = document.getElementById("selections");

  if (selections) {
    selections.innerHTML = "";
  }

  const recipeListTable = document.createElement("table");
  recipeListTable.id = "recipeListTable";

  const recipeListTableBody = document.createElement("tbody");
  recipeListTableBody.id = "recipeListTableBody";
  recipeListTable.append(recipeListTableBody);

  if (selections) {
        selections.append(recipeListTable);
        const addRecipeBtn = document.createElement("button");
        addRecipeBtn.id = "addRecipe";
        addRecipeBtn.className = "button";
        addRecipeBtn.textContent = "New Recipe";
      
        const addRecipeContainer = document.createElement("div");
        addRecipeContainer.id = "addRecipeContainer";
      
        selections.append(addRecipeContainer);
        addRecipeContainer.append(addRecipeBtn);
        addRecipeBtn.addEventListener("click", handleNewRecipeClick);
      
        const deleteRecipeBtn = document.createElement("button");
        deleteRecipeBtn.id = "deleteRecipe";
        deleteRecipeBtn.className = "button";
        deleteRecipeBtn.textContent = "Delete Recipe";
        addRecipeContainer.append(deleteRecipeBtn);
        deleteRecipeBtn.addEventListener("click", handleDeleteRecipe);
      
        async function handleDeleteRecipe(e) {
          e.preventDefault();
          const recipeCheckboxes = document.getElementsByClassName("recipeCheckbox");
          const recipeName = document.getElementsByClassName("recipeName");
      
          for (let i = 0; i < recipeCheckboxes.length; i++) {
            if (recipeCheckboxes[i].checked === true) {
              console.log(recipeCheckboxes[i].checked);
              console.log(recipeName[i].textContent);
              const URL = `${serverURL}/recipe/delete/`;
              let delItem = {};
              delItem.recipeName = recipeName[i].textContent;
              try {
                const res = await fetch(URL, {
                  method: "DELETE",
                  mode: "cors",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                  },
                  body: JSON.stringify(delItem),
                });
                const data = await res.json();
                if (data.message === "The recipe was successfully deleted!") {
                  console.log("the recipe was deleted");
                  await populateRecipeList();
                  document.getElementsByClassName("mainContent")?.remove();
                }
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
      
        async function handleNewRecipeClick() {
          const mainContent = document.getElementsByClassName("mainContent");
      
          for (let i = mainContent.length; i > 0; i--) {
            mainContent[i - 1].remove();
          }
      
          document.getElementById("addRecipeIngredientsToShoppingListBtn")?.remove();
          document.getElementById("newIngredientSection")?.remove()
          const ingredientsInformation = [];
          // removeNewRecipeInputFields();
      
          const ingredientInputForm = document.createElement("div");
          ingredientInputForm.id = "ingredientInputForm";
      
          const newRecipeNameInput = document.createElement("input");
          newRecipeNameInput.type = "text";
          newRecipeNameInput.id = "newRecipeNameInput";
          newRecipeNameInput.placeholder = "New Recipe Name";
          newRecipeNameInput.required = true;
      
          const newIngredientInput = document.createElement("input");
          newIngredientInput.className = "newIngredients";
          newIngredientInput.id = "newIngredientInput";
          newIngredientInput.setAttribute("list", "ingredientOptions");
          newIngredientInput.placeholder = "Name";
          newIngredientInput.required = true;
      
          const newIngredientMeasure = document.createElement("input");
          newIngredientMeasure.className = "newIngredientMeasure";
      
          const newIngredientFieldBtn = document.createElement("button");
          newIngredientFieldBtn.id = "newIngredientInputFieldBtn";
          newIngredientFieldBtn.classList = ("button", "newIngredientFieldBtns");
          newIngredientFieldBtn.addEventListener(
            "click",
            handleIngredientInputSubmit
          );
      
          async function handleIngredientInputSubmit(e) {
            e.preventDefault();
            const ingredientNameInput = document.getElementById("newIngredientInput");
            const ingredientAmtInput = document.getElementById(
              "newIngredientAmtInput"
            );
            const measurementUnitInput = document.getElementById(
              "measurementUnitInput"
            );
            const newIngredientCalorieInput = document.getElementById(
              "newIngredientCalorieInput"
            );
            if (newIngredientCalorieInput.value === "?") {
              return;
            }
            if (
              ingredientNameInput.value &&
              ingredientAmtInput.value &&
              measurementUnitInput.value &&
              newIngredientCalorieInput.value
            ) {
              convertMeasurementUnitsToFlOz(
                measurementUnitInput,
                ingredientAmtInput,
                newIngredientCalorieInput
              );
      
              //todo push this information to the ingredients array that will be sent to the back end when the recipe is actually submitted
              const ingredientObject = {};
              const { measurementUnitToSend, caloriesToSend } =
                convertMeasurementUnitsToFlOz(
                  measurementUnitInput,
                  ingredientAmtInput,
                  newIngredientCalorieInput
                );
      
              ingredientObject.ingredientName = ingredientNameInput.value;
              ingredientObject.ingredientAmt = ingredientAmtInput.value;
              ingredientObject.measurementUnitInput = measurementUnitToSend;
              ingredientObject.newIngredientCalorieInput = caloriesToSend;
      
              console.log("measurementUnitToSend: ", measurementUnitToSend);
              if (measurementUnitToSend === "whole") {
                ingredientObject.whole = true;
                ingredientObject.newIngredientCalorieInput = caloriesToSend;
              } else if (measurementUnitToSend === "half") {
                ingredientObject.whole = true;
                ingredientObject.newIngredientCalorieInput = caloriesToSend * 2;
              } else if (measurementUnitToSend === "quarter") {
                ingredientObject.whole = true;
                ingredientObject.newIngredientCalorieInput = caloriesToSend * 4;
              } else {
                ingredientObject.whole = false;
              }
      
              console.log("ingredientObject.whole: ", ingredientObject.whole);
              ingredientsInformation.push(ingredientObject);
      
              const URL = `${serverURL}/recipeingredient/storeRecipeIngredient`;
      
              //todo insert an alternate fetch to patch an update to an existing ingredient, rather than posting another one
      
              try {
                const res = await fetch(URL, {
                  method: "POST",
                  mode: "cors",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(ingredientObject),
                  Authorization: token,
                });
                const data = await res.json();
                if (data.message === "Success! RecipeIngredient Saved!") {
                  console.log("Success! RecipeIngredient Saved!");
                }
              } catch (error) {
                console.log(error.message);
              }
      
              const submittedIngredient = document.createElement("div");
              submittedIngredient.textContent = ingredientNameInput.value;
              submittedIngredient.className = "newIngredients";
      
              const submittedIngredientAmt = document.createElement("div");
              submittedIngredientAmt.textContent = ingredientAmtInput.value;
              submittedIngredientAmt.className = "newIngredientAmtInputs";
      
              const submittedMeasurementUnit = document.createElement("div");
              submittedMeasurementUnit.textContent = measurementUnit.value;
              submittedMeasurementUnit.className = "measurementUnit";
      
              const submittedIngredientCals = document.createElement("div");
              submittedIngredientCals.textContent = newIngredientCalorieInputs.value;
              submittedIngredientCals.className = "newIngredientCalorieInputs";
              submittedIngredientCals.setAttribute("number", true);
      
              const editBtn = document.createElement("button");
              editBtn.id = "recipeIngredientEdit";
              editBtn.className = "newIngredientFieldBtns";
              editBtn.textContent = "Edit";
              editBtn.addEventListener("click", handleEditRecipeIngredient);
              editBtn.removeEventListener("click", handleEditRecipeIngredient);
              newIngredientGrid.append(
                submittedIngredient,
                submittedIngredientAmt,
                submittedMeasurementUnit,
                submittedIngredientCals,
                editBtn
              );
      
              function handleEditRecipeIngredient() {
                alert(
                  "This will be used to switch the line to inputs, and the text content to the previous values"
                );
              }
              ingredientNameInput.value = "";
              ingredientAmtInput.value = "";
              measurementUnitInput.value = "";
              newIngredientCalorieInput.value = "";
            } else {
              console.log("missing input");
            }
            await getKnownRecipeIngredients(ingredientInputForm);
          }
      
          function convertMeasurementUnitsToFlOz(
            measurementUnitInput,
            ingredientAmtInput,
            newIngredientCalorieInput
          ) {
            console.log("measurementUnitInput.value: ", measurementUnitInput.value);
            const conversionObject = {
              gal: 128,
              qt: 32,
              pint: 16,
              cup: 8,
              tbsp: 0.5,
              tsp: 1.6666667,
              "fl oz": 1,
            };
      
            if (conversionObject[measurementUnitInput.value]) {
              const convertedUnits =
                conversionObject[measurementUnitInput.value] *
                +ingredientAmtInput.value;
      
              const convertedCalories =
                +newIngredientCalorieInputs.value / convertedUnits;
      
              return {
                caloriesToSend: convertedCalories,
                measurementUnitToSend: "fl oz",
              };
            } else {
              return {
                caloriesToSend: +newIngredientCalorieInput.value,
                measurementUnitToSend: measurementUnitInput.value,
              };
            }
          }
      
          newIngredientFieldBtn.textContent = "Add ";
      
          const recipeCookTimeInputField = document.createElement("input");
          recipeCookTimeInputField.type = "string";
          recipeCookTimeInputField.id = "recipeCookTimeInputField";
          recipeCookTimeInputField.placeholder = "Time to Make";
      
          const recipeTempInputField = document.createElement("input");
          recipeTempInputField.type = "string";
          recipeTempInputField.id = "recipeTempInputField";
          recipeTempInputField.placeholder = "Temperature";
      
          const numOfServingsRow = document.createElement("div");
          const numOfServingsLabel = document.createElement("div");
          numOfServingsLabel.id = "numOfServingsLabel";
          numOfServingsLabel.textContent = "Servings: ";
      
          const numberOfServingsInputField = document.createElement("input");
          numberOfServingsInputField.type = "number";
          numberOfServingsInputField.id = "numberOfServingsInputField";
          numberOfServingsInputField.placeholder = "Servings";
          numberOfServingsInputField.min = "1";
          numberOfServingsInputField.value = 1;
      
          numOfServingsRow.append(numOfServingsLabel, numberOfServingsInputField);
      
          const recipeInstructionsInputField = document.createElement("textarea");
          recipeInstructionsInputField.id = "recipeInstructionsInputField";
          recipeInstructionsInputField.placeholder = "Description";
          if (document.getElementById("ingredientInputForm")) {
            document
              .getElementById("addRecipeIngredientsToShoppingListBtn")
              ?.remove();
          }
      
          const recipeStepRow = document.createElement("div");
          recipeStepRow.className = "recipeStepRows";
      
          const recipeStepLabel = document.createElement("div");
          recipeStepLabel.className = "recipeStepLabels";
          recipeStepLabel.textContent = "Step 1: ";
      
          const recipeStep = document.createElement("input");
          recipeStep.placeholder = "step:";
          recipeStep.className = "recipeSteps";
          recipeStep.id = "step_1";
      
          const submitRecipeStepBtn = document.createElement("button");
          submitRecipeStepBtn.className = "submitRecipeStepBtn";
          submitRecipeStepBtn.textContent = "+";
          submitRecipeStepBtn.addEventListener("click", handleSubmitRecipeStep);
      
          recipeStepRow.append(recipeStepLabel, recipeStep, submitRecipeStepBtn);
      
          function handleSubmitRecipeStep() {
            const oldBtns = document.getElementsByClassName("submitRecipeStepBtn");
            oldBtns[oldBtns.length - 1].removeEventListener(
              "click",
              handleSubmitRecipeStep
            );
            oldBtns[oldBtns.length - 1].remove();
      
            const recipeStepRow = document.createElement("div");
            recipeStepRow.className = "recipeStepRows";
      
            const recipeStepLabel = document.createElement("div");
            recipeStepLabel.className = "recipeStepLabels";
      
            const recipeStep = document.createElement("input");
            recipeStep.placeholder = "step:";
            recipeStep.className = "recipeSteps";
      
            console.log(
              "recipeStepRows: ",
              document.getElementsByClassName("recipeStepRows")
            );
      
            const submitRecipeStepBtn = document.createElement("button");
            submitRecipeStepBtn.className = "submitRecipeStepBtn";
            submitRecipeStepBtn.textContent = "+";
            submitRecipeStepBtn.addEventListener("click", handleSubmitRecipeStep);
      
            recipeStepRow.append(recipeStepLabel, recipeStep, submitRecipeStepBtn);
      
            const newRecipeBtn = document.getElementById("newRecipeInputBtn");
            // console.log(newRecipeBtn.textContent);
      
            newRecipeBtn.before(recipeStepRow);
            const recipeStepLabels =
              document.getElementsByClassName("recipeStepLabels");
      
            for (let i = 0; i < recipeStepLabels.length; i++) {
              console.log("recipeStepLabel: ", recipeStepLabel);
              recipeStepLabels[i].id = `step_${i + 1}`;
              recipeStepLabels[i].textContent = `Step ${i + 1}:`;
            }
          }
      
          const measurementUnit = document.createElement("select");
          measurementUnit.setAttribute("list", "unitOptions");
          measurementUnit.className = "measurementUnit";
          measurementUnit.id = "measurementUnitInput"; //todo - remove this when adding a new ingredient line
          measurementUnit.placeholder = "unit";
          measurementUnit.addEventListener("change", handleMeasurementUnitChange);
      
          async function handleMeasurementUnitChange() {
            const data = await checkForExistingRecipeIngredient(
              newIngredientInput.value
            );
            const body = data.findIngredient;
      
            console.log("body: ", body);
      
            const conversionObject = {
              gal: 128,
              qt: 32,
              pint: 16,
              cup: 8,
              tbsp: 0.5,
              tsp: 1.6666667,
              "fl oz": 1,
            };
      
            if (body.whole === false) {
              if (conversionObject[measurementUnit.value]) {
                const newValue =
                  body.calories * conversionObject[measurementUnit.value];
                newIngredientCalorieInputs.value =
                  +newValue.toFixed(0) * +newIngredientAmtInputs.value;
              }
            } else if (body.whole === true) {
            }
            if (measurementUnit.value === "whole") {
              newIngredientCalorieInputs.value = body.calories.toFixed(0);
            } else if (measurementUnit.value === "half") {
              newIngredientCalorieInputs.value = (body.calories * 0.5).toFixed(0);
            } else if (measurementUnit.value === "quarter") {
              newIngredientCalorieInputs.value = (body.calories * 0.25).toFixed(0);
            } else {
              newIngredientCalorieInputs.value = "?";
            }
          }
      
          const unitOptions = [
            "tsp",
            "tbsp",
            "fl oz",
            "cup",
            "pint",
            "qt",
            "gal",
            "whole",
            "half",
            "quarter",
          ];
      
          unitOptions.map((unit) => {
            const option = document.createElement("option");
            option.value = unit;
            option.textContent = unit;
            measurementUnit.append(option);
          });
      
          let ingredientDataList = document.createElement("datalist");
          ingredientDataList.id = "ingredientOptions";
      
          const unitOption = document.createElement("option");
      
          const newRecipeInputBtn = document.createElement("input");
          newRecipeInputBtn.type = "submit";
          newRecipeInputBtn.id = "newRecipeInputBtn";
          newRecipeInputBtn.addEventListener("click", handleNewRecipeSubmit);
      
          const newIngredientAmtInputs = document.createElement("input");
          newIngredientAmtInputs.placeholder = "qty";
          newIngredientAmtInputs.type = "number";
          newIngredientAmtInputs.className = "newIngredientAmtInputs";
          newIngredientAmtInputs.min = 0;
          newIngredientAmtInputs.id = "newIngredientAmtInput";
          newIngredientAmtInputs.addEventListener(
            "change",
            handleMeasurementUnitChange
          );
      
          const newIngredientCalorieInputs = document.createElement("input");
          newIngredientCalorieInputs.className = "newIngredientCalorieInputs";
          newIngredientCalorieInputs.placeholder = "Cal";
          newIngredientCalorieInputs.id = "newIngredientCalorieInput";
          newIngredientCalorieInputs.setAttribute("number", true);
      
          const newIngredientGrid = document.createElement("div");
          newIngredientGrid.id = "newIngredientGrid";
      
          const newIngredientSection = document.createElement('div')
          newIngredientSection.id = "newIngredientSection"
      
          newIngredientSection.append(
            newIngredientGrid,
            recipeInstructionsInputField,
            recipeStepRow,
            newRecipeInputBtn
          )
      
          document.getElementById("recipesContainer").after(
            newIngredientSection
          );
      
          const newIngredientContainer = document.createElement("tr");
          newIngredientContainer.id = "newIngredientContainer";
          newIngredientContainer.className = "newIngredientContainers";
      
          newIngredientGrid.append(
            newIngredientInput,
            newIngredientAmtInputs,
            measurementUnit,
            newIngredientCalorieInputs,
            newIngredientFieldBtn
          );
      
          ingredientInputForm.append(unitOption, newRecipeNameInput);
      
          const timeAndTemp = document.createElement("div");
          timeAndTemp.id = "timeAndTemp";
          timeAndTemp.append(
            recipeCookTimeInputField,
            recipeTempInputField,
            numOfServingsRow
          );
      
          document
            .getElementById("newIngredientGrid")
            .before(ingredientInputForm, timeAndTemp);
        }

  }



  recipes.map((recipe) => {
    const recipeCheck = document.createElement("td");
    recipeCheck.className = "recipeCheck";

    const recipeCheckbox = document.createElement("input");
    recipeCheckbox.type = "checkbox";
    recipeCheckbox.className = "recipeCheckbox";
    recipeCheck.append(recipeCheckbox);

    const recipeName = document.createElement("td");
    recipeName.className = "recipeName";
    recipeName.value = recipe.recipeName;
    recipeName.textContent = recipe.recipeName;
    recipeName.style.textDecoration = "none";
    recipeName.addEventListener("click", handleRecipeClick);

    const showRecipeBtn = document.createElement("button");
    showRecipeBtn.className = "button";
    showRecipeBtn.addEventListener("click", handleShowRecipeClick);
    showRecipeBtn.textContent = "View";

    const recipeGroup = document.createElement("tr");
    recipeGroup.className = "recipeGroup";
    recipeGroup.append(recipeCheck, recipeName, showRecipeBtn);

    recipeListTableBody.append(recipeGroup);

    async function handleShowRecipeClick() {

      //todo either addRecipeIngredientsToShoppingListBtnContainer or addRecipeIngredientsToShoppingListBtn are being removed by this click
      // removeNewRecipeInputFields();

      const data = async () => {
        const URL = `${serverURL}/recipe/find`;

        const recipeQuery = {
          recipeName: recipe.recipeName,
        };

        const reqOptions = {
          method: "POST",
          mode: "cors",
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: token,
          }),
          body: JSON.stringify(recipeQuery),
        };

        try {
          const res = await fetch(URL, reqOptions);
          const data = await res.json();
          return data.findRecipe;
        } catch (error) {}
      };

      const recipeInfo = await data();

      const recipeWindow = document.getElementById("recipeWindow");
      recipeWindow.style.display = "block";
      const recipeWindowContent = document.getElementById(
        "recipeWindowContent"
      );
      const recipeButtonContainer = document.createElement("div");
      recipeButtonContainer.id = "recipeButtonContainer";

      const closeRecipeWindowBtn = document.createElement("button");
      closeRecipeWindowBtn.id = "closeRecipeWindowBtn";
      closeRecipeWindowBtn.textContent = "Close";

      closeRecipeWindowBtn.addEventListener("click", handleCloseRecipeWindow);

      recipeButtonContainer.append(closeRecipeWindowBtn);

      // recipeWindow.style.width = "95vw";

      recipeWindowContent.style.height = "fit-content";
      recipeWindowContent.style.minHeight = "95vh";
      recipeWindowContent.style.width = "93vw";
      recipeWindowContent.style.visibility = "visible";

      const recipeText = document.getElementById("recipeText");
      recipeText.innerHTML = "";

      const recipeName = document.createElement("h2");
      recipeName.textContent = recipeInfo.recipeName;

      const temp = document.createElement("li");
      temp.textContent = `Temp: ${recipeInfo.temperature}`;
      temp.className = "temperatureDivs";

      const time = document.createElement("li");
      time.textContent = `Time: ${recipeInfo.time}`;
      time.className = "timeDivs";

      const listContainer = document.createElement("div");
      listContainer.id = "listContainer";

      const column_one = document.createElement("div");
      column_one.className = "recipeIngredientsColumns";
      column_one.id = "recipeIngredientsColumn_1";

      const column_two = document.createElement("div");
      column_two.className = "recipeIngredientsColumns";
      column_two.id = "recipeIngredientsColumn_2";

      const ingredients = recipeInfo.ingredients;

      for (let i = 0; i < ingredients.length; i += 2) {
        const firstDiv = document.createElement("div");
        firstDiv.textContent = `${ingredients[i].amount} ${ingredients[i].measurementUnit} ${ingredients[i].name}`;

        const secondDiv = document.createElement("div");
        secondDiv.textContent = `${ingredients[i + 1]?.amount} ${
          ingredients[i + 1]?.measurementUnit
        } ${ingredients[i + 1]?.name}`;

        column_one.append(firstDiv);
        if (ingredients[i + 1]) {
          column_two.append(secondDiv);
        }
      }
      listContainer.append(column_one, column_two);

      const instructionsContainer = document.createElement("div");
      instructionsContainer.id = "instructionsContainer";

      const currentRecipeInstructions = recipeInfo.instructions;

      const currentRecipeDescription = recipeInfo.instructions[0];

      const instructions = document.createElement("div");
      instructions.className = "instructionsText";
      instructions.id = "currentRecipeDescription";
      instructions.textContent = currentRecipeDescription;
      instructionsContainer.append(instructions);

      for (let i = 1; i < currentRecipeInstructions.length; i++) {
        const instructionsRow = document.createElement("div");
        instructionsRow.className = "instructionsRows";

        const instructionsCheckbox = document.createElement("input");
        instructionsCheckbox.type = "checkbox";
        instructionsCheckbox.className = "instructionsCheckboxes";
        instructionsCheckbox.addEventListener(
          "click",
          handleInstructionsStepClick
        );

        const instructions = document.createElement("div");
        instructions.className = "instructionsText";
        instructions.textContent = `Step ${i}: ${currentRecipeInstructions[i]}`;
        instructions.style.textDecoration = "none";
        instructionsRow.append(instructionsCheckbox, instructions);

        instructionsContainer.append(instructionsRow);

        function handleInstructionsStepClick() {
          if (instructions.style.textDecoration === "line-through") {
            instructions.style.textDecoration = "none";
            instructions.style.color = "white";
          } else if (instructions.style.textDecoration === "none") {
            instructions.style.textDecoration = "line-through";
            instructions.style.color = "black";
          }
        }
      }

      // console.log("ingredients: ", ingredients);

      let totalCaloriesAmt = 0;

      for (let i = 0; i < ingredients.length; i++) {
        totalCaloriesAmt += Number(ingredients[i].newIngredientCalorieInput);
      }

      // console.log("totalCalories: ",totalCaloriesAmt)

      const totalCalories = document.createElement("li");
      totalCalories.id = "totalCalories";
      totalCalories.textContent = `Total Calories: ${totalCaloriesAmt.toLocaleString()}`;

      const noOfServingsInput = document.createElement("input");
      noOfServingsInput.id = "noOfServingsInput";
      noOfServingsInput.value = recipeInfo.numberOfServings;
      noOfServingsInput.type = "number";
      noOfServingsInput.min = "1";
      noOfServingsInput.addEventListener("change", handleNoOfServingsChange);

      function handleNoOfServingsChange() {
        if (noOfServingsInput.value < 1) {
          noOfServingsInput.value = 1;
          return;
        }
        const calsPerServing = (
          totalCaloriesAmt / noOfServingsInput.value
        ).toFixed(0);
        document.getElementById(
          "caloriesPerServing"
        ).textContent = `Calories Per Serving: ${calsPerServing}`;
      }

      const caloriesPerServing = document.createElement("li");
      caloriesPerServing.id = "caloriesPerServing";

      const calsPerServing = (
        totalCaloriesAmt / noOfServingsInput.value
      ).toFixed(0);
      caloriesPerServing.textContent = `Calories Per Serving: ${calsPerServing}`;

      const numberOfServings = document.createElement("li");
      numberOfServings.id = "numberOfServings";
      numberOfServings.textContent = "Number of servings: ";
      numberOfServings.append(noOfServingsInput);

      const generalRecipeInfo = document.createElement("ul");
      generalRecipeInfo.id = "generalRecipeInfo";
      generalRecipeInfo.append(
        temp,
        time,
        totalCalories,
        numberOfServings,
        caloriesPerServing
      );

      instructionsContainer.append(recipeButtonContainer);
      recipeText.append(recipeName, generalRecipeInfo, listContainer);
      document
        .getElementById("recipeWindowContent")
        .append(instructionsContainer);
    }

    recipeCheckbox.addEventListener("click", handleRecipeCheckboxClick);

    function handleCloseRecipeWindow() {
      document.getElementById("instructionsContainer")?.remove();
      // recipeWindow.style.height = "0";
      // recipeWindow.style.width = "0";

      // recipeWindowContent.style.height = "0";
      // recipeWindowContent.style.width = "0";
      // recipeWindowContent.style.visibility = "hidden";
      recipeWindow.style.display = "none";
    }

    function handleRecipeCheckboxClick() {
      if (recipeName.style.textDecoration === "line-through") {
        recipeName.style.textDecoration = "none";
      } else if (recipeName.style.textDecoration === "none") {
        recipeName.style.textDecoration = "line-through";
      }
    }

    function handleRecipeClick() {
      // const recipeTableBody = document.getElementById("recipeListTableBody");
      // const recipeTableBody = document.getElementById("recipeTableBody");

      //   if (recipeTableBody) {
      //   recipeTableBody.innerHTML = "";
      // }

      removeRecipeIngredients();
      document.getElementById("recipeInstructionsInputField")?.remove();
      document.getElementById("newIngredientGrid")?.remove();
      document
        .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
        ?.remove();
      document.getElementById("newRecipeInputBtn")?.remove();
      document.getElementById("ingredientInputForm")?.remove();
      document.getElementById("timeAndTemp")?.remove();

      const recipeStepRows = document.getElementsByClassName("recipeStepRows");

      for (let i = recipeStepRows.length - 1; i >= 0; i--) {
        recipeStepRows[i].remove();
      }

      const checkboxHeader = document.createElement("th");
      checkboxHeader.textContent = "Select";

      const ingredientHeader = document.createElement("th");
      ingredientHeader.textContent = "Ingredient";

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
        ingredient.textContent = item.name;
        ingredient.style.textDecoration = "none";
        mainContent.append(check, ingredient);
        document.getElementById("recipesContainer").after(mainContent);

        checkBox.addEventListener("click", handleIngredientListCheckboxClick);

        function handleIngredientListCheckboxClick() {
          if (ingredient.style.textDecoration === "line-through") {
            ingredient.style.textDecoration = "none";
          } else if (ingredient.style.textDecoration === "none") {
            ingredient.style.textDecoration = "line-through";
          }
        }
      });

          // selections.append(recipeListTable, addRecipeContainer);
          // selections.append(addRecipeContainer);



      const addRecipeIngredientsToShoppingListBtnContainer =
        document.createElement("div");
      addRecipeIngredientsToShoppingListBtnContainer.id =
        "addRecipeIngredientsToShoppingListBtnContainer";

      const addRecipeIngredientsToShoppingListBtn =
        document.createElement("button");
      addRecipeIngredientsToShoppingListBtn.id =
        "addRecipeIngredientsToShoppingListBtn";
      addRecipeIngredientsToShoppingListBtn.className = "button";
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
        // .getElementById("recipeListTableBody")
        // //todo change this if needed from after to append
        // .after(addRecipeIngredientsToShoppingListBtnContainer);

        document.getElementsByClassName("mainContent")[document.getElementsByClassName("mainContent").length -1].after(addRecipeIngredientsToShoppingListBtnContainer)
      document
        .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
        .append(addRecipeIngredientsToShoppingListBtn);
    }
  });
}

function removeRecipeIngredients() {
  const mainContent = document.getElementsByClassName("mainContent");

  if (mainContent.length > 0) {
    for (let i = mainContent.length; i > 0; i--) {
      mainContent[i - 1].remove();
    }
  }
}

// function removeNewRecipeInputFields() {
//   document.getElementById("ingredientInputForm")?.remove();
//   document.getElementById("timeAndTemp")?.remove();
//   document
//     .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
//     ?.remove();
//   document.getElementById("newIngredientGrid")?.remove();
//   document.getElementById("recipeInstructionsInputField")?.remove();
//   const recipeStepRows = document.getElementsByClassName("recipeStepRows");

//   for (const row of recipeStepRows) {
//     row?.remove();
//   }
//   document.getElementById("newRecipeInputBtn")?.remove();
// }


const getKnownRecipeIngredients = async (ingredientInputForm) => {
  const URL = `${serverURL}/recipeingredient/`;

  const res = await fetch(URL, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });

  const data = await res.json();

  const fetchedIngredients = data.getAllRecipeIngredients;

  if (fetchedIngredients) {
    let ingredientDataList = document.createElement("datalist");
    ingredientDataList.id = "ingredientOptions";
    const newIngredientInput = document.createElement("input");
    newIngredientInput.className = "newIngredients";
    newIngredientInput.id = "newIngredientInput";
    newIngredientInput.setAttribute("list", "ingredientOptions");
    newIngredientInput.placeholder = "Name";
    newIngredientInput.required = true;

    fetchedIngredients.map((listing) => {
      const ingredientOption = document.createElement("option");
      ingredientOption.value = listing.recipeIngredientName;
      ingredientDataList.append(ingredientOption);
    });
    document.getElementById("ingredientOptions")?.remove();
    ingredientInputForm.append(ingredientDataList);
  }
};

async function handleAddRecipeIngredientsToShoppingList() {
  const button = document.getElementById(
    "addRecipeIngredientsToShoppingListBtn"
  );
  button.removeEventListener("click", handleAddRecipeIngredientsToShoppingList);

  setTimeout(() => {
    button.style.backgroundColor = "initial";
    button.style.color = "initial";
    button.textContent = "Add to Shopping List";
    button.addEventListener("click", handleAddRecipeIngredientsToShoppingList);
  }, 6000);
  const ingredientCollection = document.getElementsByClassName("ingredient");
  const ingredientCheck = document.getElementsByClassName("ingredientCheck");

  for (let i = 0; i < ingredientCollection.length; i++) {
    if (ingredientCheck[i].children[0].checked === true) {
      postNewIngredient(ingredientCollection[i].textContent, 0);
    }
  }
  // setTimeout(() => {
  await fetchShoppingList();

  // }, 500);
  loadShoppingList()
}

switchBtn?.addEventListener("click", toggleSignup);

loginForm?.addEventListener("submit", login);
