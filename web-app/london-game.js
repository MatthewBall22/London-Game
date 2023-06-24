//import R from "./ramda.js";

/**
 * london-game.js is a module to model and play "The London Game"
 * versus the computer.
 * https://en.wikipedia.org/wiki/The_London_Game
 * @namespace LondonGame
 * @author Matthew Ball
 * @version 2023
 */
const LondonGame = Object.create(null);

/**
 * The location parameter signifies the platform of the active player
 * @memberof LondonGame
 * @typedef {string} location
 */

/**
 * A station is a name that corresponds to a class name in the tube-map.svg
 * document. It is used for setting destinations and changing platforms.
 * Each station can contain several platforms and several station nodes.
 * @memberof LondonGame
 * @typedef {string} station
 */

/**
 * A node is a name that corresponds to a class name in the tube-map.svg
 * document. Some stations can have several nodes if they have more than one
 * location on the board. The nodes can be closed and opened using close and
 * open station cards
 * @memberof LondonGame
 * @typedef {string} node
 */

/**
 * A platform is a name that corresponds to an ID in the tube-map.svg document.
 * Each platform is unique, indicating a particular line at a particular
 * station.
 * @memberof LondonGame
 * @typedef {string} platform
 */

/**
 * openNodes is a list of station nodes. Each station node corresponds to a
 * set of platforms on the same position on the map. openNodes are used to find
 * available routes for players and find available platform changes.
 * @memberof LondonGame
 * @typedef {string[]} openNodes
 */

/**
 * The destinations object indicates the destination locations for each player.
 * The keys of the object are the player index, and the values are station names
 * @memberof LondonGame
 * @typedef {object} destinations
 */

/**
 * The adjacency list signifies all platforms that are exactly one stop apart on
 * the tube map, and also on the same line. Some lines have several routes
 * springing off one platform, this object is needed to find the shortest route
 * between stations
 * {@link LondonGame.AdjacentPlatforms}
 * @memberof LondonGame
 * @enum {string[]}
 * @property {string[]}
 */
LondonGame.AdjacentPlatforms = Object.freeze({
    "northern-line": [
        ["chalk-farm-northern", "camden-town-northern"],
        ["camden-town-northern", "mornington-crescent-northern"],
        ["camden-town-northern", "euston-2-northern"],
        ["mornington-crescent-northern", "euston-1-northern"],
        ["euston-1-northern", "euston-2-northern"],
        ["euston-1-northern", "warren-street-northern"],
        ["euston-2-northern", "kings-cross-northern"],
        ["kings-cross-northern", "angel-northern"],
        ["angel-northern", "old-street-northern"],
        ["old-street-northern", "moorgate-northern"],
        ["moorgate-northern", "monument-northern"],
        ["monument-northern", "london-bridge-northern"],
        ["london-bridge-northern", "borough-northern"],
        ["borough-northern", "elephant-castle-northern"],
        ["elephant-castle-northern", "waterloo-northern"],
        ["waterloo-northern", "embankment-northern"],
        ["embankment-northern", "charing-cross-northern"],
        ["charing-cross-northern", "leicester-square-northern"],
        ["leicester-square-northern", "tottenham-court-road-northern"],
        ["tottenham-court-road-northern", "goodge-street-northern"],
        ["goodge-street-northern", "warren-street-northern"]
    ],
    "waterloo-and-city-line": [
        ["waterloo-w-city", "bank-w-city"]
    ],
    "bakerloo-line": [
        ["willesden-junction-bakerloo", "kensal-green-bakerloo"],
        ["kensal-green-bakerloo", "queens-park-bakerloo"],
        ["queens-park-bakerloo", "kilburn-park-bakerloo"],
        ["kilburn-park-bakerloo", "maida-vale-bakerloo"],
        ["maida-vale-bakerloo", "warwick-avenue-bakerloo"],
        ["warwick-avenue-bakerloo", "paddington-bakerloo"],
        ["paddington-bakerloo", "edgware-road-bakerloo"],
        ["edgware-road-bakerloo", "marylebone-bakerloo"],
        ["marylebone-bakerloo", "baker-street-bakerloo"],
        ["baker-street-bakerloo", "regents-park-bakerloo"],
        ["regents-park-bakerloo", "oxford-circus-bakerloo"],
        ["oxford-circus-bakerloo", "piccadilly-circus-bakerloo"],
        ["piccadilly-circus-bakerloo", "charing-cross-bakerloo"],
        ["charing-cross-bakerloo", "embankment-bakerloo"],
        ["embankment-bakerloo", "waterloo-bakerloo"],
        ["waterloo-bakerloo", "lambeth-north-bakerloo"],
        ["lambeth-north-bakerloo", "elephant-castle-bakerloo"]
    ],
    "jubilee-line": [
        ["finchley-road-jubilee", "swiss-cottage-jubilee"],
        ["swiss-cottage-jubilee", "st-johns-wood-jubilee"],
        ["st-johns-wood-jubilee", "baker-street-jubilee"],
        ["baker-street-jubilee", "bond-street-jubilee"],
        ["bond-street-jubilee", "green-park-jubilee"],
        ["green-park-jubilee", "westminster-jubilee"],
        ["westminster-jubilee", "waterloo-jubilee"],
        ["waterloo-jubilee", "southwark-jubilee"],
        ["southwark-jubilee", "london-bridge-jubilee"],
        ["london-bridge-jubilee", "bermondsey-jubilee"],
        ["bermondsey-jubilee", "canada-water-jubilee"]
    ],
    "victoria-line": [
        ["highbury-and-islington-victoria", "kings-cross-victoria"],
        ["kings-cross-victoria", "euston-victoria"],
        ["euston-victoria", "warren-street-victoria"],
        ["warren-street-victoria", "oxford-circus-victoria"],
        ["oxford-circus-victoria", "green-park-victoria"],
        ["green-park-victoria", "victoria-victoria"],
        ["victoria-victoria", "pimlico-victoria"],
        ["pimlico-victoria", "vauxhall-victoria"]
    ],
    "piccadilly-line": [
        ["kings-cross-piccadilly", "russell-square-piccadilly"],
        ["russell-square-piccadilly", "holborn-piccadilly"],
        ["holborn-piccadilly", "covent-garden-piccadilly"],
        ["covent-garden-piccadilly", "leicester-square-piccadilly"],
        ["leicester-square-piccadilly", "piccadilly-circus-piccadilly"],
        ["piccadilly-circus-piccadilly", "green-park-piccadilly"],
        ["green-park-piccadilly", "hyde-park-corner-piccadilly"],
        ["hyde-park-corner-piccadilly", "knightsbridge-piccadilly"],
        ["knightsbridge-piccadilly", "gloucester-road-piccadilly"],
        ["gloucester-road-piccadilly", "earls-court-piccadilly"],
        ["earls-court-piccadilly", "barons-court-piccadilly"],
        ["barons-court-piccadilly", "hammersmith-piccadilly"]
    ],
    "central-line": [
        ["north-acton-central", "east-acton-central"],
        ["east-acton-central", "white-city-central"],
        ["white-city-central", "shepherds-bush-central"],
        ["shepherds-bush-central", "holland-park-central"],
        ["holland-park-central", "notting-hill-gate-central"],
        ["notting-hill-gate-central", "queensway-central"],
        ["queensway-central", "lancaster-gate-central"],
        ["lancaster-gate-central", "marble-arch-central"],
        ["marble-arch-central", "bond-street-central"],
        ["bond-street-central", "oxford-circus-central"],
        ["oxford-circus-central", "tottenham-court-road-central"],
        ["tottenham-court-road-central", "holborn-central"],
        ["holborn-central", "chancery-lane-central"],
        ["chancery-lane-central", "st-pauls-central"],
        ["st-pauls-central", "bank-central"],
        ["bank-central", "liverpool-street-central"]
    ],
    "hammersmith-and-city-line": [
        ["hammersmith-h-c", "goldhawk-road-h-c"],
        ["goldhawk-road-h-c", "shepherds-bush-market-h-c"],
        ["shepherds-bush-market-h-c", "wood-lane-h-c"],
        ["wood-lane-h-c", "latimer-road-h-c"],
        ["latimer-road-h-c", "ladbroke-grove-h-c"],
        ["ladbroke-grove-h-c", "westbourne-park-h-c"],
        ["westbourne-park-h-c", "royal-oak-h-c"],
        ["royal-oak-h-c", "paddington-h-c"],
        ["paddington-h-c", "edgware-road-h-c"],
        ["edgware-road-h-c", "baker-street-h-c"],
        ["baker-street-h-c", "great-portland-street-h-c"],
        ["great-portland-street-h-c", "euston-square-h-c"],
        ["euston-square-h-c", "kings-cross-h-c"],
        ["kings-cross-h-c", "barbican-h-c"],
        ["barbican-h-c", "moorgate-h-c"],
        ["moorgate-h-c", "liverpool-street-h-c"],
        ["liverpool-street-h-c", "aldgate-east-h-c"],
        ["aldgate-east-h-c", "whitechapel-h-c"]
    ],
    "circle-line": [
        ["hammersmith-circle", "goldhawk-road-circle"],
        ["goldhawk-road-circle", "shepherds-bush-market-circle"],
        ["shepherds-bush-market-circle", "wood-lane-circle"],
        ["wood-lane-circle", "latimer-road-circle"],
        ["latimer-road-circle", "ladbroke-grove-circle"],
        ["ladbroke-grove-circle", "westbourne-park-circle"],
        ["westbourne-park-circle", "royal-oak-circle"],
        ["royal-oak-circle", "paddington-1-circle"],
        ["paddington-1-circle", "edgware-road-1-circle"],
        ["edgware-road-1-circle", "baker-street-circle"],
        ["baker-street-circle", "great-portland-street-circle"],
        ["great-portland-street-circle", "euston-square-circle"],
        ["euston-square-circle", "kings-cross-circle"],
        ["kings-cross-circle", "barbican-circle"],
        ["barbican-circle", "moorgate-circle"],
        ["moorgate-circle", "liverpool-street-circle"],
        ["liverpool-street-circle", "aldgate-circle"],
        ["aldgate-circle", "tower-hill-circle"],
        ["tower-hill-circle", "monument-circle"],
        ["monument-circle", "cannon-street-circle"],
        ["cannon-street-circle", "mansion-house-circle"],
        ["mansion-house-circle", "blackfriars-circle"],
        ["blackfriars-circle", "temple-circle"],
        ["temple-circle", "embankment-circle"],
        ["embankment-circle", "westminster-circle"],
        ["westminster-circle", "st-james-park-circle"],
        ["st-james-park-circle", "victoria-circle"],
        ["victoria-circle", "sloane-square-circle"],
        ["sloane-square-circle", "south-kensington-circle"],
        ["south-kensington-circle", "gloucester-road-circle"],
        ["gloucester-road-circle", "high-street-kensington-circle"],
        ["high-street-kensington-circle", "notting-hill-gate-circle"],
        ["notting-hill-gate-circle", "bayswater-circle"],
        ["bayswater-circle", "paddington-2-circle"],
        ["paddington-1-circle", "paddington-2-circle"],
        ["edgware-road-1-circle", "edgware-road-2-circle"]
    ],
    "district-line": [
        ["whitechapel-district", "aldgate-east-district"],
        ["aldgate-east-district", "tower-hill-district"],
        ["tower-hill-district", "monument-district"],
        ["monument-district", "cannon-street-district"],
        ["cannon-street-district", "mansion-house-district"],
        ["mansion-house-district", "blackfriars-district"],
        ["blackfriars-district", "temple-district"],
        ["temple-district", "embankment-district"],
        ["embankment-district", "westminster-district"],
        ["westminster-district", "st-james-park-district"],
        ["st-james-park-district", "victoria-district"],
        ["victoria-district", "sloane-square-district"],
        ["sloane-square-district", "south-kensington-district"],
        ["south-kensington-district", "gloucester-road-district"],
        ["gloucester-road-district", "high-street-kensington-district"],
        ["high-street-kensington-district", "notting-hill-gate-district"],
        ["notting-hill-gate-district", "bayswater-district"],
        ["bayswater-district", "paddington-district"],
        ["paddington-district", "edgware-road-district"],
        ["gloucester-road-district", "earls-court-district"],
        ["earls-court-district", "high-street-kensington-district"],
        ["earls-court-district", "kensington-olympia-district"],
        ["earls-court-district", "west-kensington-district"],
        ["west-kensington-district", "barons-court-district"],
        ["barons-court-district", "hammersmith-district"],
        ["hammersmith-district", "ravenscourt-park-district"],
        ["ravenscourt-park-district", "stamford-brook-district"],
        ["earls-court-district", "west-brompton-district"],
        ["west-brompton-district", "fulham-broadway-district"],
        ["fulham-broadway-district", "parsons-green-district"],
        ["parsons-green-district", "putney-bridge-district"],
        ["putney-bridge-district", "east-putney-district"]
    ],
    "metropolitan-line": [
        ["finchley-road-metropolitan", "baker-street-metropolitan"],
        ["baker-street-metropolitan", "great-portland-street-metropolitan"],
        ["great-portland-street-metropolitan", "euston-square-metropolitan"],
        ["euston-square-metropolitan", "kings-cross-metropolitan"],
        ["kings-cross-metropolitan", "barbican-metropolitan"],
        ["barbican-metropolitan", "moorgate-metropolitan"],
        ["moorgate-metropolitan", "liverpool-street-metropolitan"],
        ["liverpool-street-metropolitan", "aldgate-metropolitan"]
    ]
});


/**
 * Returns a random item from an array. This is used to generate random
 * destination stations for players and random dice rolls
 * @memberof LondonGame
 * @function
 * @param {array} array The array from which a random item is chosen
 * @returns {(string|number)} The returned item
 */
LondonGame.randomItem = function (array) {
    const randomItemNumber = Math.floor(array.length * Math.random());
    const randomItem = array[randomItemNumber];
    return randomItem;
};

/**
 * Creates an array filled with natural numbers. This is used to conveniently
 * loop through natural numbers
 * @memberof LondonGame
 * @function
 * @param {number} number The value up to which natural numbers will be
 * generated
 * @returns {number[]} The array filled with natural numbers
 */
LondonGame.integerArray = function (number) {
    const array = new Array(number).fill(0);
    let i = 0;
    array.forEach(function () {
        array[i] = i + 1;
        i = i + 1;
    });
    return array;
};

/**
 * Adds items to an array, provided that the item is not already included in
 * the array. This is used to create arrays of unique stations and station nodes
 * @memberof LondonGame
 * @function
 * @param {string[]} array The initial array
 * @param {string} item The item to attempt to push into the array
 * @returns {string[]} The updated array
 */
LondonGame.addToArray = function (array, item) {
    if (!array.includes(item)) {
        array.push(item);
    }
    return array;
};

/**
 * Creates spaced and capitalised versions of station names or line names from
 * the svg class names. This is used to display names for the game UI.
 * @memberof LondonGame
 * @function
 * @param {string} station The class name of the station
 * @returns {string} The updated version of the station name
 */
LondonGame.getStationName = function (station) {
    const modifiedText = station.replace(
        "-station",
        ""
    ).replace("-dialog", "").replace("-node", "");
    const splicedText = modifiedText.split("-");
    const textArray = [];
    splicedText.forEach(function (element) {
        element = element.charAt(0).toUpperCase() + element.slice(1);
        textArray.push(element);
    });
    const finalText = textArray.join(" ");
    return finalText;
};


/**
 * Picks random stations from an array and adds them to an array of
 * destinations. This is used at the beginning of the game to provide
 * initial destinations, and later to give extra cards to players
 * @memberof LondonGame
 * @function
 * @param {string[]} stations The array of stations to select from
 * @param {number[]} array An array of natural numbers to loop though,
 * equal to the total number of destinations
 * @returns {string[]} An array of destination stations
 */
LondonGame.addDestinations = function (stations, array) {
    const playerDestinations = [];
    array.forEach(function () {
        const randomStation = LondonGame.randomItem(stations);
        playerDestinations.push(randomStation);
        const randomStationIndex = stations.indexOf(randomStation);
        stations.splice(randomStationIndex, 1);
    });
    return playerDestinations;
};

const updateAvailableRoutes = function (adjacencyList, platforms) {
    adjacencyList.forEach(function (endingStops, startingStop) {
        if (!platforms.includes(startingStop)) {
            endingStops = [];
        }
        endingStops.forEach(function (platform) {
            if (!platforms.includes(platform)) {
                endingStops = LondonGame.closeNode(endingStops, platform);
            }
        });
    });
/*     platforms.push(location);
    routes.forEach(function (route) {
        let isRouteAvailable = true;
        console.log(route);
        route.forEach(function (platformOnRoute) {
            if (!platforms.includes(platformOnRoute)) {
                isRouteAvailable = false;
            }
        });
        console.log(isRouteAvailable);
        if (!isRouteAvailable) {
            routes = LondonGame.closeNode(routes, route);
        }
    }); */
    return adjacencyList;
};


/**
 * This function performs a search algorithm to find the minimum number of steps
 * it takes to get from one platform to another on the same line. This is used
 * to set possible player locations when the dice action element is pressed.
 * @memberof LondonGame
 * @function
 * @param {string} line The array of stations to select from
 * @param {string[]} platforms An array of open platforms at a line
 * @param {string} location The current location of the player, used as the
 * start location for
 * @param {number} dice The dice number rolled, equal to the maximum distance
 * from the starting platform that the player can travel
 * @returns {string[]} An array of distances to each station on the line
 */
LondonGame.breadthFirstSearch = function (line, platforms, location, dice) {
    let adjacencyList = new Map();
    const addEdge = function (origin, destination) {
        if (!adjacencyList.has(origin)) {
            adjacencyList.set(origin, []);
        }
        if (!adjacencyList.has(destination)) {
            adjacencyList.set(destination, []);
        }
        adjacencyList.get(origin).push(destination);
        adjacencyList.get(destination).push(origin);
    };
    const routes = [...LondonGame.AdjacentPlatforms[line]];
    routes.forEach(function (route) {
        addEdge(...route);
    });
    adjacencyList = updateAvailableRoutes(adjacencyList, platforms, location);
    const visited = new Set(); //array with unique values
    const queue = [location];
    const stationDistance = new Map();
    let i = 0; //represents depth of station
    stationDistance.set(location, i);
    visited.add(location);
    //while queue has items in it or length is greater than zero
    while (queue.length > 0) {
        let station = queue.shift(); //mutates the queue
        let destinations = adjacencyList.get(station);
        if (!destinations) {
            return;
        }
        i = stationDistance.get(station) + 1; //depth for preceding stations
        let j = 0;
        while (j < destinations.length) {
            let thisDestination = destinations[j];
            if (!visited.has(thisDestination)) {
                visited.add(thisDestination);
                //add any new destinations to visited
                queue.push(thisDestination);
                if (!stationDistance.has(thisDestination)) {
                    //only calculate if destination is new
                    stationDistance.set(thisDestination, i);
                }
            }
            j = j + 1;
        }
    }
    let inRangePlatforms = [];
    stationDistance.forEach(function (value, key) {
        if (value <= dice) {
            if (key !== location) {
                inRangePlatforms.push(key);
            }
        }
    });
    return inRangePlatforms;
    //return stationDistance.keys(); //returns map of station distances */
};


/**
 * This function checks to see if a node is within a list of open nodes. If
 * it is, it removes the selected node from the array
 * @memberof LondonGame
 * @function
 * @param {string[]} openNodes An array of open nodes
 * @param {string} node Selected node to attempt removing from the array
 * @returns {string[]} Updated open nodes
 */
LondonGame.closeNode = function (openNodes, node) {
    const index = openNodes.indexOf(node);
    if (index > -1) {
        openNodes.splice(index, 1);
    }
    return openNodes;
};

/**
 * This function checks the object containing destinations for each player to
 * see if the player has reached any of their destinations.
 * @memberof LondonGame
 * @function
 * @param {number} player Active player index
 * @param {string} station Active player station
 * @param {string[]} destinations An object containing destinations for each
 * player
 * @returns {string[]} Updated destinations list, with destinations only updated
 * for active player
 */
LondonGame.checkDestinationCards = function (player, station, destinations) {
    //checks if player's current station matches a destination card
    const activePlayerCards = destinations[player];
    if (activePlayerCards.includes(station)) {
        const index = activePlayerCards.indexOf(station);
        activePlayerCards.splice(index, 1);
        destinations[player] = activePlayerCards;
    }
    return destinations;
};

/**
 * This function checks whether the active player has won the game. This
 * function is passed before initialising a new turn
 * @memberof LondonGame
 * @function
 * @param {number} player Active player index
 * @param {string[]} destinations An object containing the destination card
 * stations for each player
 * player
 * @param {string} station Active player station
 * @param {string[]} startingStations An object containing the starting station
 * for each player
 * @returns {number | null} If a player has no destination cards, and they have
 * got back to their starting station, they have won the game. Returns the index
 * of the winning player if one exists, otherwise returns empty
 */
LondonGame.checkForWin = function (
    player,
    destinations,
    station,
    startingStations
) {
    const startingStation = startingStations[player];
    if (station === startingStation) {
        if (LondonGame.checkHasDestinations(player, destinations)) {
            return player;
        }
    } else {
        return null;
    }
};

/**
 * This function checks whether a player has reached all their destinations.
 * This is used to toggle a dialog to remind them to return to their original
 * station.
 * @memberof LondonGame
 * @function
 * @param {number} player Active player index
 * @param {string[]} destinations An object containing destination card stations
 * for each player
 * @returns {number | null} Returns the index of the player who has reached all
 * their destinations if one exists, otherwise returns empty
 */
LondonGame.checkHasDestinations = function (player, destinations) {
    const playerDestinations = destinations[player];
    if (playerDestinations.length === 0) {
        return player;
    }
};

export default Object.freeze(LondonGame);