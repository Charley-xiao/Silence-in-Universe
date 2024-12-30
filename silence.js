"use strict";

/**
 * Helper function to set a cookie.
 * @param {string} cname - Cookie name.
 * @param {string} cvalue - Cookie value.
 * @param {number} exdays - Expiration in days.
 */
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Helper function to get a cookie.
 * @param {string} cname - Cookie name.
 * @returns {string} Cookie value or empty string if not found.
 */
function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/**
 * Get a random integer between 1 and upsize (inclusive).
 * @param {number} upsize
 * @returns {number}
 */
function getRandomInt(upsize) {
  // parseInt(Math.random() * upsize + 1)
  return Math.floor(Math.random() * upsize) + 1;
}

/**
 * Shuffle the `array` in-place, then slice to size.
 * @param {Array} array
 * @param {number} size
 * @returns {Array}
 */
function shuffleAndTrim(array, size) {
  let index = -1;
  const length = array.length;
  const lastIndex = length - 1;
  const targetSize = size === undefined ? length : size;

  while (++index < targetSize) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
    const value = array[rand];
    array[rand] = array[index];
    array[index] = value;
  }
  array.length = targetSize;
  return array;
}

/**
 * Main SpaceGame class encapsulating all game logic and state.
 */
class SpaceGame {
  constructor() {
    // Core variables
    this.MAXIMUM_LOG_LINES = 23;
    this.turns = 0;             // Number of turns taken
    this.lands = 1;             // Number of uninhabited star systems you control
    this.foundedCivs = 0;       // Number of discovered civilizations
    this.credits = 50;          // Example resource for new functionalities

    // War & diplomacy tracking
    this.warState = false;      // Are we currently in a war phase?
    this.warList = [];          // List of civilizations at war with us
    this.alliesList = [];       // List of allied civilizations
    this.commandIndex = 0;      // For the game log lines
    this.commandsSent = 0;      // For the user commands in the extra console
    this.outConquered = [];     // List of civs we have conquered

    // Planet / civ arrays
    this.planetNamesPool = [
      "Cinnamon", "ISON0012", "Zeus", "Hra", "Poseidon", "Neptune", "Pluto",
      "Hestia", "Ares", "Athena", "Hermes", "Hephaistos", "Aphrodite", 
      "Artemis", "Apollo", "Dionysus", "Demeter", "WY013C", "CJ-2020F",
	  "CJ-2020G", "CJ-2020H", "CJ-2020I", "CJ-2020J", "CJ-2020K", "CJ-2020L",
	  "Hades", "Hera", "Hypnos", "Iris", "Janus", "Kronos", "Limos", "Morpheus",
	  "Nemesis", "Nike", "Notus", "Oceanus", "Pan", "Persephone", "Phobos",
	  "Phoebe", "Rhea", "Selene", "Tartarus", "Tethys", "Thanatos", "Thetis",
	  "Tyche", "Uranus", "Zelus", "Zephyrus", "Zetes", "Zelus", "Zephyrus"
    ];
    this.allPlanets = [...this.planetNamesPool]; // Copy for reference
    this.planetsRelation = new Map(); // key: planetName, value: relation (-100 to 100)
    this.planetsPower = new Map();    // key: planetName, value: power level
    this.discoveredPlanets = [];      // The civs we have actually discovered

    // Player's planet name
    this.playerPlanetName = "Myst";

    // UI states
    this.infoShown = false; // Is the info (diplomacy) panel open?
  }

  /**
   * Initialize the game at page load. 
   * - Check or set user planet name in cookies
   * - Update the DOM
   */
  init() {
    this.loadPlayerPlanetName();
    this.setHeaderPlanetName();
    this.updateStatusUI();

    // Pre-initialize relations and powers for each possible planet
    this.allPlanets.forEach((planet) => {
      this.planetsRelation.set(planet, 0);
      this.planetsPower.set(planet, getRandomInt(10) + 5); 
    });

    this.displayNotification("游戏已启动。开始您的星际征程吧！", "info");
  }

  /**
   * Load player's planet name from cookie, or prompt if not set.
   */
  loadPlayerPlanetName() {
    const storedName = getCookie("username");
    if (storedName) {
      this.playerPlanetName = storedName;
      this.displayNotification("成功导入存档，" + storedName, "success");
    } else {
      const newName = prompt("为您的星球取一个名字：", this.playerPlanetName);
      if (newName && newName.trim() !== "") {
        this.playerPlanetName = newName;
        setCookie("username", newName, 30000);
        this.displayNotification("欢迎，" + newName + "！您的星球已命名。", "success");
      } else {
        this.displayNotification("未设置星球名称，默认名称已使用。", "warning");
      }
    }
  }

  /**
   * Update main header text to show the planet name.
   */
  setHeaderPlanetName() {
    const headerElem = document.getElementById("mainheader");
    // Prepend the player's planet name to existing content
    headerElem.innerHTML = this.playerPlanetName + " - " + headerElem.innerHTML;
  }

  /**
   * Utility to write game logs on the #dcon area, in a rolling fashion.
   * @param {string} str 
   */
  output(str) {
    if (this.commandIndex > this.MAXIMUM_LOG_LINES) {
      const clearIndex = this.commandIndex - this.MAXIMUM_LOG_LINES;
      const oldElem = document.getElementById("command" + clearIndex);
      if (oldElem) oldElem.innerHTML = "";
    }

    // Create or select the log line element
    let logLine = document.getElementById("command" + this.commandIndex);
    if (!logLine) {
      const dconElem = document.getElementById("dcon");
      const newDiv = document.createElement("div");
      newDiv.id = "command" + this.commandIndex;
      newDiv.classList.add("log-entry");
      dconElem.appendChild(newDiv);
      logLine = newDiv;
    }

    // Process the 'end' tag -> replaced with &nbsp;&nbsp;&nbsp;
    let processedStr = "";
    for (let i = 0; i < str.length; i++) {
      if (str[i] === 'e' && str[i + 1] === 'n' && str[i + 2] === 'd') {
        processedStr += "&nbsp;&nbsp;&nbsp;";
        i += 2;
      } else {
        processedStr += str[i];
      }
    }

    logLine.innerHTML += processedStr;
    this.commandIndex++;
  }

  /**
   * Display a notification message within the game interface.
   * @param {string} message - The message to display.
   * @param {string} type - The type of message: 'success', 'error', 'info', 'warning'.
   */
  displayNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    if (!notifications) return;

    const notif = document.createElement("div");
    notif.classList.add("notification", type);
    notif.innerText = message;

    notifications.appendChild(notif);

    // Automatically remove the notification after 5 seconds
    setTimeout(() => {
      notif.classList.add("fade-out");
      notif.addEventListener("transitionend", () => {
        notif.remove();
      });
    }, 5000);
  }

  /**
   * Check overall state each time a turn passes, including war resolution.
   */
  updateTurn() {
    this.updateStatusUI();

    // Passive relationship drift
    this.checkForWars();

    // If at war, conduct the "war loop"
    if (this.warState) {
      this.handleWar();
    }

    // Check if we've discovered or conquered everything
    if (this.checkGameEnd()) {
      this.directToSuccess();
    }
  }

  /**
   * Update the status UI elements.
   */
  updateStatusUI() {
    document.getElementById("showturn").innerText = this.turns.toString();
    document.getElementById("showland").innerText = this.lands.toString();
    document.getElementById("showcredits").innerText = this.credits.toString();
  }

  /**
   * Called each time a turn passes to "randomly" shift relations or trigger a war.
   */
  checkForWars() {
    // For each discovered planet, randomly shift relation
    for (let i = 0; i < this.discoveredPlanets.length; i++) {
      const planetName = this.discoveredPlanets[i];
      const currentRelation = this.planetsRelation.get(planetName);
      // Random delta in [-10, 10]
      const delta = getRandomInt(20) - 10;
      let newRelation = currentRelation + delta;

      if (newRelation > 100) newRelation = 100;
      if (newRelation < -100) newRelation = -100;

      this.planetsRelation.set(planetName, newRelation);

      // War trigger if relation dips to -100
      if (newRelation <= -100 && !this.warList.includes(planetName)) {
        this.displayNotification("战争！ " + this.playerPlanetName + " VS " + planetName, "error");
        this.warState = true;
        this.warList.push(planetName);
        this.colorRelationText(i, "red", "交战中！");
      } else {
        // Update UI color
        this.updateRelationUI(i, newRelation);
      }
    }
  }

  /**
   * Update the relation text color in the diplomacy panel.
   * @param {number} index - Index in discoveredPlanets 
   * @param {number} relationValue
   */
  updateRelationUI(index, relationValue) {
    const civColor = 
      relationValue > 0 ? "green" :
      relationValue === 0 ? "white" :
      "red";
    const civElem = document.getElementById("civ" + index + "c");
    if (civElem) {
      civElem.style.color = civColor;
      civElem.innerHTML = relationValue.toString();
    }
  }

  /**
   * Force color+text for the discovered planet's relation section.
   * @param {number} index 
   * @param {string} color 
   * @param {string} text 
   */
  colorRelationText(index, color, text) {
    const civElem = document.getElementById("civ" + index + "c");
    if (civElem) {
      civElem.style.color = color;
      civElem.innerHTML = text;
    }
  }

  /**
   * Main war handling loop. Blocks normal turn progression until war resolves.
   */
  handleWar() {
    // Calculate your power plus allies
    let myPower = this.lands;
    let allyNames = "";
    this.alliesList.forEach((ally) => {
      allyNames += ally + " ";
      myPower += this.planetsPower.get(ally) || 0;
    });

    // Calculate enemy power
    let enemyPower = 0;
    let enemyNames = "";
    this.warList.forEach((enemy) => {
      enemyNames += enemy + " ";
      enemyPower += this.planetsPower.get(enemy) || 0;
    });

    this.displayNotification(
      `您和 [${allyNames.trim()}] 联盟，正在与 [${enemyNames.trim()}] 交战。\n自动进入交战环节。\n注意：交战环节不计入总回合数，且禁用部分操作。`, 
      "warning"
    );

    // War resolution loop
    while (this.warState && myPower > 0 && enemyPower > 0) {
      const userInput = prompt(
        "请输入操作：\n" +
        "格式：\n" +
        "  at <星球名>  （进攻）\n" +
        "  ne <星球名>  （谈判）\n" +
        "(例如: at Zeus 或 ne Ares)"
      );
      if (!userInput) {
        // user pressed cancel, continue war
        continue;
      }

      const [action, target] = userInput.split(" ");
      if (action === "at") {
        // Attack
        const damage = getRandomInt(Math.floor((myPower * myPower) / enemyPower)) || 1;
        enemyPower -= damage;
        myPower += damage;
        this.lands += damage; 
        this.updatePlanetLand(target, -damage);
        this.displayNotification("您造成伤害 " + damage + " 点。", "success");

      } else if (action === "ne") {
        // Negotiate
        // If you're far stronger or random chance, accept
        if (myPower / enemyPower >= 2 || getRandomInt(3) === 2) {
          this.displayNotification("对方接受了停战。", "success");
          this.stopWar();
          break;
        } else {
          this.displayNotification("对方拒绝停战。", "warning");
        }

      } else {
        this.displayNotification("无效操作！", "error");
        continue;
      }

      // Enemy hits back
      const theirDamage = getRandomInt(Math.floor(myPower * 2 / 3)) || 1;
      enemyPower += theirDamage;
      myPower -= theirDamage;
      this.lands -= theirDamage;
      this.updatePlanetLand(target, theirDamage);
      this.displayNotification("对方造成伤害 " + theirDamage + " 点。", "error");

      // Check if we are destroyed
      if (myPower <= 0) {
        this.warState = false;
        this.displayNotification("失败！您的文明陷入了崩溃...", "error");
        this.directToFail();
      }
    }

    // If they are destroyed:
    if (enemyPower <= 0) {
      this.warState = false;
      this.displayNotification("胜利！您已击败敌对文明。", "success");
      // Conquer each planet in warList
      this.warList.forEach((enemy) => {
        this.outConquered.push(enemy);
        this.clearPlanetFromDiplomacy(enemy);
      });
      this.warList.splice(0, this.warList.length);
    }
  }

  /**
   * Stop a war, resetting war-related variables and setting relation=0.
   */
  stopWar() {
    this.warState = false;
    this.warList.forEach((enemy) => {
      // Reset relation to 0
      this.planetsRelation.set(enemy, 0);
      // Update UI
      const idx = this.discoveredPlanets.indexOf(enemy);
      if (idx >= 0) {
        this.colorRelationText(idx, "white", "0");
      }
    });
    this.warList = [];
  }

  /**
   * Update a planet's "lands" (power) in the UI after an attack or similar.
   */
  updatePlanetLand(planetName, delta) {
    const idx = this.discoveredPlanets.indexOf(planetName);
    if (idx >= 0) {
      const bElem = document.getElementById("civ" + idx + "b");
      if (bElem) {
        let val = parseInt(bElem.innerHTML, 10) || 0;
        val += delta;
        bElem.innerHTML = val.toString();
      }
    }
    // Also update our internal map of planet power
    const oldPower = this.planetsPower.get(planetName) || 0;
    this.planetsPower.set(planetName, oldPower + delta);
  }

  /**
   * Clear a civilization from the diplomacy panel once conquered or destroyed.
   */
  clearPlanetFromDiplomacy(planetName) {
    const idx = this.discoveredPlanets.indexOf(planetName);
    if (idx < 0) return;
    // Erase the relevant elements
    document.getElementById("civ" + idx)?.remove();
    document.getElementById("civ" + idx + "b")?.remove();
    document.getElementById("civ" + idx + "c")?.remove();
    document.getElementById("civ" + idx + "d")?.remove();

    // Remove from discoveredPlanets
    this.discoveredPlanets.splice(idx, 1);
    this.foundedCivs--;

    this.displayNotification("您已征服 " + planetName + "。", "success");
  }

  /**
   * Check if the game should end (e.g. discovered or conquered all).
   * @returns {boolean}
   */
  checkGameEnd() {
    // Example condition: once you conquer/discover 19 civs, or your outConquered is 19
    // You can customize as you like.
    return this.outConquered.length >= 19 || this.foundedCivs >= 19;
  }

  /**
   * For now, just display a success message and maybe redirect or restart.
   */
  directToSuccess() {
    this.displayNotification("恭喜！你已经征服或发现所有文明！", "success");
    // Additional success logic can be added here, e.g., redirect to a victory screen
  }

  /**
   * For now, just display a failure message and maybe reload or show a game over screen.
   */
  directToFail() {
    this.displayNotification("很遗憾，你的文明陷入了崩溃... 游戏结束。", "error");
    // Additional fail logic can be added here, e.g., redirect to a game over screen
    // Optionally reload the game after a delay
    setTimeout(() => {
      location.reload();
    }, 3000);
  }

  /**
   * Return the date in a lore-friendly format (e.g., "新元1005年").
   */
  getGameDate() {
    return "新元" + (1000 + this.turns) + "年 ";
  }

  /**
   * Toggle the diplomacy panel.
   */
  toggleDiplomacy() {
    const infoElem = document.getElementById("info");
    const watchBtn = document.getElementById("watchciv");
    if (!this.infoShown) {
      infoElem.style.display = "block";
      watchBtn.innerHTML = "收起外交";
      this.infoShown = true;
    } else {
      infoElem.style.display = "none";
      watchBtn.innerHTML = "查看外交";
      this.infoShown = false;
    }
  }

  /**
   * Trigger a command input box. 
   */
  openActionsPanel() {
    const cmdElem = document.getElementById("cmd");
    cmdElem.style.display = "flex"; // Changed to flex for better layout
    cmdElem.classList.add("active");
  }

  /**
   * Close the command input box.
   */
  closeActionsPanel() {
    const cmdElem = document.getElementById("cmd");
    cmdElem.style.display = "none";
    cmdElem.classList.remove("active");
  }

  /**
   * Process user command typed in the custom console (e.g., "Imp Neptune").
   */
  sendCommand() {
    const cmdElem = document.getElementById("cmd");
    if (cmdElem.style.display !== "flex") {
      this.displayNotification("无效指令面板状态！", "error");
      document.getElementById("input").value = "";
      return;
    }

    const curCmd = document.getElementById("input").value.trim();
    document.getElementById("input").value = "";
    if (!curCmd) return;

    this.commandsSent++;
    if (this.commandsSent >= 7) {
      for (let i = 1; i <= 7; i++) {
        const line = document.getElementById("cmd" + i);
        if (line) line.innerHTML = "";
      }
      this.commandsSent = 1;
    }

    // Log to mini console
    const cmdLine = document.getElementById("cmd" + this.commandsSent);
    if (cmdLine) {
      cmdLine.innerHTML = `Turn #${this.turns} > ${curCmd}`;
    }

    // Close the actions panel
    this.closeActionsPanel();

    // Parse the command
    const [op, obj] = curCmd.split(" ");
    if (!op) return;

    switch (op) {
      case "Imp": // Improve
        this.handleImproveRelation(obj);
        break;
      case "Ins": // Insult or reduce relation
        this.handleInsultRelation(obj);
        break;
      case "Req":
        this.handleRequest(obj);
        break;
      case "War":
        this.handleDeclareWar(obj);
        break;
      case "Trade":
        this.handleTrade(obj);
        break;
      case "Research":
        this.handleResearch();
        break;
      default:
        this.displayNotification("无效指令！", "error");
        return;
    }
  }

  /**
   * Command: Improve relation with a discovered planet.
   */
  handleImproveRelation(planet) {
    this.displayNotification("与 " + planet + " 改善关系", "info");
    const idx = this.discoveredPlanets.indexOf(planet);
    if (idx < 0) {
      this.displayNotification("目标星球尚未发现或无效。", "error");
      return;
    }
    let rel = this.planetsRelation.get(planet) || 0;
    if (rel < -99) {
      this.displayNotification("正处于战争中！ 无法改善。", "warning");
      return;
    }
    rel += 10;
    if (rel > 100) {
      rel = 100;
      // Optionally notify about maximum relation
      this.displayNotification("外交官已将与 " + planet + " 的关系提升至最高。", "info");
    }
    this.planetsRelation.set(planet, rel);
    this.updateRelationUI(idx, rel);
    this.displayNotification("与 " + planet + " 的关系提升至 " + rel + "。", "success");
  }

  /**
   * Command: Insult or reduce relation with a discovered planet.
   */
  handleInsultRelation(planet) {
    this.displayNotification("与 " + planet + " 关系恶化", "info");
    const idx = this.discoveredPlanets.indexOf(planet);
    if (idx < 0) {
      this.displayNotification("目标星球尚未发现或无效。", "error");
      return;
    }
    let rel = this.planetsRelation.get(planet) || 0;
    rel -= 10;
    if (rel <= -100) {
      rel = -100;
      this.warState = true;
      if (!this.warList.includes(planet)) this.warList.push(planet);
      this.colorRelationText(idx, "red", "交战中！");
      this.displayNotification("战争！\n" + this.playerPlanetName + " VS " + planet, "error");
    } else {
      this.planetsRelation.set(planet, rel);
      this.updateRelationUI(idx, rel);
      this.displayNotification("与 " + planet + " 的关系降低至 " + rel + "。", "warning");
    }
  }

  /**
   * Command: Request action with a discovered planet (e.g., trade, alliance).
   * @param {string} planet 
   */
  handleRequest(planet) {
    // For demonstration, we show a prompt for the request type
    const typ = prompt(
      "请输入请求类型：\n" +
      "1. 交易请求\n" +
      "2. 结盟请求\n" +
      "3. 退出联盟\n" +
      "(示例：输入数字 1 或 2 或 3)"
    );
    const idx = this.discoveredPlanets.indexOf(planet);
    if (idx < 0) {
      this.displayNotification("目标星球尚未发现或无效。", "error");
      return;
    }
    const rel = this.planetsRelation.get(planet) || 0;
    switch (typ) {
      case "1":
        this.displayNotification("请求 " + planet + " 进行交易。", "info");
        // Possibly shift relation, or open some trade UI
        break;
      case "2":
        if (rel < 20) {
          this.displayNotification("对方拒绝了联盟请求，关系不足！", "warning");
        } else {
          this.displayNotification("与 " + planet + " 结成了联盟。", "success");
          if (!this.alliesList.includes(planet)) {
            this.alliesList.push(planet);
            this.displayNotification("联盟列表已更新。", "info");
          }
        }
        break;
      case "3":
        this.displayNotification("已退出与 " + planet + " 的联盟。", "info");
        this.alliesList = this.alliesList.filter((ally) => ally !== planet);
        break;
      default:
        this.displayNotification("无效或取消的请求类型。", "error");
    }
  }

  /**
   * Command: Declare war on a discovered planet.
   */
  handleDeclareWar(planet) {
    this.displayNotification("向 " + planet + " 宣战！", "info");
    const idx = this.discoveredPlanets.indexOf(planet);
    if (idx < 0) {
      this.displayNotification("目标星球尚未发现或无效。", "error");
      return;
    }
    this.planetsRelation.set(planet, -100);
    this.warState = true;
    if (!this.warList.includes(planet)) {
      this.warList.push(planet);
    }
    this.colorRelationText(idx, "red", "交战中！");
    this.displayNotification("战争状态已开启，与 " + planet + " 正在交战。", "error");
  }

  /**
   * Command: Trade with a discovered planet using your "credits".
   * e.g. "Trade Neptune" 
   * In practice, you'd have some negotiation or exchange logic here.
   */
  handleTrade(planet) {
    const idx = this.discoveredPlanets.indexOf(planet);
    if (idx < 0) {
      this.displayNotification("目标星球尚未发现或无效。", "error");
      return;
    }
    const cost = getRandomInt(10);
    if (this.credits < cost) {
      this.displayNotification("您的资源不足，无法完成交易。", "warning");
      return;
    }
    this.displayNotification("与 " + planet + " 进行交易，消耗 " + cost + " 点资源。", "success");
    this.credits -= cost;
    // Possibly raise relation a bit
    let rel = this.planetsRelation.get(planet) || 0;
    rel += 5;
    if (rel > 100) rel = 100;
    this.planetsRelation.set(planet, rel);
    this.updateRelationUI(idx, rel);
    this.displayNotification("与 " + planet + " 的关系提升至 " + rel + "。", "success");
  }

  /**
   * Command: Spend resources on "research" to increment your power or lands.
   */
  handleResearch() {
    const cost = 20;
    if (this.credits < cost) {
      this.displayNotification("研究所需的资源不足 (需要 " + cost + "点)", "warning");
      return;
    }
    this.credits -= cost;
    const gain = getRandomInt(3); 
    this.lands += gain; // Alternatively, could store a "technologyLevel" variable
    this.displayNotification("研究完成！ 获得 " + gain + " 点殖民力。", "success");
    this.updateStatusUI();
  }

  /**
   * Clear cookies and reload game to start fresh.
   */
  clearAllData() {
    const op = prompt("您确定要清除存档吗？（Y/N）");
    if (op === "N" || op === "n") return;
    setCookie("username", "", 30000);
    this.displayNotification("存档已清除。游戏即将重新加载。", "info");
    setTimeout(() => {
      location.reload();
    }, 2000);
  }

  /**
   * Perform an "explore" action (one turn).
   * Discover a new planet or claim an uninhabited system.
   */
  explore() {
    this.commandIndex++;
    this.turns++;

    // Trigger random events before the actual exploration
    this.maybeRandomEvent();

    // 2 in 3 chance to discover lifeless planet, otherwise discover a civ (if not too many)
    if (getRandomInt(3) !== 3 || this.foundedCivs >= 17) {
      // Found uninhabited system
      this.output(this.getGameDate() + "end" + this.playerPlanetName + " 发现了一块无生命的新星球并占领了它......");
      this.lands++;
      this.displayNotification("您发现并占领了一块无生命的新星球。领土增加！", "success");
    } else {
      // Discover a new civ
      this.newPlanetDetected();
    }
    this.updateTurn();
  }

  /**
   * Possibly trigger a random event each turn, e.g., meteor shower or resource gain.
   */
  maybeRandomEvent() {
    const roll = getRandomInt(10);
    switch (roll) {
      case 1:
        // Minor meteor strike, lose some lands
        if (this.lands > 1) {
          const lost = getRandomInt(2);
          this.lands = Math.max(1, this.lands - lost);
          this.output(this.getGameDate() + "end流星雨来袭，您的殖民地遭受 " + lost + " 点损失！");
          this.displayNotification("流星雨来袭，您的殖民地遭受 " + lost + " 点损失！", "warning");
        }
        break;
      case 2:
        // Gain random credits
        const gained = getRandomInt(10);
        this.credits += gained;
        this.output(this.getGameDate() + "end星际货运商路过，您获得了 " + gained + " 点资源！");
        this.displayNotification("星际货运商路过，您获得了 " + gained + " 点资源！", "success");
        break;
      // Add more interesting random events here
      default:
        // No event
        break;
    }
  }

  /**
   * Logic for discovering a new planet with a civ.
   */
  newPlanetDetected() {
    shuffleAndTrim(this.planetNamesPool);
    let newIndex = getRandomInt(this.planetNamesPool.length) - 1;
    let newName = this.planetNamesPool[newIndex];
    // Ensure the discovered planet isn't the player's planet or undefined
    while (!newName || newName === this.playerPlanetName) {
      newIndex = getRandomInt(this.planetNamesPool.length) - 1;
      newName = this.planetNamesPool[newIndex];
    }

    this.output(this.getGameDate() + "end" + this.playerPlanetName + " 发现了新文明：" + newName + "......");
    this.displayNotification("发现新文明：" + newName + "。请前往控制栏查看外交。", "info");

    // Remove from the local planet pool
    this.planetNamesPool.splice(newIndex, 1);

    this.discoveredPlanets.push(newName);
    const i = this.discoveredPlanets.length - 1;
    this.foundedCivs++;

    // Random initial relation [-100, 100]
    const initialRelation = getRandomInt(200) - 100;
    this.planetsRelation.set(newName, initialRelation);

    // Planet power depends on player's lands for a bit of balance
    const planetPower = getRandomInt(this.lands * 2);
    this.planetsPower.set(newName, planetPower);

    // Show on diplomacy UI
    const infoElem = document.getElementById("info");

    // Create a container for the new planet
    const civRow = document.createElement("div");
    civRow.classList.add("civ-row");

    // Name
    const civName = document.createElement("p");
    civName.classList.add("civ-name");
    civName.innerText = newName;
    civRow.appendChild(civName);

    // Power
    const civPowerElem = document.createElement("p");
    civPowerElem.classList.add("civ-power");
    civPowerElem.innerText = planetPower.toString();
    civRow.appendChild(civPowerElem);

    // Relation
    const civRel = document.createElement("p");
    civRel.classList.add("civ-relation");
    civRel.innerText = initialRelation.toString();
    if (initialRelation > 0) {
      civRel.style.color = "green";
    } else if (initialRelation === 0) {
      civRel.style.color = "white";
    } else {
      civRel.style.color = "red";
    }
    civRow.appendChild(civRel);

    // Action button (opens commands)
    const civBtn = document.createElement("button");
    civBtn.classList.add("civ-action-button");
    civBtn.innerText = "点击";
    civBtn.onclick = () => this.openActionsPanel();
    civRow.appendChild(civBtn);

    // Append the row to the diplomacy info panel
    infoElem.appendChild(civRow);
}

}

// -----------------------------------------------------
//  Global game instance + binding to window
// -----------------------------------------------------
window.onload = function () {
  // Create game instance
  window.spaceGame = new SpaceGame();
  spaceGame.init();
};

// Example direct functions that might be called from buttons in your HTML:

window.watchciv = function () {
  spaceGame.toggleDiplomacy();
};

window.actions = function () {
  spaceGame.openActionsPanel();
};

window.revaction = function () {
  spaceGame.closeActionsPanel();
};

window.sendcommand = function () {
  spaceGame.sendCommand();
};

window.explore = function () {
  spaceGame.explore();
};

window.clearall = function () {
  spaceGame.clearAllData();
};
