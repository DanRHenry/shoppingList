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
// const serverURL = "http://127.0.0.1:3498";

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
async function handleNewRecipeIngredientSubmit(e) {
  await e.preventDefault();

  const nameInput = document.getElementById("newRecipeNameInput").value;
  const timeInput = document.getElementById("recipeCookTimeInputField").value;
  const temperatureInput = document.getElementById("recipeTempInputField").value;
  const recipeInstructionsInput = document.getElementById("recipeInstructionsInputField").value;


  const ingredients = document.getElementsByClassName("ingredients");

  const ingredientValues = [];

  for (let item of ingredients) {
    if (item.value.length > 0) {
      ingredientValues.push(item.value);
    }
  }

  await postNewRecipe(nameInput, ingredientValues);
  console.log(nameInput);
  // setTimeout(() => {
  // await populateRecipeList();

  //todo remove this, it doesn't seem to link to anything anymore
  // const recipeIngredients = document.getElementById("recipeIngredients");
  // // recipeIngredients.innerHTML = `<div>${nameInput.value} Created</div>`
  // // setTimeout(() => {
  // recipeIngredients.innerHTML = "";

  //todo remove the above

  // }, 3000);
  // }, 100);
  // nameInput.value = "";
  for (let item of ingredients) item.value = "";
  console.log("submitted");
  await populateRecipeList();

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
    //todo if the ingredient is found, populate the information on unit and calories, which can then be converted to the actual units and quantities used

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
  deleteRecipeBtn.textContent = "Delete Selected";
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
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  async function handleNewRecipeClick() {
    if (document.getElementById("addRecipeIngredientsToShoppingListBtn")) {
      document.getElementById("addRecipeIngredientsToShoppingListBtn").remove();
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
    newRecipeNameInput.placeholder = "New Recipe Name";
    newRecipeNameInput.required = true;

    // const ingredientInputContainer = document.createElement("div");
    // ingredientInputContainer.className = "ingredientInputContainer";

    const newIngredientInput = document.createElement("input");
    newIngredientInput.type = "text";
    newIngredientInput.className = "newIngredients";
    newIngredientInput.id = "newIngredientInput";
    newIngredientInput.setAttribute("list", "ingredientOptions");
    newIngredientInput.placeholder = "Ingredient Name";
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

    function handleIngredientInputSubmit (e) {
      e.preventDefault()
      const ingredientNameInput = document.getElementById("newIngredientInput");
      const ingredientAmtInput = document.getElementById("newIngredientAmtInput");
      const measurementUnitInput = document.getElementById("measurementUnitInput");
      const newIngredientCalorieInput = document.getElementById("newIngredientCalorieInput");
      if (ingredientNameInput.value && ingredientAmtInput.value && measurementUnitInput.value && newIngredientCalorieInput.value)
      {
        //todo push this information to the ingredients array that will be sent to the back end when the recipe is actually submitted
        console.log(ingredientNameInput.value, ingredientAmtInput.value, measurementUnitInput.value, newIngredientCalorieInput.value) 
        //todo - create tne new input line
        //todo - remove the ids for the fields that had been submitted
      } else { 
        console.log("missing input")
      
    }
    }


    newIngredientFieldBtn.textContent = "+";

    // ingredientInputContainer.append(newIngredientInput, newIngredientFieldBtn);

    const recipeCookTimeInputField = document.createElement("input");
    recipeCookTimeInputField.type = "string";
    recipeCookTimeInputField.id = "recipeCookTimeInputField";
    recipeCookTimeInputField.placeholder = "Time to Make";

    const recipeTempInputField = document.createElement("input");
    recipeTempInputField.type = "string";
    recipeTempInputField.id = "recipeTempInputField";
    recipeTempInputField.placeholder = "Temperature";

    const recipeInstructionsInputField = document.createElement("textarea");
    recipeInstructionsInputField.id = "recipeInstructionsInputField";
    recipeInstructionsInputField.placeholder = "Instructions";
    if (document.getElementById("ingredientInputForm")) {
      document
        .getElementById("addRecipeIngredientsToShoppingListBtn")
        ?.remove();
    }
    const measurementUnit = document.createElement("input");
    measurementUnit.setAttribute("list", "unitOptions");
    measurementUnit.className = "measurementUnit";
    measurementUnit.id = "measurementUnitInput" //todo - remove this when adding a new ingredient line
    measurementUnit.placeholder = "unit";

    const unitOptionsDataList = document.createElement("datalist");
    unitOptionsDataList.id = "unitOptions";

    const unitOptions = ["tsp", "tbsp", "fl oz", "cup", "pint", "qt", "gal"];

    unitOptions.map((unit) => {
      const option = document.createElement("option");
      option.value = unit;
      unitOptionsDataList.append(option);
    });

    const ingredientDataList = document.createElement("datalist");
    ingredientDataList.id = "ingredientOptions";

    const unitOption = document.createElement("option");

    const ingredientOption = document.createElement("option");
    ingredientOption.value = "Lettuce"; //todo - populate this with the list of ingredients from all recipes

    const newRecipeInputBtn = document.createElement("input");
    newRecipeInputBtn.type = "submit";
    newRecipeInputBtn.id = "newRecipeInputBtn";
    newRecipeInputBtn.addEventListener(
      "click",
      handleNewRecipeIngredientSubmit
    );

    const newIngredientAmtInputs = document.createElement("input");
    newIngredientAmtInputs.placeholder = "qty";
    newIngredientAmtInputs.type = "number";
    newIngredientAmtInputs.className = "newIngredientAmtInputs";
    newIngredientAmtInputs.min = 0;
    newIngredientAmtInputs.id = "newIngredientAmtInput"

    const newIngredientCalorieInputs = document.createElement("input");
    newIngredientCalorieInputs.className = "newIngredientCalorieInputs";
    newIngredientCalorieInputs.placeholder = "Cal";
    newIngredientCalorieInputs.id = "newIngredientCalorieInput"

    const newIngredientContainer = document.createElement("tr");
    newIngredientContainer.id = "newIngredientContainer";

      newIngredientContainer.append(
      newIngredientInput,
      newIngredientAmtInputs,
      measurementUnit,
      newIngredientCalorieInputs,
      newIngredientFieldBtn
    );

    ingredientInputForm.append(
      unitOption,
      unitOptionsDataList,
      newRecipeNameInput,
      ingredientDataList
    );

    recipeTableBody.append(
      newIngredientContainer,
      recipeInstructionsInputField
    );

    unitOptionsDataList.append(unitOption);
    ingredientDataList.append(ingredientOption);

    const timeAndTemp = document.createElement("div");
    timeAndTemp.id = "timeAndTemp";
    timeAndTemp.append(recipeCookTimeInputField, recipeTempInputField);

    ingredient.append(
      ingredientInputForm,
      timeAndTemp
    );

    const ingredientInput = document.getElementById("newIngredientInput")
    console.log(ingredientInput.textContent)
    ingredientInput.addEventListener("change", async () => {
      // console.log(ingredientInput.textContent)
      console.log(ingredientInput)
      console.log("checking for ingredient response:",await checkForExistingIngredient(ingredientInput.textContent))

    })
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
    entry.addEventListener("click", handleEntryClick);

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

    async function handleShowRecipeClick() {
      const recipeWindow = document.getElementById("recipeWindow");
      const recipeWindowContent = document.getElementById(
        "recipeWindowContent"
      );
      // recipeWindowContent.innerHTML = ""
      const closeRecipeWindowBtn = document.getElementById(
        "closeRecipeWindowBtn"
      );

      recipeWindow.style.height = "95%";
      recipeWindow.style.width = "95%";

      recipeWindowContent.style.height = "93%";
      recipeWindowContent.style.width = "93%";
      recipeWindowContent.style.visibility = "visible";

      closeRecipeWindowBtn.style.visibility = "visible";

      closeRecipeWindowBtn.addEventListener("click", handleCloseRecipeWindow);

      //todo - change this recipetext to data fetched

      const recipeText = document.getElementById("recipeText");
      recipeText.innerHTML = ''

      const recipeName = document.createElement("div");
      recipeName.textContent = "Recipe Name Here";

      const temp = document.createElement("div");
      temp.textContent = "Temp...";

      const time = document.createElement("div");
      time.textContent = "Time...";

      const listContainer = document.createElement("div");
      listContainer.id = "listContainer";

      const column_one = document.createElement("ul");
      column_one.className = "recipeIngredientsColumns";
      column_one.id = "recipeIngredientsColumn_1";

      const column_two = document.createElement("ul");
      column_two.className = "recipeIngredientsColumns";
      column_two.id = "recipeIngredientsColumn_2";

      const ingredient_one = document.createElement("li");
      ingredient_one.textContent = "Ingredient 1";

      const ingredient_two = document.createElement("li");
      ingredient_two.textContent = "Ingredient 2";

      const ingredient_three = document.createElement("li");
      ingredient_three.textContent = "Ingredient 3";

      const ingredient_four = document.createElement("li");
      ingredient_four.textContent = "Ingredient 4";

      column_one.append(ingredient_one, ingredient_two);
      column_two.append(ingredient_three, ingredient_four);

      listContainer.append(column_one, column_two);

      const instructions = document.createElement("div");
      instructions.id = "instructions";
      instructions.textContent = `Instruction text Here: Lorem ipsum dolor sit, amet consectetur
            adipisicing elit. Repellat consequuntur minus sapiente perspiciatis
            deleniti magnam illo eius ut corporis, vitae voluptatibus adipisci
            obcaecati ea beatae? Iusto, debitis voluptas in totam, voluptatem
            unde sunt ullam provident reiciendis nulla inventore, aspernatur at!
            Explicabo dolores harum inventore voluptatibus consectetur eaque
            nemo repudiandae laboriosam optio. Nulla consectetur, nesciunt
            magnam laborum consequatur mollitia, numquam explicabo molestias,
            repudiandae praesentium recusandae atque aspernatur laboriosam!
            Voluptas, dicta perferendis non quisquam hic doloremque alias? Quos
            repellendus voluptatem sequi in voluptatibus dolores odio nisi
            facilis numquam fugit expedita eum sed eos rerum officiis nesciunt
            molestias accusamus pariatur dignissimos, saepe facere! Optio aut
            mollitia magnam facilis quod exercitationem, minus placeat
            distinctio aliquam, iure cum autem? Quaerat iure cum voluptatum.
            Alias unde, molestias ipsam aperiam suscipit nam explicabo, ut
            provident, nihil voluptatibus tempore assumenda ipsa quos sunt. Id
            rerum deleniti obcaecati, eius ipsum, quos dolorem temporibus labore
            at quam veniam sunt recusandae necessitatibus voluptate excepturi
            eveniet earum. Esse ad, autem inventore architecto error temporibus
            praesentium dicta, libero placeat dolorum at laboriosam vitae,
            deleniti nesciunt? Nihil culpa fugiat perferendis eaque obcaecati
            laudantium, placeat possimus fugit accusantium unde cumque
            temporibus quidem nemo earum rem iste sunt exercitationem tenetur
            nulla reprehenderit beatae impedit architecto nobis. Lorem ipsum
            dolor sit amet consectetur adipisicing elit. Optio enim in
            cupiditate architecto vero deserunt dicta laudantium voluptatibus,
            consectetur excepturi? Dolorem, laborum quod ab veritatis eos, autem
            deleniti quasi id, error maiores reprehenderit eaque labore maxime
            facere vero molestiae quibusdam corrupti asperiores ipsum velit quae
            repellat? Tempore eum sapiente quam maiores ad dicta, expedita
            nostrum adipisci labore dolore molestias velit maxime doloremque
            vel? Sapiente dicta culpa eligendi deserunt delectus harum ab
            dignissimos officiis voluptatibus, eum debitis quo impedit,
            excepturi amet reprehenderit ut illum quidem expedita ullam? At
            ipsa, esse atque rerum culpa accusamus quaerat alias voluptatem
            consectetur mollitia voluptas odio dignissimos nam corporis ducimus
            earum, unde nulla expedita inventore, dolores doloribus maxime! Vel,
            quisquam. Quam blanditiis magnam illum veritatis dolore, odit saepe
            tenetur eaque optio perspiciatis quas velit vel veniam hic vitae
            harum rerum eius accusamus laboriosam excepturi repellendus dolorum,
            nisi nihil! Voluptates deleniti quod tempora iste consectetur
            incidunt voluptatum veniam quidem, atque voluptas, perspiciatis
            sequi totam exercitationem magnam ratione blanditiis eligendi error
            nulla quam, ad et cupiditate in velit. Architecto eligendi quis,
            autem nulla impedit similique reprehenderit necessitatibus dolorem
            consectetur blanditiis laborum corrupti iste numquam sapiente saepe
            incidunt officia beatae voluptates. Deserunt perspiciatis quia, ut
            ipsa labore illo dicta!`;

      
      recipeText.append(recipeName, temp, time, listContainer, instructions);

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

    function handleEntryClick() {
      const recipeTableBody = document.getElementById("recipeTableBody");
      recipeTableBody.innerHTML = "";

      // const recipeHeaders = document.createElement("tr");

      const checkboxHeader = document.createElement("th");
      checkboxHeader.textContent = "Select";

      const ingredientHeader = document.createElement("th");
      ingredientHeader.textContent = "Ingredient";

      //   recipeHeaders.append(checkboxHeader, ingredientHeader);

      // recipeTableBody.append(recipeHeaders);
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
