"use strict";

const LOCAL_STORAGE_KEY = "playerV1";
let players = [];

try {
  players = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
} catch (parseError) {
  players = [];
}

let selectedPlayerId = null;

function savePlayersToStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(players));
  } catch (storageError) {}
}

function escapeHtmlCharacters(rawString) {
  return String(rawString).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char];
  });
}

function calculatePlayerTotals(player) {
  return {
    fieldGoalsMade: player.twoPointersMade + player.threePointersMade,
    fieldGoalsAttempted:
      player.twoPointersAttempted + player.threePointersAttempted,
    pointsScored: 2 * player.twoPointersMade + 3 * player.threePointersMade,
  };
}

function getSelectedPlayer() {
  return (
    players.find(function (player) {
      return player.id === selectedPlayerId;
    }) || null
  );
}

function renderPlayerStatsTable() {
  const tableBody = document.getElementById("playersTableBody");
  const tableFooter = document.getElementById("playersTableFooter");
  const emptyStateMessage = document.getElementById("emptyStateMessage");
  tableBody.innerHTML = "";
  const overallTotals = {
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    pointsScored: 0,
    assists: 0,
  };

  players.forEach(function (player) {
    const playerTotals = calculatePlayerTotals(player);
    const fieldGoalPercentage = playerTotals.fieldGoalsAttempted
      ? (
          (100 * playerTotals.fieldGoalsMade) /
          playerTotals.fieldGoalsAttempted
        ).toFixed(1)
      : "0.0";
    const tableRow = document.createElement("tr");
    tableRow.className = "player";
    tableRow.dataset.id = player.id;
    tableRow.innerHTML = `
            <td class="name">${escapeHtmlCharacters(player.name)}<small>tap to log</small></td>
            <td>${playerTotals.fieldGoalsMade}/${playerTotals.fieldGoalsAttempted}</td>
            <td>${player.threePointersMade}/${player.threePointersAttempted}</td>
            <td>${fieldGoalPercentage}</td>
            <td class="pts">${playerTotals.pointsScored}</td>
            <td class="ast">${player.assists}</td>
        `;
    tableBody.appendChild(tableRow);

    overallTotals.fieldGoalsMade += playerTotals.fieldGoalsMade;
    overallTotals.fieldGoalsAttempted += playerTotals.fieldGoalsAttempted;
    overallTotals.threePointersMade += player.threePointersMade;
    overallTotals.threePointersAttempted += player.threePointersAttempted;
    overallTotals.pointsScored += playerTotals.pointsScored;
    overallTotals.assists += player.assists;
  });

  emptyStateMessage.style.display = players.length ? "none" : "block";

  const overallFieldGoalPercentage = overallTotals.fieldGoalsAttempted
    ? (
        (100 * overallTotals.fieldGoalsMade) /
        overallTotals.fieldGoalsAttempted
      ).toFixed(1)
    : "0.0";
  tableFooter.innerHTML =
    "<tr>" +
    '<td class="name">TOTALS</td>' +
    "<td>" +
    overallTotals.fieldGoalsMade +
    "/" +
    overallTotals.fieldGoalsAttempted +
    "</td>" +
    "<td>" +
    overallTotals.threePointersMade +
    "/" +
    overallTotals.threePointersAttempted +
    "</td>" +
    "<td>" +
    overallFieldGoalPercentage +
    "</td>" +
    '<td class="pts">' +
    overallTotals.pointsScored +
    "</td>" +
    '<td class="ast">' +
    overallTotals.assists +
    "</td>" +
    "</tr>";
}

function addPlayer() {
  const nameInputElement = document.getElementById("nameInput");
  const cleanedPlayerName = nameInputElement.value.trim();
  if (!cleanedPlayerName) return;

  players.push({
    id: Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    name: cleanedPlayerName,
    twoPointersMade: 0,
    twoPointersAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    assists: 0,
  });

  nameInputElement.value = "";
  savePlayersToStorage();
  renderPlayerStatsTable();
  nameInputElement.focus();
}

document.getElementById("addBtn").addEventListener("click", addPlayer);
document.getElementById("nameInput").addEventListener("keydown", function (eventKey) {
  if (eventKey.key === "Enter") addPlayer();
});

document
  .getElementById("resetSessionBtn")
  .addEventListener("click", function () {
    if (!players.length) return;
    if (confirm("Reset all stats to zero? Players will be kept.")) {
      players.forEach(function (player) {
        player.twoPointersMade = 0;
        player.twoPointersAttempted = 0;
        player.threePointersMade = 0;
        player.threePointersAttempted = 0;
        player.assists = 0;
      });
      savePlayersToStorage();
      renderPlayerStatsTable();
    }
  });

const statsSheetElement = document.getElementById("playerStatsSheet");
const backdropElement = document.getElementById("sheetBackdrop");

function refreshPlayerStatsSheet() {
  const selectedPlayer = getSelectedPlayer();
  if (!selectedPlayer) return;
  document.getElementById("sheetPlayerName").textContent = selectedPlayer.name;

  const playerTotals = calculatePlayerTotals(selectedPlayer);
  document.getElementById("sheetSummaryLine").textContent =
    playerTotals.pointsScored +
    " PTS · " +
    playerTotals.fieldGoalsMade +
    "/" +
    playerTotals.fieldGoalsAttempted +
    " FG · " +
    selectedPlayer.assists +
    " AST";

  document.getElementById("twoPointersMadeValue").textContent =
    selectedPlayer.twoPointersMade;
  document.getElementById("twoPointersAttemptedValue").textContent =
    selectedPlayer.twoPointersAttempted;
  document.getElementById("threePointersMadeValue").textContent =
    selectedPlayer.threePointersMade;
  document.getElementById("threePointersAttemptedValue").textContent =
    selectedPlayer.threePointersAttempted;
  document.getElementById("assistsValue").textContent = selectedPlayer.assists;
}

function openPlayerStatsSheet(playerId) {
  selectedPlayerId = playerId;
  refreshPlayerStatsSheet();
  statsSheetElement.classList.add("open");
  backdropElement.classList.add("open");
}

function closePlayerStatsSheet() {
  statsSheetElement.classList.remove("open");
  backdropElement.classList.remove("open");
  selectedPlayerId = null;
  renderPlayerStatsTable();
}

document
  .getElementById("playersTableBody")
  .addEventListener("click", function (e) {
    const row = e.target.closest("tr.player");
    if (row) openPlayerStatsSheet(row.dataset.id);
  });

document
  .getElementById("closeSheetBtn")
  .addEventListener("click", closePlayerStatsSheet);
backdropElement.addEventListener("click", closePlayerStatsSheet);

document
  .getElementById("deletePlayerBtn")
  .addEventListener("click", function () {
    const selectedPlayer = getSelectedPlayer();
    if (!selectedPlayer) return;

    if (confirm('Remove "' + selectedPlayer.name + '" and all their stats?')) {
      players = players.filter(function (player) {
        return player.id !== selectedPlayer.id;
      });
      savePlayersToStorage();
      closePlayerStatsSheet();
    }
  });

statsSheetElement.addEventListener("click", function (e) {
  const clickedButton = e.target.closest("button");
  if (!clickedButton) return;

  const selectedPlayer = getSelectedPlayer();
  if (!selectedPlayer) return;

  const statToIncrement = clickedButton.dataset.stat;
  const statToUndo = clickedButton.dataset.undo;

  if (statToIncrement === "twoPointersMade") {
    selectedPlayer.twoPointersMade++;
    selectedPlayer.twoPointersAttempted++;
  } else if (statToIncrement === "twoPointersAttempted") {
    selectedPlayer.twoPointersAttempted++;
  } else if (statToIncrement === "threePointersMade") {
    selectedPlayer.threePointersMade++;
    selectedPlayer.threePointersAttempted++;
  } else if (statToIncrement === "threePointersAttempted") {
    selectedPlayer.threePointersAttempted++;
  } else if (statToIncrement === "assists") {
    selectedPlayer.assists++;
  } else if (statToUndo === "twoPointers") {
    if (selectedPlayer.twoPointersMade > 0) {
      selectedPlayer.twoPointersMade--;
      selectedPlayer.twoPointersAttempted--;
    } else if (selectedPlayer.twoPointersAttempted > 0) {
      selectedPlayer.twoPointersAttempted--;
    }
  } else if (statToUndo === "threePointers") {
    if (selectedPlayer.threePointersMade > 0) {
      selectedPlayer.threePointersMade--;
      selectedPlayer.threePointersAttempted--;
    } else if (selectedPlayer.threePointersAttempted > 0) {
      selectedPlayer.threePointersAttempted--;
    }
  } else if (statToUndo === "assists" && selectedPlayer.assists > 0) {
    selectedPlayer.assists--;
  }

  savePlayersToStorage();
  refreshPlayerStatsSheet();
  renderPlayerStatsTable();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closePlayerStatsSheet();
});

renderPlayerStatsTable();
