// const serverURL = "http://127.0.0.1:3498/api/shoppinglist";
const serverURL = "https://www.danhenrydev.com/api/shoppinglist";


// https://developers.google.com/identity/sign-in/web/sign-getElementsByName("email")
// https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
// https://github.com/john-doherty/swiped-events/blob/master/src/swiped-events.js
/* 
I merged a few of the answers here into a script that uses CustomEvent to fire swiped events in the DOM. Add the 0.7k swiped-events.min.js script to your page and listen for swiped events:

swiped
document.addEventListener('swiped', function(e) {
    console.log(e.target); // the element that was swiped
    console.log(e.detail.dir); // swiped direction
});
swiped-left
document.addEventListener('swiped-left', function(e) {
    console.log(e.target); // the element that was swiped
});

swiped-right
document.addEventListener('swiped-right', function(e) {
    console.log(e.target); // the element that was swiped
});
swiped-up
document.addEventListener('swiped-up', function(e) {
    console.log(e.target); // the element that was swiped
});
swiped-down
document.addEventListener('swiped-down', function(e) {
    console.log(e.target); // the element that was swiped
});
You can also attach directly to an element:

document.getElementById('myBox').addEventListener('swiped-down', function(e) {
    console.log(e.target); // the element that was swiped
});
/*



/*
Optional config
You can specify the following attributes to tweak how swipe interaction functions in your page (these are optional).

<div data-swipe-threshold="10"
     data-swipe-timeout="1000"
     data-swipe-ignore="false">
      Swiper, get swiping!
</div>
To set defaults application wide, set config attributes on topmost element:

<body data-swipe-threshold="100" data-swipe-timeout="250">
    <div>Swipe me</div>
    <div>or me</div>
</body>
Source code is available on Github
*/

/*!
 * swiped-events.js - v@version@
 * Pure JavaScript swipe events
 * https://github.com/john-doherty/swiped-events
 * @inspiration https://stackoverflow.com/questions/16348031/disable-scrolling-when-touch-moving-certain-element
 * @author John Doherty <www.johndoherty.info>
 * @license MIT
 */
(function (window, document) {
  "use strict";

  // patch CustomEvent to allow constructor creation (IE/Chrome)
  if (typeof window.CustomEvent !== "function") {
    window.CustomEvent = function (event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined,
      };

      var evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(
        event,
        params.bubbles,
        params.cancelable,
        params.detail
      );
      return evt;
    };

    window.CustomEvent.prototype = window.Event.prototype;
  }

  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchmove", handleTouchMove, false);
  document.addEventListener("touchend", handleTouchEnd, false);

  var xDown = null;
  var yDown = null;
  var xDiff = null;
  var yDiff = null;
  var timeDown = null;
  var startEl = null;
  var touchCount = 0;

  /**
   * Fires swiped event if swipe detected on touchend
   * @param {object} e - browser event object
   * @returns {void}
   */
  function handleTouchEnd(e) {
    // if the user released on a different target, cancel!
    if (startEl !== e.target) return;

    var swipeThreshold = parseInt(
      getNearestAttribute(startEl, "data-swipe-threshold", "20"),
      10
    ); // default 20 units
    var swipeUnit = getNearestAttribute(startEl, "data-swipe-unit", "px"); // default px
    var swipeTimeout = parseInt(
      getNearestAttribute(startEl, "data-swipe-timeout", "500"),
      10
    ); // default 500ms
    var timeDiff = Date.now() - timeDown;
    var eventType = "";
    var changedTouches = e.changedTouches || e.touches || [];

    if (swipeUnit === "vh") {
      swipeThreshold = Math.round(
        (swipeThreshold / 100) * document.documentElement.clientHeight
      ); // get percentage of viewport height in pixels
    }
    if (swipeUnit === "vw") {
      swipeThreshold = Math.round(
        (swipeThreshold / 100) * document.documentElement.clientWidth
      ); // get percentage of viewport height in pixels
    }

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      // most significant
      if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
        if (xDiff > 0) {
          eventType = "swiped-left";
        } else {
          eventType = "swiped-right";
        }
      }
    } else if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
      if (yDiff > 0) {
        eventType = "swiped-up";
      } else {
        eventType = "swiped-down";
      }
    }

    if (eventType !== "") {
      var eventData = {
        dir: eventType.replace(/swiped-/, ""),
        touchType: (changedTouches[0] || {}).touchType || "direct",
        fingers: touchCount, // Number of fingers used
        xStart: parseInt(xDown, 10),
        xEnd: parseInt((changedTouches[0] || {}).clientX || -1, 10),
        yStart: parseInt(yDown, 10),
        yEnd: parseInt((changedTouches[0] || {}).clientY || -1, 10),
      };

      // fire `swiped` event event on the element that started the swipe
      startEl.dispatchEvent(
        new CustomEvent("swiped", {
          bubbles: true,
          cancelable: true,
          detail: eventData,
        })
      );

      // fire `swiped-dir` event on the element that started the swipe
      startEl.dispatchEvent(
        new CustomEvent(eventType, {
          bubbles: true,
          cancelable: true,
          detail: eventData,
        })
      );
    }

    // reset values
    xDown = null;
    yDown = null;
    timeDown = null;
  }
  /**
   * Records current location on touchstart event
   * @param {object} e - browser event object
   * @returns {void}
   */
  function handleTouchStart(e) {
    // if the element has data-swipe-ignore="true" we stop listening for swipe events
    if (e.target.getAttribute("data-swipe-ignore") === "true") return;

    startEl = e.target;

    timeDown = Date.now();
    xDown = e.touches[0].clientX;
    yDown = e.touches[0].clientY;
    xDiff = 0;
    yDiff = 0;
    touchCount = e.touches.length;
  }

  /**
   * Records location diff in px on touchmove event
   * @param {object} e - browser event object
   * @returns {void}
   */
  function handleTouchMove(e) {
    if (!xDown || !yDown) return;

    var xUp = e.touches[0].clientX;
    var yUp = e.touches[0].clientY;

    xDiff = xDown - xUp;
    yDiff = yDown - yUp;
  }

  /**
   * Gets attribute off HTML element or nearest parent
   * @param {object} el - HTML element to retrieve attribute from
   * @param {string} attributeName - name of the attribute
   * @param {any} defaultValue - default value to return if no match found
   * @returns {any} attribute value or defaultValue
   */
  function getNearestAttribute(el, attributeName, defaultValue) {
    // walk up the dom tree looking for attributeName
    while (el && el !== document.documentElement) {
      var attributeValue = el.getAttribute(attributeName);

      if (attributeValue) {
        return attributeValue;
      }

      el = el.parentNode;
    }

    return defaultValue;
  }
})(window, document);


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

  // populateRecipeList();

  // const applicationContainer = document.getElementById("applicationContainer")
  // applicationContainer.addEventListener("click", handleApplicationContainerClick)
  // const recipeContent = document.getElementById("recipeContent")
  // recipeContent.addEventListener("click", handleRecipeContentClick)
  // const recipesContainer = document.getElementById("recipesContainer")
  // recipesContainer.addEventListener("click", handleRecipesContainerClick)
}

function handleApplicationContainerClick() {
  const applicationContainer = document.getElementById("applicationContainer");
  const recipeContent = document.getElementById("recipeContent");
  const recipesContainer = document.getElementById("recipesContainer");

  // const applicationContainerContents = applicationContainer.innerHTML;
  const recipeContentContents = recipeContent.innerHTML;
  const recipesContainerContent = recipesContainer.innerHTML;

  // recipeContent.innerHTML = ""
  recipeContent.style.height = "0";

  // recipesContainer.innerHTML = ""
  recipesContainer.style.height = "0";

  applicationContainer.style.height = "100vh";
}

function handleRecipeContentClick() {
  const applicationContainer = document.getElementById("applicationContainer");
  const recipeContent = document.getElementById("recipeContent");
  const recipesContainer = document.getElementById("recipesContainer");

  const applicationContainerContents = applicationContainer.innerHTML;
  const recipeContentContents = recipeContent.innerHTML;
  const recipesContainerContent = recipesContainer.innerHTML;
}

function handleRecipesContainerClick() {
  const applicationContainer = document.getElementById("applicationContainer");
  const recipeContent = document.getElementById("recipeContent");
  const recipesContainer = document.getElementById("recipesContainer");

  const applicationContainerContents = applicationContainer.innerHTML;
  const recipeContentContents = recipeContent.innerHTML;
  const recipesContainerContent = recipesContainer.innerHTML;
}

//todo - this is where the new recipe ingredients, qty, etc need to go

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

  const numberOfServingsInput = document.getElementById("numberOfServingsInputField").value

  // console.log("numberOfServingsInput: ", numberOfServingsInput)
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

  const recipeSteps = document.getElementsByClassName("recipeSteps")
  for (let i = 0; i < recipeSteps.length; i++) {
    if (recipeSteps[i].value.trim().length > 0) {
      newRecipe.instructions.push(recipeSteps[i].value)
    }
  }

  // console.log(newRecipe);

  // console.log(nameInput)
  // console.log("nameInput: ", nameInput, typeof nameInput)
  // console.log("newRecipe: ",newRecipe)
  // console.log(await checkForExistingRecipe(nameInput))
  if ((await checkForExistingRecipe(nameInput)) === "Found!") {
    return;
  }
  // const nameObject = {nameInput: nameInput}
  await postNewRecipe(newRecipe);
  await populateRecipeList();
}

async function postNewIngredient(item, qty) {
  console.log("item:", item);
  const URL = `${serverURL}/ingredient/storeIngredient`;

  console.log(await checkForExistingIngredient(item));

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

      const res = await fetch(URL, {
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

async function postNewRecipe(newRecipeInformation) {
  const { ingredients, instructions, recipeName, temperature, time, numberOfServings } =
    newRecipeInformation;

    console.log("newRecipeInformation: ", newRecipeInformation)
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
        numberOfServings: numberOfServings
      };

      // const res = await fetch(URL, {
      await fetch(URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
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
    }),
    body: JSON.stringify(ingredientQuery),
  };

  try {
    //todo if the ingredient is found, populate the information on unit and calories, which can then be converted to the actual units and quantities used

    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    return data.message;
  } catch (error) {}
}

async function checkForExistingRecipeIngredient(item) {
  const URL = `${serverURL}/recipeingredient/find`;

  // console.log("item: ", item);
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
    //todo if the ingredient is found, populate the information on unit and calories, which can then be converted to the actual units and quantities used

    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    // console.log("data.message: ", data.message)
    return data;
  } catch (error) {
    // console.log(error);
  }
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
    }),
    body: JSON.stringify(ingredientQuery),
  };

  try {
    const res = await fetch(URL, reqOptions);
    const data = await res.json();
    // console.log(data)
    return data.message;
  } catch (error) {
    // console.log(error);
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
    item.style.textDecoration = "none";
    mainContent.append(item);

    checkBox.addEventListener("click", handleShoppingListCheckboxClick);

    function handleShoppingListCheckboxClick() {
      console.log("click");
      if (item.style.textDecoration === "line-through") {
        item.style.textDecoration = "none";
      } else if (item.style.textDecoration === "none") {
        item.style.textDecoration = "line-through";
      }
    }
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
  addNewItemBtn.className = "button";
  addNewItemBtn.textContent = "Add";
  addNewItemBtn.addEventListener("click", handlePostNewItem);
  check.append(addNewItemBtn);

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
    // If the user presses the "Enter" key on the keyboard
    if (e.key === "Enter" || e.keyCode === "13" || e.keyCode === "9") {
      // Cancel the default action, if needed
      e.preventDefault();
      // Trigger the button element with a click
      handlePostNewItem();
      // document.getElementById("myBtn").click();
    }
  }

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
  // console.log("recipes: ",recipes)
  //   console.log(recipes);
  const selections = document.getElementById("selections");
  selections.innerHTML = "";

  const recipeListTable = document.createElement("table");
  recipeListTable.id = "recipeListTable";
  selections.append(recipeListTable);

  const recipeListTableBody = document.createElement("tbody");
  recipeListTableBody.id = "recipeListTableBody";
  recipeListTable.append(recipeListTableBody);

  const addRecipeContainer = document.createElement("div");
  addRecipeContainer.id = "addRecipeContainer";

  const addRecipeBtn = document.createElement("button");
  addRecipeBtn.id = "addRecipe";
  addRecipeBtn.className = "button";
  addRecipeBtn.textContent = "New Recipe";

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
            },
            body: JSON.stringify(delItem),
          });
          const data = await res.json();
          if (data.message === "The recipe was successfully deleted!") {
            console.log("the recipe was deleted");
            await populateRecipeList();
            //delete previous recipe info
            document.getElementsByClassName("mainContent")?.remove();
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  async function handleNewRecipeClick() {
    if (document.getElementById("newIngredientGrid")) {
      return;
    }
    if (document.getElementById("addRecipeIngredientsToShoppingListBtn")) {
      document.getElementById("addRecipeIngredientsToShoppingListBtn").remove();
      const recipeStepRows = document.getElementsByClassName("recipeStepRows")

      // for (let i = 0; i < recipeStepRows.length; i++) {
      //   recipeStepRows[i].remove()
      // }

      // recipeStepRows
    }

    // const mainContent = document.getElementsByClassName('mainContent');

    const ingredientsInformation = [];
    const recipeTableBody = document.getElementById("recipeTableBody");
    recipeTableBody.innerHTML = "";

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
        // submittedIngredientContainer.append(
        newIngredientGrid.append(
          submittedIngredient,
          submittedIngredientAmt,
          submittedMeasurementUnit,
          submittedIngredientCals,
          editBtn
          // newIngredientFieldBtn
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
          measurementUnitToSend: +ingredientAmtInput.value,
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

    const numOfServingsRow = document.createElement("div")
    const numOfServingsLabel = document.createElement("div")
    numOfServingsLabel.id = "numOfServingsLabel"
    numOfServingsLabel.textContent = "Servings: "


    const numberOfServingsInputField = document.createElement("input")
    numberOfServingsInputField.type = "number"
    numberOfServingsInputField.id = "numberOfServingsInputField"
    numberOfServingsInputField.placeholder = "Servings"
    numberOfServingsInputField.min = "1"
    numberOfServingsInputField.value = 1

    numOfServingsRow.append(numOfServingsLabel, numberOfServingsInputField)

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
    // recipeStepLabel.id = "currentRecipeStep";

    const recipeStep = document.createElement("input");
    recipeStep.placeholder = "step:";
    recipeStep.className = "recipeSteps";
    recipeStep.id = "step_1"

    const submitRecipeStepBtn = document.createElement("button");
    submitRecipeStepBtn.className = "submitRecipeStepBtn";
    submitRecipeStepBtn.textContent = "+";
    submitRecipeStepBtn.addEventListener("click", handleSubmitRecipeStep);

    recipeStepRow.append(recipeStepLabel, recipeStep, submitRecipeStepBtn);

    function handleSubmitRecipeStep() {
      const oldBtns = document.getElementsByClassName("submitRecipeStepBtn")
      oldBtns[oldBtns.length-1].removeEventListener("click", handleSubmitRecipeStep)
      oldBtns[oldBtns.length-1].remove()

      const recipeStepRow = document.createElement("div");
      recipeStepRow.className = "recipeStepRows";

      const recipeStepLabel = document.createElement("div");
      recipeStepLabel.className = "recipeStepLabels";

      const recipeStep = document.createElement("input");
      recipeStep.placeholder = "step:";
      recipeStep.className = "recipeSteps";

      console.log("recipeStepRows: ",document.getElementsByClassName("recipeStepRows"))


      const submitRecipeStepBtn = document.createElement("button");
      submitRecipeStepBtn.className = "submitRecipeStepBtn";
      submitRecipeStepBtn.textContent = "+";
      submitRecipeStepBtn.addEventListener("click", handleSubmitRecipeStep);

      recipeStepRow.append(recipeStepLabel, recipeStep, submitRecipeStepBtn);

      const newRecipeBtn = document.getElementById("newRecipeInputBtn") 
      console.log(newRecipeBtn.textContent)

      
      newRecipeBtn.before(recipeStepRow);
      const recipeStepLabels = document.getElementsByClassName("recipeStepLabels")

      for (let i = 0; i < recipeStepLabels.length; i++) {
        console.log("recipeStepLabel: ", recipeStepLabel)
        recipeStepLabels[i].id = `step_${i+1}`
        recipeStepLabels[i].textContent = `Step ${i+1}:`
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

      console.log(measurementUnit.value);
      if (conversionObject[measurementUnit.value]) {
        const newValue =
          body.calories * conversionObject[measurementUnit.value];
        console.log(newValue.toFixed(0));
        newIngredientCalorieInputs.value =
          +newValue.toFixed(0) * +newIngredientAmtInputs.value;
      }
    }

    //todo use this for ingredient names, fetched from the backend list of all known ingredients

    //todo add new units to the back end (change the match for added unit, "one")

    const unitOptions = [
      "tsp",
      "tbsp",
      "fl oz",
      "cup",
      "pint",
      "qt",
      "gal",
      "one",
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

    document
      .getElementById("recipeItem")
      .append(
        newIngredientGrid,
        recipeInstructionsInputField,
        recipeStepRow,
        newRecipeInputBtn
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

    await getKnownRecipeIngredients(ingredientInputForm);

    ingredientInputForm.append(unitOption, newRecipeNameInput);

    const timeAndTemp = document.createElement("div");
    timeAndTemp.id = "timeAndTemp";
    timeAndTemp.append(recipeCookTimeInputField, recipeTempInputField, numOfServingsRow);

    recipeTableBody.append(ingredientInputForm, timeAndTemp);

    const ingredientInput = document.getElementById("newIngredientInput");
    ingredientInput.addEventListener("change", async () => {
      const data = await checkForExistingRecipeIngredient(
        ingredientInput.value
      );
      // console.log(data.findIngredient.calories)
      const body = data.findIngredient;

      if (data.message === "Found!") {
        // console.log("the item has been found")
        // console.log(body);
        measurementUnit.value = "fl oz";
        // console.log("measurementUnit", measurementUnit)
        newIngredientAmtInputs.value = 1;
        newIngredientCalorieInputs.value = body.calories.toFixed(0);
        /* 
      newIngredientAmtInputs,
      measurementUnit,
      newIngredientCalorieInputs,
*/
        //
      } else {
        console.log("the recipe ingredient was not found");
      }
    });
  }

  recipes.map((recipe) => {
    const recipeCheck = document.createElement("td");
    recipeCheck.className = "recipeCheck";

    const recipeCheckbox = document.createElement("input");
    recipeCheckbox.type = "checkbox";
    recipeCheckbox.className = "recipeCheckbox";
    recipeCheck.append(recipeCheckbox);

    const entry = document.createElement("td");
    entry.className = "recipeName";
    entry.value = recipe.recipeName;
    entry.textContent = recipe.recipeName;
    entry.style.textDecoration = "none";
    entry.addEventListener("click", handleRecipeClick);

    const showRecipeBtn = document.createElement("button");
    showRecipeBtn.className = "button";
    showRecipeBtn.addEventListener("click", handleShowRecipeClick);
    showRecipeBtn.textContent = "View Recipe";

    const recipeGroup = document.createElement("tr");
    recipeGroup.className = "recipeGroup";
    recipeGroup.append(recipeCheck, entry, showRecipeBtn);
    // recipeGroup.append(entry);
    // recipeGroup.append(showRecipeBtn);
    //append show recipe button here

    recipeListTableBody.append(recipeGroup);

    // console.log("entry: ", entry.textContent)

    async function handleShowRecipeClick() {
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

      // console.log(recipeInfo);
      const recipeWindow = document.getElementById("recipeWindow");
      const recipeWindowContent = document.getElementById(
        "recipeWindowContent"
      );
      // recipeWindowContent.innerHTML = ""
      const closeRecipeWindowBtn = document.getElementById(
        "closeRecipeWindowBtn"
      );

      // recipeWindow.removeAttribute("style")
      // recipeWindow.style.height = "95vh";
      recipeWindow.style.height = "200vh"
      recipeWindow.style.width = "95vw";

      // recipeWindowContent.style.height = "93vh";
      recipeWindowContent.style.height = "fit-content"
      recipeWindowContent.style.width = "93vw";
      recipeWindowContent.style.visibility = "visible";

      closeRecipeWindowBtn.style.visibility = "visible";

      closeRecipeWindowBtn.addEventListener("click", handleCloseRecipeWindow);

      //todo - change this recipetext to data fetched

      const recipeText = document.getElementById("recipeText");
      recipeText.innerHTML = "";

      const recipeName = document.createElement("h2");
      recipeName.textContent = recipeInfo.recipeName;

      const temp = document.createElement("li");
      temp.textContent = `Temp: ${recipeInfo.temperature}`;
      temp.className = "temperatureDivs"

      const time = document.createElement("li");
      time.textContent = `Time: ${recipeInfo.time}`;
      time.className = "timeDivs"

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

      const currentRecipeInstructions = recipeInfo.instructions

      const currentRecipeDescription = recipeInfo.instructions[0]

      const instructions = document.createElement("div");
      instructions.className = "instructionsText";
      instructions.id = "currentRecipeDescription"
      instructions.textContent = currentRecipeDescription;
      instructionsContainer.append(instructions);

      for (let i = 1; i < currentRecipeInstructions.length; i++) {
        const instructionsRow = document.createElement("div")
        instructionsRow.className = "instructionsRows"

        const instructionsCheckbox = document.createElement("input")
        instructionsCheckbox.type = "checkbox"
        instructionsCheckbox.className = "instructionsCheckboxes"
        instructionsCheckbox.addEventListener("click", handleInstructionsStepClick)

        const instructions = document.createElement("div");
        instructions.className = "instructionsText";
        instructions.textContent = `Step ${i}: ${currentRecipeInstructions[i]}`
        instructions.style.textDecoration = "none";
        instructionsRow.append(instructionsCheckbox, instructions)

        instructionsContainer.append(instructionsRow);

        function handleInstructionsStepClick () {
          if (instructions.style.textDecoration === "line-through") {
            instructions.style.textDecoration = "none";
            instructions.style.color = "white";

          } else if (instructions.style.textDecoration === "none") {
            instructions.style.textDecoration = "line-through";
            instructions.style.color = "black"
          }
        }
      }


      // console.log("ingredients: ", ingredients);

      let totalCaloriesAmt = 0

      for (let i = 0; i < ingredients.length; i++) {
        totalCaloriesAmt += Number(ingredients[i].newIngredientCalorieInput)
      }

      // console.log("totalCalories: ",totalCaloriesAmt)
      
      const totalCalories = document.createElement("li")
      totalCalories.id = "totalCalories"
      totalCalories.textContent = `Total Calories: ${totalCaloriesAmt.toLocaleString()}`;

      const noOfServingsInput = document.createElement("input")
      noOfServingsInput.id = "noOfServingsInput";
      noOfServingsInput.value = recipeInfo.numberOfServings;
      noOfServingsInput.type = "number"
      noOfServingsInput.min = "1"
      noOfServingsInput.addEventListener("change", handleNoOfServingsChange)

      function handleNoOfServingsChange () {
        // console.log("totalCaloriesAmt: ", totalCaloriesAmt)
        // console.log("noOfServingsInput.value: ", noOfServingsInput.value)
        if (noOfServingsInput.value < 1) {
          noOfServingsInput.value = 1;
          return;
        }
        const calsPerServing = (totalCaloriesAmt / noOfServingsInput.value).toFixed(0)
        document.getElementById("caloriesPerServing").textContent =  `Calories Per Serving: ${calsPerServing}`
      }

      // console.log("recipeInfo: ", recipeInfo)
      const caloriesPerServing = document.createElement("li")
      caloriesPerServing.id = "caloriesPerServing"

      const calsPerServing = (totalCaloriesAmt / noOfServingsInput.value).toFixed(0)
      caloriesPerServing.textContent = `Calories Per Serving: ${calsPerServing}`


      

      const numberOfServings = document.createElement("li")
      numberOfServings.id = "numberOfServings";
      numberOfServings.textContent = "Number of servings: "
      numberOfServings.append(noOfServingsInput)

      // const noOfServings = recipeInfo.numberOfServings;
      // numberOfServings.textContent = `Number of Servings: ${noOfServings}`

      const generalRecipeInfo = document.createElement("ul")
      generalRecipeInfo.id = "generalRecipeInfo";
      generalRecipeInfo.append(temp, time, totalCalories, numberOfServings, caloriesPerServing)

      recipeText.append(recipeName, generalRecipeInfo,listContainer);
      document
        .getElementById("recipeWindowContent")
        .append(instructionsContainer);
      /* 
        <div>Recipe Name Here</div>
          <div>Temp</div>
          <div>Time</div>
          <ul>
            <li>Ingredient 1</li>
            <li>Ingredient 2</li>
          </ul>
          <div id="instructions">

          </div>
      */
    }

    recipeCheckbox.addEventListener("click", handleRecipeCheckboxClick);

    function handleCloseRecipeWindow() {
      document.getElementById("instructionsContainer")?.remove();
      recipeWindow.style.height = "0";
      recipeWindow.style.width = "0";

      recipeWindowContent.style.height = "0";
      recipeWindowContent.style.width = "0";
      recipeWindowContent.style.visibility = "hidden";

      closeRecipeWindowBtn.style.visibility = "hidden";
      closeRecipeWindowBtn.removeEventListener(
        "click",
        handleCloseRecipeWindow
      );
    }

    function handleRecipeCheckboxClick() {
      if (entry.style.textDecoration === "line-through") {
        entry.style.textDecoration = "none";
      } else if (entry.style.textDecoration === "none") {
        entry.style.textDecoration = "line-through";
      }
    }

    function handleRecipeClick() {
      const recipeTableBody = document.getElementById("recipeTableBody");
      recipeTableBody.innerHTML = "";

      document.getElementById("recipeInstructionsInputField")?.remove();
      document.getElementById("newIngredientGrid")?.remove();
      document
        .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
        ?.remove();
      document.getElementById("newRecipeInputBtn")?.remove();

      const recipeStepRows = document.getElementsByClassName("recipeStepRows")

      for (let i = recipeStepRows.length -1; i >= 0; i--) {
        recipeStepRows[i].remove()
      }
      
      const checkboxHeader = document.createElement("th");
      checkboxHeader.textContent = "Select";

      const ingredientHeader = document.createElement("th");
      ingredientHeader.textContent = "Ingredient";

      recipe.ingredients.map((item) => {
        console.log(
          "item: ",
          item.amount,
          item.measurementUnit,
          item.name,
          item.newIngredientCalorieInput
        );

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
        mainContent.append(check);
        mainContent.append(ingredient);
        recipeTableBody.append(mainContent);

        checkBox.addEventListener("click", handleIngredientListCheckboxClick);

        function handleIngredientListCheckboxClick() {
          if (ingredient.style.textDecoration === "line-through") {
            ingredient.style.textDecoration = "none";
          } else if (ingredient.style.textDecoration === "none") {
            ingredient.style.textDecoration = "line-through";
          }
        }
      });

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
        .getElementById("recipeItem")
        .append(addRecipeIngredientsToShoppingListBtnContainer);
      document
        .getElementById("addRecipeIngredientsToShoppingListBtnContainer")
        .append(addRecipeIngredientsToShoppingListBtn);
    }
  });
}

const getKnownRecipeIngredients = async (ingredientInputForm) => {
  const URL = `${serverURL}/recipeingredient/`;

  const res = await fetch(URL, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  const fetchedIngredients = data.getAllRecipeIngredients;

  // for (let i = 0; i < fetchedIngredients.length; i++) {
  //   console.log(fetchedIngredients[i].recipeIngredientName);
  // }

  if (fetchedIngredients) {
    let ingredientDataList = document.createElement("datalist");
    ingredientDataList.id = "ingredientOptions";
    // document.getElementById("newIngredientInput")?.remove()
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
  // button.style.backgroundColor = "black"
  // button.style.color = "white"
  // button.textContent = "Submitting"
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
