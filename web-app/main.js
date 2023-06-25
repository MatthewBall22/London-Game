//import R from "./ramda.js";
import LondonGame from "./london-game.js";

const titlePage = document.getElementById("title-container");
const configurationPage = document.getElementById("configuration-container");
const startGameButton = document.getElementById("configuration-start-button");
const gamePage = document.getElementById("game-container");
const titleButtons = document.getElementById("title-button-container");
const playButton = document.getElementById("title-play-button");
const playerContainer = document.getElementById("player-configuration-nodes");
const playerNode = document.querySelector(".player-select");
const slider = document.getElementById("num-players-slider");
const playersPanel = document.getElementById("players-panel");
const infoPanelName = document.getElementById("current-player-name");
const currentLineName = document.getElementById("current-tube-line");
const cardContainer = document.querySelector(".destination-card-container");
const dialogContainer = document.getElementById("game-dialog-container");
const tubeLineText = document.getElementById("tube-line-container");
const actionsPanel = document.getElementById("actions-panel");
const rollDiceElement = document.getElementById("action-roll-dice");
const changeElement = document.getElementById("action-change-stations");
const manageElement = document.getElementById("action-manage-stations");
const actionElements = document.getElementsByClassName("actions");
const diceElement = document.getElementById("dice");
let closeCard = null;
let openCard = null;
const closeStationCardContainer = document.querySelector(
    ".close-station-card-container"
);
const openStationCardContainer = document.querySelector(
    ".open-station-card-container"
);
const cardsPanel = document.getElementById("cards-panel");
const PlayerImageSources = [
    "./assets/player-a-glyph.svg",
    "./assets/player-b-glyph.svg",
    "./assets/player-c-glyph.svg",
    "./assets/player-d-glyph.svg"
];
let PlayerImageSourcesCopy = [...PlayerImageSources];
let InputPlayerNames = new Map();
let stations = [];
let platforms = [];
let stationNodes = [];
let trainStations = [];
let trainStationPlatforms = [];
/* stationNodes are a collection of platforms at a station that are
at the same place on the board*/
let stationNames = new Map();
//displayed names for each station
let board = null;
let GameState = {
    number_of_players: 0,
    game_phase: "configuration",
    player: 0,
    player_name: "",
    open_nodes: [],
    player_locations: {},
    player_lines: {},
    destinations: {},
    starting_stations: {},
    close_station_cards: {},
    open_station_cards: {},
    destinations_per_player: 5,
    close_station_per_player: 3,
    open_station_per_player: 1,
    closing_nodes: false,
    opening_nodes: false
};

const displayPage = function (page) {
    page.setAttribute("style", "display:block");
};

const hidePage = function (page) {
    page.setAttribute("style", "display:none");
};

window.addEventListener("load", function () {
    displayPage(titlePage);
    hidePage(gamePage);
    //ensure correct pages are displayed upon load
    setTitleBackgroundPlayers();
    addPlayerNodes(slider.value);
    //set number of players for configuration screen
});

const setTitleBackgroundPlayers = function () {
    const backgroundImg = document.getElementById("title-background-img");
    const backgroundImgDoc = backgroundImg.contentDocument; //inner svg file
    backgroundImgDoc.addEventListener("click", function () {
        hidePage(configurationPage);
        displayPage(titleButtons);
        //allow user to return to title page by clicking on it
    });
    const backgroundPlayers = backgroundImgDoc.getElementsByClassName(
        "player" //defined within title-screen-background.svg
    );
    const backgroundPlayersArr = Array.from(backgroundPlayers);
    backgroundPlayersArr.forEach(function (ev) {
        setHoverBehaviour(ev, "jump-animation");
        //add animation to each background character on hover
    });
};

const setHoverBehaviour = function (element, className) {
    //mimicks hover pseudo class for svg elements
    element.addEventListener("mouseenter", function mouseEnterBehaviour() {
        element.classList.add(className);
    });
    element.addEventListener("mouseleave", function mouseExitBehaviour() {
        element.classList.remove(className);
    });
};

playButton.onclick = function () {
    displayPage(configurationPage);
    hidePage(titleButtons);
};

const getDocElement = function (element, id) {
    const contentDocument = element.contentDocument;
    const innerElement = contentDocument.getElementById(id);
    return innerElement;
};

const attachText = function (element, map, index) {
    element.textContent = map.get(`${index}`);
};

slider.addEventListener("input", function () {//listen to slider changes
    addPlayerNodes(slider.value);
});

slider.addEventListener("click", function () {//listen to slider changes
    addPlayerNodes(slider.value);
});

const addPlayerNodes = function (sliderValue) {
    //allow user to select number of players using slider
    while (playerContainer.childElementCount < sliderValue) {
        const clonedPlayerNode = playerNode.cloneNode(true);
        //clone placeholder player node from HTML
        clonedPlayerNode.setAttribute("style", "display:flex");
        //update label and input for accessibility
        const label = clonedPlayerNode.querySelector("label");
        const newId = playerContainer.childElementCount + 1;
        const nameInput = clonedPlayerNode.querySelector("input");
        nameInput.id = newId;
        //set new id for each element created
        label.setAttribute("for", newId);
        playerContainer.appendChild(clonedPlayerNode);
        //add player node to container
        initialisePlayerImage(clonedPlayerNode);
    }
    while (playerContainer.childElementCount > sliderValue) {
        //remove nodes if more player nodes than slider value
        const lastPlayer = playerContainer.lastElementChild;
        const lastPlayerImage = lastPlayer.querySelector(".player-glyph");
        const lastPlayerImageData = lastPlayerImage.getAttribute("data");
        PlayerImageSourcesCopy.push(lastPlayerImageData);
        //add player back into array so character can be reused
        playerContainer.removeChild(lastPlayer);
    }
    GameState.number_of_players = Number(sliderValue);
};

const initialisePlayerImage = function (node) {
    //set name, Image, and other properties for player
    const playerName = node.getElementsByClassName("player-name")[0];
    const placeholderName = `Player ${
        Array.from(playerContainer.children).indexOf(node) + 1
    }`;
    playerName.placeholder = placeholderName;
    //set placeholder player name
    const playerImage = node.querySelector(".player-glyph");
    const playerImageSelect = LondonGame.randomItem(PlayerImageSourcesCopy);
    //pick random image source
    playerImage.setAttribute("data", playerImageSelect);
    //set source based on random key
    const selectedIndex = PlayerImageSourcesCopy.indexOf(playerImageSelect);
    const player = PlayerImageSources.indexOf(playerImageSelect);
    setPlayerBorderColor(selectedIndex, node, PlayerImageSourcesCopy);
    if (selectedIndex !== -1) {
        PlayerImageSourcesCopy.splice(selectedIndex, 1);
    }
    //remove item from array to avoid repeated player images
    allowPlayerImageChange(playerImage, playerName, player);
};

const setPlayerBorderColor = function (index, node, imageSource) {
    const playerImageLink = imageSource[index];
    const playerLetter = playerImageLink.split("-glyph")[0].split("player-")[1];
    //find the relevant player number
    node.className = "player-select";
    node.firstElementChild.className = "player-glyph";
    node.classList.add(`player-${playerLetter}`);
    node.firstElementChild.classList.add(`player-${playerLetter}`);
    //set the class of the container element to update the style
};

const allowPlayerImageChange = function (playerImage, playerName, i) {
    //initialise events for the player image to change its name and style
    playerImage.addEventListener("load", function () {
        const submitButton = playerImage.nextElementSibling.querySelector(
            ".set-name-button"
        );
        const innerTextElement = getDocElement(playerImage, "inner-text");
        const playerIndex = playerName.placeholder.replace("Player ", "");
        attachText(innerTextElement, InputPlayerNames, playerIndex);
        const selectionArrows = getDocElement(playerImage, "selection-arrows");
        updatePlayerNamesList(innerTextElement, playerName);
        //set initial name before one is provided
        submitButton.addEventListener("click", function () {
            updatePlayerNamesList(innerTextElement, playerName);
            //update name if submit button is pressed
            attachText(innerTextElement, InputPlayerNames, playerIndex);
        });
        selectionArrows.addEventListener("mousedown", function (ev) {
            if (ev.target.classList.contains("left")) {
                i = i + PlayerImageSources.length - 1;
            } else {
                i = i + 1;
            }
            changePlayerImage(i, playerImage);
        });
        const playerImageDoc = playerImage.contentDocument;
        playerImageDoc.addEventListener("focus", function () {
            playerImageDoc.addEventListener("keydown", function (ev) {
                //add equivalent function to change images with keyboard
                if (ev.key === "ArrowLeft") {
                    i = i + PlayerImageSources.length - 1;
                    changePlayerImage(i, playerImage);
                } else if (ev.key === "ArrowRight") {
                    i = i + 1;
                    changePlayerImage(i, playerImage);
                }
            });
        });
    });
};

const changePlayerImage = function (player, playerImage) {
    //change player image when arrows pressed
    //add or remove from count based on clicked element
    const index = player % PlayerImageSources.length;
    const playerImageSelect = PlayerImageSources[index];
    playerImage.setAttribute("data", playerImageSelect);
    setPlayerBorderColor(
        index,
        playerImage.parentElement,
        PlayerImageSources
    );
};

const updatePlayerNamesList = function (element, input) {
    if (input.value === "") {
        element.textContent = input.placeholder;
        //set to placeholder if no text content
    } else {
        element.textContent = input.value;
        //set to input value if text content entered
    }
    const playerIndex = input.placeholder.replace("Player ", "");
    InputPlayerNames.set(playerIndex, element.textContent);
    //update player names list so inner text content matches input
};

const movePlayerImages = function () {
    //select all the configured children and move to the gameplay screen
    let i = 1;
    Array.from(playerContainer.querySelectorAll(".player-glyph")).forEach(
        function (playerImage) {
            //loop through all existing player images
            const inGamePlayer = playerImage.cloneNode(true);
            inGamePlayer.classList.add("greyscale");
            playersPanel.appendChild(inGamePlayer);
            inGamePlayer.addEventListener("load", function () {
                const arrows = getDocElement(inGamePlayer, "selection-arrows");
                hidePage(arrows);
                //remove arrows from svg image
                const innerTextElement = getDocElement(
                    inGamePlayer,
                    "inner-text"
                );
                attachText(innerTextElement, InputPlayerNames, i);
                //attach names set in the configuration page
                i = i + 1;
                //increase counter for each player image
            });
        }
    );
};

startGameButton.onclick = function () {
    //setup the gameplay and initialise the GameState object
    movePlayerImages();
    hidePage(titlePage);
    hidePage(configurationPage);
    displayPage(gamePage);
    GameState.player = 1;
    board = document.getElementById("board").contentDocument;
    initialiseStations();
    animateActionText();
    setButtonActions([false, false, false]);
    addActionEventListeners([false, false, false]);
    //add all the stations to an array
    let stationsCopy = [...stations]; //RETURNS NULL
    InputPlayerNames.forEach(function (value, name) {
        //create destinations list for all players
        const stationsList = LondonGame.addDestinations(
            stationsCopy,
            LondonGame.integerArray(GameState.destinations_per_player)
        );
        GameState.destinations[name] = stationsList;
    });
    setTimeout(function () {
        //content must have time to load before dealing the cards
        initialDealCards();
        showActivePlayerCards(GameState.player);
    }, 50);
    //set active player to 1
    updateInfoPanel(GameState.player);
    cardsPanel.addEventListener("mouseenter", cardPanelScrollAdjust);
    cardsPanel.addEventListener("mouseexit", cardPanelScrollAdjust);
    window.addEventListener("resize", cardPanelScrollAdjust);
    //add event listeners to ensure cards never go off screen
    GameState.open_nodes = [...stationNodes];
    //set all the stations to open
    selectInitialTrainStation(GameState.number_of_players);
};

const setButtonActions = function (array) {
    //set which action buttons can be pressed
    array.forEach(function (element, index) {
        const selectedElement = actionsPanel.children[index];
        if (element) {
            selectedElement.classList.remove("greyscale");
            selectedElement.setAttribute("style", "pointer-events:all");
        } else {
            selectedElement.classList.add("greyscale");
            selectedElement.setAttribute("style", "pointer-events:none");
        }
    });
};

const showDialog = function (text) {
    const dialogChildren = dialogContainer.children;
    let firstElementChild = true;
    Array.from(dialogChildren).forEach(function (childElement) {
        if (firstElementChild) {
            firstElementChild = false;
        } else {
            childElement.remove();
            //remove all but first child
        }
    });
    const dialogText = document.getElementById("game-dialog-text");
    dialogText.textContent = text;
    dialogContainer.classList.remove("low-opacity");
    displayPage(dialogContainer);
};

const makeDialogSticky = function () {
    board.removeEventListener("click", toggleDialogOpacity);
    board.removeEventListener("click", dialogueHandleFirstClick);
    //reset event handlers
    dialogContainer.classList.remove("animated-game-dialog");
    dialogContainer.classList.add("sticky-dialog");
    dialogContainer.classList.remove("low-opacity");
    board.addEventListener("click", dialogueHandleFirstClick);
};

const dialogueHandleFirstClick = function () {
    //ensure event does not fire as soon as it is created
    board.addEventListener("click", toggleDialogOpacity);
};

const toggleDialogOpacity = function () {
    //allow dialog opacity to be toggled
    dialogContainer.classList.toggle("low-opacity");
};

const makeDialogAnimated = function () {
    dialogContainer.classList.add("animated-game-dialog");
    dialogContainer.classList.remove("sticky-dialog");
    board.removeEventListener("click", toggleDialogOpacity);
    board.removeEventListener("click", dialogueHandleFirstClick);
};

const initialDealCards = function () {
    //loop through all the destion cards for each player
    LondonGame.integerArray(GameState.number_of_players).forEach(
        function (player) {
            GameState.destinations[player].forEach(function (destination) {
                //deal destination cards
                dealCard(player, destination);
            });
            dealSpecialCard(
                player,
                GameState.close_station_per_player,
                GameState.close_station_cards
            );
            dealSpecialCard(
                player,
                GameState.open_station_per_player,
                GameState.open_station_cards
            );
        }
    );
};

const dealSpecialCard = function (player, count, type) {
    //deal close station cards to a given player
    let cardCount = type[player];
    let specialCard = null;
    if (cardCount === undefined) {
        //add the card to the document if none exists
        let newCard = (
            type === GameState.close_station_cards
            ? closeStationCardContainer.firstElementChild
            : openStationCardContainer.firstElementChild
        );
        cardCount = 0;
        const newCardContainer = (
            type === GameState.close_station_cards
            ? closeStationCardContainer.cloneNode(true)
            : openStationCardContainer.cloneNode(true)
        );
        newCardContainer.classList.add(`player-${player}-card`);
        cardsPanel.appendChild(newCardContainer);
        newCard = newCardContainer.firstElementChild;
        const openOrClose = newCard.classList[0].replace("-station-card", "");
        newCard.id = `player-${player}-${openOrClose}-station-card`;
        newCard.addEventListener("load", function () {
            updateSpecialCard(newCard, count, player);
        });
    } else {
        //update the card if it already exits
        specialCard = (
            type === GameState.close_station_cards
            ? document.querySelector(`#player-${player}-close-station-card`)
            : document.querySelector(`#player-${player}-open-station-card`)
        );
        displayPage(specialCard.parentElement);
        displayPage(specialCard);
        updateSpecialCard(specialCard, count + cardCount, player);
    }
    type[player] = count + cardCount;
    Array.from(cardsPanel.querySelectorAll(`.player-${player}-card`)).forEach(
        function (cardDiv) {
            displayPage(cardDiv);
        }
    );
    //update game state to reflect number of cards per player
    if (count + cardCount === 0) {
        console.log("trying to hide");
        //remove card if total number of cards is zero
        specialCard = (
            type === GameState.close_station_cards
            ? document.querySelector(`#player-${player}-close-station-card`)
            : document.querySelector(`#player-${player}-open-station-card`)
        );
        hidePage(specialCard.parentElement);
        hidePage(specialCard);
        return false;
    }
    return true;
};

const updateSpecialCard = function (card, count) {
    //card.id = `player-${player}-${type}-station-card`;
    //change the text on the special cards to indicate the number of cards
    const closeCardDoc = card.contentDocument;
    const textCircle = closeCardDoc.getElementById("text-container");
    if (count === 1) {
        textCircle.classList.add("hidden");
    } else {
        textCircle.classList.remove("hidden");
        const innerText = closeCardDoc.getElementById("inner-text");
        innerText.textContent = (`x${count}`);
        //set text to show how many cards the player has in total
    }
};

const dealCard = function (player, destination) {
    const newCardContainer = cardContainer.cloneNode(true);
    //add a new destination card element for the specified player
    newCardContainer.classList.add(`player-${player}-card`);
    //add a class list to identify the card
    const newDestinationCard = newCardContainer.firstElementChild;
    newDestinationCard.addEventListener("load", function () {
        //wait for inner document to load
        const cardDocument = newDestinationCard.contentDocument;
        const innerTextElement = cardDocument.getElementById("inner-text");
        const destinationName = LondonGame.getStationName(destination);
        if (destinationName.length > 18) {
            //set smaller font size for long station names
            innerTextElement.classList.add("small-text");
        }
        innerTextElement.textContent = destinationName.toUpperCase();
        //set the text content of the element
    });
    newDestinationCard.id = destination;
    newDestinationCard.setAttribute("aria-label", destination + "-card");
    const textId = destination.replace("-station", "") + "-text";
    const boardStationTextElement = board.getElementById(textId);
    //find the text on the map that matches with the destination card
    newDestinationCard.addEventListener("mouseenter", function () {
        boardStationTextElement.classList.add("active");
    });
    newDestinationCard.addEventListener("mouseleave", function () {
        boardStationTextElement.classList.remove("active");
    });
    cardsPanel.appendChild(newCardContainer);
};

const updateCards = function (player, destinations) {
    //checks if any player destinations have been reached
    const playerDestinations = destinations[player];
    const playerDestinationCards = cardsPanel.querySelectorAll(
        `.player-${player}-card > .destination-card`
    );
    let removedCard = null;
    Array.from(playerDestinationCards).forEach(function (destinationCard) {
        if (!playerDestinations.includes(destinationCard.id)) {
            removedCard = destinationCard.id;
        }
    });
    return removedCard;
};

const showActivePlayerCards = function (player) {
    //show card in UI for active player only
    Array.from(cardsPanel.children).forEach(function (card) {
        if (card.classList.contains(`player-${player}-card`)) {
            displayPage(card);
        } else {
            hidePage(card);
        }
    });
};

const initialiseStations = function () {
    const platformElements = board.getElementsByClassName("station");
    const trainStationElements = board.getElementsByClassName("train-station");
    Array.from(trainStationElements).forEach(function (platformElement) {
        //add all the platforms of train station elements
        if (platformElement.classList.contains("train-station")) {
            trainStations = LondonGame.addToArray(
                trainStations,
                platformElement.classList[0]
            );
        }
    });
    Array.from(trainStations).forEach(function (station) {
        const trainStationPlatform = board.getElementsByClassName(station)[0];
        trainStationPlatforms.push(trainStationPlatform.id);
    });
    Array.from(platformElements).forEach(function (platformElement) {
        const platform = platformElement.id;
        const station = platformElement.classList[0];
        const stationNode = platformElement.classList[1];
        stations = LondonGame.addToArray(stations, station);
        platforms = LondonGame.addToArray(platforms, platform);
        stationNodes = LondonGame.addToArray(stationNodes, stationNode);
        //add all the stations, platforms, and station nodes to arrays
    });
    stations.forEach(function (station) {
        stationNames.set(station, LondonGame.getStationName(station));
    });
};

const findLineFromPlatform = function (platform) {
    if (platform) {
        const container = board.getElementById(platform).parentElement;
        return container.id;
    } else {
        return "None";
    }
};

const selectInitialTrainStation = function () {
    showDialog("Select a starting train station to begin your journey!");
    addPointerArrows(trainStationPlatforms);
};

const appendToBoard = function (element) {
    const boardContainer = board.getElementById("main");
    //find the parent element for board elements
    boardContainer.appendChild(element);
    element.style.opacity = "1";
};

const updateInfoPanel = function (player, line = "none") {
    const lineDisplayName = LondonGame.getStationName(
        line.replace("-line", "")
    );
    //change the active player and line on the info panel
    const activePlayerNode = playersPanel.children[player - 1];
    //find element corresponding to active player
    const activePlayerClass = activePlayerNode.classList[1];
    const activeLocator = board.getElementById(`player-${player}-locator`);
    const playerLocators = board.getElementsByClassName("player-locator-group");
    Array.from(playerLocators).forEach(function (playerLocator) {
        if (playerLocator.id !== "player-locator") {
            playerLocator.classList.add("med-opacity");
        }
    });
    Array.from(playersPanel.children).forEach(function (playerNode) {
        //grey out inactive players
        playerNode.classList.add("greyscale");
    });
    if (activeLocator) {
        //make the active player's locator high opacity and bring to front
        activeLocator.classList.remove("med-opacity");
    }
    activePlayerNode.classList.remove("greyscale");
    infoPanelName.className = activePlayerClass;
    //update the class name of the info panel name to match
    infoPanelName.textContent = getPlayerName(player);
    currentLineName.textContent = lineDisplayName;
    currentLineName.className = line;
};

const getPlayerName = function (player) {
    return InputPlayerNames.get(`${player}`);
};

const addPointerArrows = function (platforms) {
    //create pointer arrows that highlight available platforms to click on
    const pointerArrow = board.getElementById("arrow-selector");
    platforms.forEach(function (platform) {
        const newPointerArrow = pointerArrow.cloneNode(true);
        newPointerArrow.id = `${platform}-pointer`;
        newPointerArrow.setAttribute("tabindex", "0");
        newPointerArrow.setAttribute("role", "button");
        newPointerArrow.setAttribute("aria-label", `${platform}-pointer`);
        const platformElement = board.getElementById(platform);
        appendToBoard(newPointerArrow);
        moveSvgItem(platformElement, newPointerArrow, 960, 545);
        newPointerArrow.addEventListener("click", function (ev) {
            selectPointerArrow(ev.target.parentElement.parentElement);
        }, {once: true});
        newPointerArrow.addEventListener("keydown", function (ev) {
            //allow pointer arrows to be selected with enter key
            if (ev.key === "Enter") {
                selectPointerArrow(ev.target);
            }
        });
    });
};

const selectPointerArrow = function (arrow) {
    //wait for user to click on one of the arrows
    const pointerId = arrow.id;
    const platformName = pointerId.replace("-pointer", "");
    if (!arrow.classList.contains("arrow-selector")) {
        removePointerArrows();
        return;
    }
    if (GameState.game_phase === "configuration") {
        //select a line from starting stations if in config phase
        delayThenDisplay(platformName);
        GameState.starting_stations[
            GameState.player
        ] = stationFromPlatform(platformName);
    } else {
        arrowsClicked(platformName);
    }
};

const arrowsClicked = function (platformName) {
    hidePage(dialogContainer);
    removePointerArrows();
    updatePlayerLocation(GameState.player, platformName);
    //add the line of the player to the game logic
    prepareNextPlayer(platformName);
};

const removePointerArrows = function (exception = null) {
    const pointerArrows = board.getElementsByClassName("arrow-selector");
    Array.from(pointerArrows).forEach(function (arrow) {
        if (arrow.id !== "arrow-selector" && arrow.id !== exception) {
            //the original hidden element and an exception arrow can remain
            arrow.remove();
        }
    });
};

const delayThenDisplay = function (platform) {
    const openPlatforms = getAvailablePlatforms(
        platform,
        GameState.open_nodes
    );
    setTimeout(function () {
        //ensures that openPlatforms returns before looping through platforms
        displayLineDialog(platform, openPlatforms);
    }, 150);

};

const displayLineDialog = function (platform, openPlatforms) {
    //shows the player the available lines that they can move to
    removePointerArrows(`${platform}-pointer`);
    //remove the animation from the game dialog so that it stays on screen
    const availableLines = [];
    openPlatforms.forEach(function (platform) {
        LondonGame.addToArray(availableLines, findLineFromPlatform(platform));
    });
    if (GameState.game_phase === "configuration") {
        if (availableLines.length === 1) {
            //skip past line selection if only one line available
            addPlayerLocator(GameState.player);
            arrowsClicked(platform);
        } else {
            //keep game dialogue static
            showDialog("Select your starting tube line:");
        }
    }
    if (GameState.game_phase === "gameplay") {
        showDialog("Select a line to change to:");
    }
    makeDialogSticky();
    selectLineOption(availableLines, openPlatforms);
    //allow the player to select a line
};

const checkIfConfigComplete = function () {
    if (GameState.player === 1) {
        GameState.game_phase = "gameplay";
        waitForPlay();
    } else {
        selectInitialTrainStation();
    }
};

const updatePlayerLocation = function (player, platform) {
    movePlayerLocator(player, platform);
    //move the player locator to reflect the platform locator
    GameState.player_locations[player] = platform;
    //add the location of the player to the game logic
    GameState.player_lines[player] = (findLineFromPlatform(platform));
};

const selectLineOption = function (lines, platforms) {
    //find available lines from given station
    Array.from(lines).forEach(function (line) {
        if (GameState.game_phase === "gameplay") {
            if (line === GameState.player_lines[GameState.player]) {
                //do not allow player to move to their current line
                return;
            }
        }
        const dialogLineElement = tubeLineText.cloneNode(true);
        //create a new container in the dialog to display available line
        dialogContainer.appendChild(dialogLineElement);
        dialogLineElement.id = `${line}-dialog`;
        dialogLineElement.querySelector(".tube-line-color").classList.add(line);
        const textElement = dialogLineElement.firstElementChild;
        textElement.setAttribute("for", dialogLineElement.id);
        textElement.textContent = LondonGame.getStationName(line).toUpperCase();
        dialogLineElement.addEventListener("click", function (ev) {
            const lineName = ev.target.id.replace("-dialog", "");
            //find the line that was clicked on
            const platform = platforms[lines.indexOf(lineName)];
            if (GameState.game_phase === "configuration") {
                addPlayerLocator(GameState.player);
                prepareNextPlayer(platform);
                //add player locator if none exists
            }
            if (GameState.game_phase === "gameplay") {
                if (!randomEvent(platform)) {
                    prepareNextPlayer(platform);
                }
            }
        });
    });
};

const randomEvent = function (platform) {
    //events can trigger after changing lines
    const randNumber = Math.floor(Math.random() * 5);
    let randomNode = null;
    let randomPlatforms = null;
    let selectedPlatform = null;
    let stationName = null;
    switch (randNumber) {
    case 0:
        //gift the player an extra open station card
        dealSpecialCard(GameState.player, 1, GameState.open_station_cards);
        makeDialogSticky();
        showDialog(`It's ${getPlayerName(GameState.player)}'s lucky day!
        Collect 1 open station card`);
        setTimeout(function () {
            prepareNextPlayer(platform);
        }, 4000);
        return true;
    case 1:
        //gift the player an extra open station card
        dealSpecialCard(GameState.player, 1, GameState.close_station_cards);
        makeDialogSticky();
        showDialog(`It's ${getPlayerName(GameState.player)}'s lucky day!
        Collect 1 close station card`);
        setTimeout(function () {
            prepareNextPlayer(platform);
        }, 4000);
        return true;
    case 2:
        //gift the player two close station cards
        dealSpecialCard(GameState.player, 2, GameState.close_station_cards);
        makeDialogSticky();
        showDialog(`It's ${getPlayerName(GameState.player)}'s lucky day!
        Collect 2 close station cards`);
        setTimeout(function () {
            prepareNextPlayer(platform);
        }, 4000);
        return true;
    case 3:
        //gift the player two close station cards
        randomNode = LondonGame.randomItem(GameState.open_nodes);
        randomPlatforms = platformsFromNode(randomNode);
        selectedPlatform = LondonGame.randomItem(Array.from(randomPlatforms));
        stationName = LondonGame.getStationName(selectedPlatform.classList[0]);
        updatePlayerLocation(GameState.player, selectedPlatform.id);
        makeDialogSticky();
        showDialog(`${getPlayerName(GameState.player)} just had to visit
        ${stationName}! Player has been moved to that location`);
        setTimeout(function () {
            prepareNextPlayer(selectedPlatform.id);
        }, 4000);
        return true;
/*     case 2:
        LondonGame.addDestination(
            stationsCopy,
            LondonGame.integerArray(GameState.destinations_per_player)
        );
        dealCard(GameState.player, LondonGame.randomItem(
            GameState.open_nodes
            ));
        makeDialogSticky();
        showDialog(`Unlucky, ${getPlayerName(GameState.player)}!
        You found an extra destination you just had to visit!`);
        setTimeout(function () {
            prepareNextPlayer(platform);
        }, 4000);
    } */
    //space to add extra "chance" functions for move station cards
    }
};

const platformsFromNode = function (node) {
    return board.getElementsByClassName(node);
};

const prepareNextPlayer = function (platform) {
    //parent function for checking cards and updating player location
    const player = GameState.player;
    GameState.destinations = LondonGame.checkDestinationCards(
        player,
        stationFromPlatform(platform),
        GameState.destinations
    );
    const removedCardId = updateCards(player, GameState.destinations);
    removePointerArrows();
    updatePlayerLocation(player, platform);
    if (removedCardId) {
        //check if a card has been removed for the active player
        //if cards are updated, perform action before next turn
        removedCardDialogue(player, removedCardId);
    } else {
        setTimeout(function () {
            checkGameStatus(player);
        }, 50);
    }
};

const removedCardDialogue = function (player, station) {
    makeDialogSticky();
    const name = getPlayerName(player);
    const stationName = LondonGame.getStationName(station);
    const message = `${name} has reached ${stationName} station!`;
    const stationElement = document.getElementById(station);
    setTimeout(function () {
        //wait for stationElement to load then add classes
        showDialog(message);
        stationElement.setAttribute(
            "style",
            "animation:action-card-leave 1s infinite"
        );
    }, 10);
    setTimeout(function () {
        stationElement.remove();
    }, 1000);
    setTimeout(function () {
        board.addEventListener("click", checkGameStatus(player));
    }, 2000);
};

const checkGameStatus = function (player) {
    board.removeEventListener("click", checkGameStatus);
    //check for win or special cases, then set up a new play
    const emptyPlayer = LondonGame.checkHasDestinations(
        //check if any player has run out of cards
        player,
        GameState.destinations
    );
    if (emptyPlayer) {
        const winningPlayer = LondonGame.checkForWin(
            //check if any player has won the game
            GameState.player,
            GameState.destinations,
            stationFromPlatform(GameState.player_locations[player]),
            //active player station
            GameState.starting_stations
        );
        if (winningPlayer) {
            handleWin(winningPlayer);
        } else {
            handleEmptyPlayer(emptyPlayer);
        }
    } else {
        newPly(player);
    }
};

const newPly = function (player) {
    GameState.player = (player) % GameState.number_of_players + 1;
    if (GameState.game_phase === "configuration") {
        checkIfConfigComplete(); //BE CAREFUL WITH TRIGGERING THIS
    } else {
        waitForPlay();
    }
    hidePage(diceElement);
    makeDialogAnimated(); //BE CAREFUL WITH TRIGGERING THIS
    showActivePlayerCards(GameState.player);
    //increases the player number and shows the correct player's cards
    updateInfoPanel(GameState.player, GameState.player_lines[GameState.player]);
    if (GameState.game_phase === "gameplay") {
        checkAvailableActions(true);
    }
};

const handleWin = function (player) {
    GameState.game_phase = "";
    showDialog(`${getPlayerName(player)} has won the game! Congratulations!!`);
    makeDialogSticky();
};

const handleEmptyPlayer = function (player) {
    const stationName = LondonGame.getStationName(
        GameState.starting_stations[player]
    );
    setTimeout(function () {
        showDialog(`No more destination cards.
        Return to ${stationName} to win the game!`);
        makeDialogSticky();
    }, 10);
    setTimeout(function () {
        newPly(player);
        makeDialogAnimated();
    }, 4000);
};

const checkAvailableActions = function (bool) {
    //parent function for checking which actions the player can make
    let availableActions = [];
    if (bool) {
        const canChangePlatforms = (
            //check if there are at least 2 platforms at the player's station
            getAvailablePlatforms(
                GameState.player_locations[GameState.player],
                GameState.open_nodes
            ).length >= 2
        );
        const canManageStations = checkManageStations();
        availableActions = [true, canChangePlatforms, canManageStations];
    } else {
        availableActions = [false, false, false];
    }
    setButtonActions(availableActions);
    addActionEventListeners(availableActions);
};

const addActionEventListeners = function (availableActions) {
    //add event listeners based on possible actions
    addClickEvent(rollDiceElement, rollDiceAction, availableActions[0]);
    addClickEvent(changeElement, changeLinesAction, availableActions[1]);
    addClickEvent(manageElement, manageStationsAction, availableActions[2]);
};

const addClickEvent = function (element, func, boolean = true) {
    //generalised function for adding and removing a click event
    if (element) {
        if (boolean) {
            element.addEventListener("click", func);
        } else {
            element.removeEventListener("click", func);
        }
    }
};

const rollDiceAction = function () {
    checkAvailableActions(false);
    //roll the dice
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    //diceElement.className = "";
    displayPage(diceElement);
    hidePage(dialogContainer);
    //initialise the animation for the dice element
    diceElement.className = "";
    diceElement.classList.add("dice-animation");
    diceElement.src = `./assets/dice-${diceRoll}.svg`;
    if (diceRoll === 6) {
        //gift the player an extra open station card
        dealSpecialCard(GameState.player, 1, GameState.open_station_cards);
        makeDialogSticky();
        showDialog(`${getPlayerName(GameState.player)} rolled a 6!
        Collect 1 open station card`);
        setTimeout(function () {
            hidePage(dialogContainer);
        }, 3000);
    }
    setTimeout(function () {
        diceElement.classList.remove("dice-animation");
        diceElement.classList.add("dice-reverse");
    }, 1500);
    const openPlatformsAtLine = findOpenPlatForms(
        GameState.open_nodes,
        GameState.player_lines[GameState.player]
    );
    const avaliablePlatforms = LondonGame.breadthFirstSearch(
        //find platforms on same line within reach of dice roll
        GameState.player_lines[GameState.player],
        openPlatformsAtLine,
        GameState.player_locations[GameState.player],
        diceRoll
    );
    if (avaliablePlatforms.length === 0) {
        showDialog("No possible moves");
        setTimeout(function () {
            newPly(GameState.player);
        }, 3000);
    } else {
        addPointerArrows(avaliablePlatforms);
    }
};

const removeDice = function () {
    diceElement.classList.remove("dice-animation");
    diceElement.classList.add("dice-reverse");
};

const findOpenPlatForms = function (openNodes, line) {
    //find open platforms from open nodes on given line
    let openPlatformsAtLine = [];
    Array.from(openNodes).forEach(function (node) {
        Array.from(board.getElementsByClassName(node)).forEach(
            //loop through each platform at node
            function (platform) {
                const lineName = platform.parentElement.id;
                if (lineName === line) {
                    openPlatformsAtLine.push(platform.id);
                }
            }
        );
    });
    return openPlatformsAtLine;
};


const changeLinesAction = function () {
    checkAvailableActions(false);
    //only allow event to fire once
    delayThenDisplay(GameState.player_locations[GameState.player]);
};

const manageStationsAction = function () {
    displayPage(dialogContainer);
    closeCard = findSpecialCard(GameState.player, "close");
    openCard = findSpecialCard(GameState.player, "open");
    addActionEventListeners([false, false, false]);
    setButtonActions([false, false, true]);
    manageElement.src = "./assets/action-confirm.svg";
    //allow the user to finish opening and closing elements by clicking again
    showDialog("Click your special cards to open or close any station!");
    if (closeCard) {
        setActionCardAnimation(closeCard);
        closeCardSelected();
    }
    if (openCard) {
        setActionCardAnimation(openCard);
    }
    //ERROR: FIRING WHEN SHOULDN'T
};

const setActionCardAnimation = function (actionCard) {
    actionCard.classList.add("bounce");
    //add animations to the close card to indicate that it should be clicked
    actionCard.addEventListener("mouseenter", removeActionCardAnimation);
    actionCard.addEventListener("mouseleave", addActionCardAnimation);
    actionCard.contentDocument.addEventListener("click", addActionCardShadow);
};

const addActionCardShadow = function (ev) {
    ev.target.classList.add("special-shadow");
    ev.target.classList.remove("normal-shadow");
    board.querySelector("*").style.cursor = "pointer";
    if (ev.target.id === "close-station") {
        closeCardSelected();
    } else {
        openCardSelected();
    }
    manageElement.addEventListener("click", finishStationManage);
};

const addActionCardAnimation = function (ev) {
    ev.target.classList.add("bounce");
    ev.target.classList.add("animated-card");
};

const removeActionCardAnimation = function (ev) {
    ev.target.classList.remove("bounce");
    ev.target.classList.remove("animated-card");
};

const findSpecialCard = function (player, type) {
    return cardsPanel.querySelector(
        `.${type}-station-card-container.player-${player}-card`
    ).firstElementChild;
};

const closeCardSelected = function () {
    if (openCard) {
        if (openCard.contentDocument) {
            openCard.contentDocument.querySelector(
                ".path"
            ).classList.remove("special-shadow");
            openCard.contentDocument.querySelector(
                ".path"
            ).classList.add("normal-shadow");
        }
    }
    //remove animations for open station cards
    GameState.closing_nodes = true;
    GameState.opening_nodes = false;
    platformActionListener();
};

const openCardSelected = function () {
    if (closeCard) {
        if (closeCard.contentDocument) {
            closeCard.contentDocument.querySelector(
                ".path"
            ).classList.remove("special-shadow");
            closeCard.contentDocument.querySelector(
                ".path"
            ).classList.add("normal-shadow");
        }

    }
    GameState.opening_nodes = true;
    GameState.closing_nodes = false;
    board.addEventListener("click", actionOpenNode);
};

const platformActionListener = function () {
    const platformElements = board.getElementsByClassName("station");
    Array.from(platformElements).forEach(function (element) {
        element.addEventListener("click", function () {
            //wait for player to click on station nodes to manage stations
            actionCloseNode(element);
        });
        //add an event listener for each of the platform elements
    });
};

const actionOpenNode = function (ev) {
    //behaviour for opening a station
    if (!GameState.opening_nodes) {
        return;
    }
    const closeStationNode = ev.target.parentElement;
    if (!closeStationNode) {
        return;
    }
    if (!ev.target.parentElement.classList.contains("close-station")) {
        //don't allow player to click on things that aren't closed stations
        return;
    }
    const targetId = closeStationNode.id;
    const platformId = targetId.replace("close-station-", "");
    const selectedNode = board.getElementById(platformId).classList[1];
    if (GameState.open_nodes.includes(selectedNode)) {
        throw new Error("Open node should not have a close station icon");
    }
    GameState.open_nodes.push(selectedNode);
    closeStationNode.remove();
    if (!dealSpecialCard(GameState.player, -1, GameState.open_station_cards)) {
        GameState.opening_nodes = false;
        //stop closing nodes if player is out of close cards
    }
    //closeStationSvg.remove();
    if (!checkIfActionCards()) {
        finishStationManage();
    }
};

const actionCloseNode = function (element) {
    //behaviour for closing a station
    if (!GameState.closing_nodes) {
        return;
    }
    //close station when element clicked
    const node = element.classList[1];
    if (!GameState.open_nodes.includes(node)) {
        //do not allow player to close already closed node
        return;
    }
    GameState.open_nodes = LondonGame.closeNode(GameState.open_nodes, node);
    //remove the node from the open nodes list
    const closeStationSvg = board.getElementById("close-station");
    const newCloseStationSvg = closeStationSvg.cloneNode(true);
    newCloseStationSvg.id = `close-station-${element.id}`;
    appendToBoard(newCloseStationSvg);
    moveSvgItem(element, newCloseStationSvg, 960, 540);
    //add an svg element to indicate the closed node
    if (!dealSpecialCard(GameState.player, -1, GameState.close_station_cards)) {
        GameState.closing_nodes = false;
        //stop closing nodes if player is out of close cards
    }
    if (!checkIfActionCards()) {
        finishStationManage();
    }
};

const checkIfActionCards = function () {
    return (GameState.close_station_cards[
        GameState.player
    ] + GameState.open_station_cards[
        GameState.player
    ]);
};

const finishStationManage = function () {
    GameState.closing_nodes = true;
    GameState.opening_nodes = true;
    closeCard = findSpecialCard(GameState.player, "close");
    openCard = findSpecialCard(GameState.player, "open");
    //remove relevant event listeners from cards
    if (closeCard) {
        removeAllActionAnimations(closeCard);
    }
    if (openCard) {
        removeAllActionAnimations(openCard);
    }
    addClickEvent(manageElement, finishStationManage, false);
    board.querySelector("*").style.cursor = "";
    manageElement.src = "./assets/action-manage-stations.svg";
    prepareNextPlayer(GameState.player_locations[GameState.player]);
    manageElement.removeEventListener("click", finishStationManage);
};

const removeAllActionAnimations = function (card) {
    //remove all special styling from the action elements
    card.contentDocument.removeEventListener(
        "click",
        addActionCardShadow
    );
    card.classList.remove("bounce");
    card.removeEventListener("mouseenter", removeActionCardAnimation);
    card.removeEventListener("mouseleave", addActionCardAnimation);
    card.contentDocument.querySelector(
        ".path"
    ).classList.remove("special-shadow");
    card.contentDocument.querySelector(
        ".path"
    ).classList.add("normal-shadow");
};

const checkManageStations = function () {
    //check if player has at least 1 special card
    const closeCardsCount = GameState.close_station_cards[GameState.player];
    const openCardCount = GameState.open_station_cards[GameState.player];
    return Boolean(closeCardsCount + openCardCount);
};

const waitForPlay = function () {
    updateInfoPanel(GameState.player, GameState.player_lines[GameState.player]);
    //update the info panel based on the active player and the active line
    showDialog(
        "Select a move option: roll dice, " +
        "change lines, or open / close stations"
    );
};


const addPlayerLocator = function (player) {
    //initialise the player locator within the tube-map.svg file
    const playerElements = playersPanel.getElementsByClassName("player-glyph");
    const selectedPlayerClass = playerElements[player - 1].classList[1];
    const playerLocator = board.getElementById("player-locator");
    const newPlayerLocator = playerLocator.cloneNode(true);
    newPlayerLocator.id = `player-${player}-locator`;
    newPlayerLocator.setAttribute("aria-label", `player-${player}-locator`);
    //set a unique id for the locator
    appendToBoard(newPlayerLocator);
    const colorElement = newPlayerLocator.querySelector(
        "#player-color-element"
    );
    colorElement.id = `player-${player}-color-element`;
    colorElement.classList.add(selectedPlayerClass);
    //add a class to the svg path to change the color to match the player
};

const movePlayerLocator = function (player, platform) {
    const playerLocator = board.getElementById(`player-${player}-locator`);
    const platformElement = board.getElementById(platform);
    moveSvgItem(platformElement, playerLocator, 960, 545);
};

const moveSvgItem = function (referenceItem, movingItem, x, y) {
    const xLocation = referenceItem.getAttribute("cx");
    const yLocation = referenceItem.getAttribute("cy");
    movingItem.setAttribute(
        "transform",
        `translate(${xLocation - x}, ${yLocation - y})`
    );
    //move the element from it's initial position to match a platform location
    //see tube-map.svg to see how this works
};

const getAvailablePlatforms = function (platform, openNodes) {
    //returns available platforms to access at the same station
    if (!board.getElementById(platform)) {
        return;
    }
    const station = board.getElementById(platform).classList[0];
    const platformsAtStation = board.getElementsByClassName(station);
    let availablePlatforms = [];
    let usedLines = [];
/*     create array of used lines to avoid repeats (for stations with two
    platforms on same line) */
    Array.from(platformsAtStation).forEach(function (platformElement) {
        if (openNodes.includes(platformElement.classList[1])) {
            const platformLine = platformElement.parentElement.id;
            if (!usedLines.includes(platformLine)) {
                availablePlatforms.push(platformElement.id);
                usedLines.push(platformLine);
            }
        }
    });
    return availablePlatforms;
};

const stationFromPlatform = function (platform) {
    return board.getElementById(platform).classList[0];
};

const cardPanelScrollAdjust = function () {
    // Check if the scroll width is greater than the client width
    const scrollable = cardsPanel.scrollWidth > cardsPanel.clientWidth;
    // Apply the alignment based on scrollability
    cardsPanel.style.justifyContent = (
        scrollable
        ? "flex-start"
        : "center"
    );
};

const animateActionText = function () {
    let mouseStillOverElement = null;
    //show popup text for action elements
    Array.from(actionElements).forEach(function (actionElement) {
        const textElement = document.getElementById(
            actionElement.id + "-text"
        );
        actionElement.addEventListener("mouseenter", function () {
            mouseStillOverElement = true;
            setTimeout(function () {
                //set timeout before displaying animation
                if (mouseStillOverElement) {
                    textElement.classList.remove("animated-action-text-leave");
                    textElement.classList.add("animated-action-text");
                }
            }, 1000);
            setTimeout(function () {
                textElement.classList.add("animated-action-text-leave");
                textElement.classList.remove("animated-action-text");
            }, 4000);
        });
        actionElement.addEventListener("mouseout", function () {
            mouseStillOverElement = false;
            if (textElement.classList.contains("animated-action-text")) {
                //only trigger out animation if initial animation has been added
                textElement.classList.remove("animated-action-text");
                textElement.classList.add("animated-action-text-leave");
            }
        });
    });
};
