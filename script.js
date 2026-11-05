(function () {
  "use strict";
  var LS_KEY = "hoopTrackerPlayers_v1";
  var players = [];
  try {
    players = JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch (e) {
    players = [];
  }
  var currentId = null;

  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(players));
    } catch (e) {}
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function totals(p) {
    return {
      fgm: p.p2m + p.p3m,
      fga: p.p2a + p.p3a,
      pts: 2 * p.p2m + 3 * p.p3m,
    };
  }

  function render() {
    var tb = document.getElementById("tbody");
    var tf = document.getElementById("tfoot");
    var empty = document.getElementById("emptyMsg");
    tb.innerHTML = "";
    var T = {
      p2m: 0,
      p2a: 0,
      p3m: 0,
      p3a: 0,
      fgm: 0,
      fga: 0,
      pts: 0,
      ast: 0,
      reb: 0,
      stl: 0,
      blk: 0,
    };

    players.forEach(function (p) {
      var t = totals(p);
      var pct = t.fga ? ((100 * t.fgm) / t.fga).toFixed(1) : "0.0";
      var tr = document.createElement("tr");
      tr.className = "player";
      tr.dataset.id = p.id;
      tr.innerHTML =
        '<td class="name">' +
        esc(p.name) +
        "<small>tap to log</small></td>" +
        "<td>" +
        t.fgm +
        "/" +
        t.fga +
        "</td>" +
        "<td>" +
        p.p3m +
        "/" +
        p.p3a +
        "</td>" +
        "<td>" +
        pct +
        "</td>" +
        '<td class="pts">' +
        t.pts +
        "</td>" +
        '<td class="ast">' +
        p.ast +
        "</td>" +
        '<td class="reb">' +
        p.reb +
        "</td>" +
        '<td class="stl">' +
        p.stl +
        "</td>" +
        '<td class="blk">' +
        p.blk +
        "</td>";
      tb.appendChild(tr);

      T.p2m += p.p2m;
      T.p2a += p.p2a;
      T.p3m += p.p3m;
      T.p3a += p.p3a;
      T.fgm += t.fgm;
      T.fga += t.fga;
      T.pts += t.pts;
      T.ast += p.ast;
      T.reb += p.reb;
      T.stl += p.stl;
      T.blk += p.blk;
    });

    empty.style.display = players.length ? "none" : "block";

    var Tpct = T.fga ? ((100 * T.fgm) / T.fga).toFixed(1) : "0.0";
    tf.innerHTML =
      "<tr>" +
      '<td class="name">TOTALS</td>' +
      "<td>" +
      T.fgm +
      "/" +
      T.fga +
      "</td>" +
      "<td>" +
      T.p3m +
      "/" +
      T.p3a +
      "</td>" +
      "<td>" +
      Tpct +
      "</td>" +
      '<td class="pts">' +
      T.pts +
      "</td>" +
      '<td class="ast">' +
      T.ast +
      "</td>" +
      '<td class="reb">' +
      T.reb +
      "</td>" +
      '<td class="stl">' +
      T.stl +
      "</td>" +
      '<td class="blk">' +
      T.blk +
      "</td>" +
      "</tr>";
  }

  function addPlayer() {
    var inp = document.getElementById("nameInput");
    var name = inp.value.trim();
    if (!name) return;
    players.push({
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      name: name,
      p2m: 0,
      p2a: 0,
      p3m: 0,
      p3a: 0,
      ast: 0,
      reb: 0,
      stl: 0,
      blk: 0,
    });
    inp.value = "";
    save();
    render();
    inp.focus();
  }
  document.getElementById("addBtn").addEventListener("click", addPlayer);
  document
    .getElementById("nameInput")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") addPlayer();
    });

  document.getElementById("resetBtn").addEventListener("click", function () {
    if (!players.length) return;
    if (confirm("Reset all stats to zero? Players will be kept.")) {
      players.forEach(function (p) {
        p.p2m = 0;
        p.p2a = 0;
        p.p3m = 0;
        p.p3a = 0;
        p.ast = 0;
        p.reb = 0;
        p.stl = 0;
        p.blk = 0;
      });
      save();
      render();
    }
  });

  /* ----- sheet ----- */
  var sheet = document.getElementById("sheet");
  var backdrop = document.getElementById("backdrop");

  function current() {
    return (
      players.find(function (p) {
        return p.id === currentId;
      }) || null
    );
  }

  function refreshSheet() {
    var p = current();
    if (!p) return;
    document.getElementById("sheetName").textContent = p.name;
    var t = totals(p);
    document.getElementById("sheetLine").textContent =
      t.pts +
      " PTS · " +
      t.fgm +
      "/" +
      t.fga +
      " FG · " +
      p.ast +
      " AST · " +
      p.reb +
      " REB · " +
      p.stl +
      " STL · " +
      p.blk +
      " BLK";
    document.getElementById("v2m").textContent = p.p2m;
    document.getElementById("v2a").textContent = p.p2a;
    document.getElementById("v3m").textContent = p.p3m;
    document.getElementById("v3a").textContent = p.p3a;
    document.getElementById("vast").textContent = p.ast;
    document.getElementById("vreb").textContent = p.reb;
    document.getElementById("vstl").textContent = p.stl;
    document.getElementById("vblk").textContent = p.blk;
  }

  function openSheet(id) {
    currentId = id;
    refreshSheet();
    sheet.classList.add("open");
    backdrop.classList.add("open");
  }
  function closeSheet() {
    sheet.classList.remove("open");
    backdrop.classList.remove("open");
    currentId = null;
    render();
  }

  document.getElementById("tbody").addEventListener("click", function (e) {
    var tr = e.target.closest("tr.player");
    if (tr) openSheet(tr.dataset.id);
  });
  document.getElementById("closeBtn").addEventListener("click", closeSheet);
  backdrop.addEventListener("click", closeSheet);

  document.getElementById("delBtn").addEventListener("click", function () {
    var p = current();
    if (!p) return;
    if (confirm('Remove "' + p.name + '" and all their stats?')) {
      players = players.filter(function (x) {
        return x.id !== p.id;
      });
      save();
      closeSheet();
    }
  });

  /* stat buttons: +Made also adds the attempt */
  sheet.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var p = current();
    if (!p) return;
    var s = b.dataset.stat,
      u = b.dataset.undo;

    if (s === "p2m") {
      p.p2m++;
      p.p2a++;
    } else if (s === "p2a") {
      p.p2a++;
    } else if (s === "p3m") {
      p.p3m++;
      p.p3a++;
    } else if (s === "p3a") {
      p.p3a++;
    } else if (s === "ast") {
      p.ast++;
    } else if (u === "p2") {
      /* undo 2P: prefer removing a make (and its attempt), else remove a miss */
      if (p.p2m > 0) {
        p.p2m--;
        p.p2a--;
      } else if (p.p2a > 0) {
        p.p2a--;
      }
    } else if (u === "p3") {
      /* undo 3P: same logic */
      if (p.p3m > 0) {
        p.p3m--;
        p.p3a--;
      } else if (p.p3a > 0) {
        p.p3a--;
      }
    } else if (u === "ast" && p.ast > 0) {
      p.ast--;
    } else if (s === "reb") {
      p.reb++;
    } else if (s === "stl") {
      p.stl++;
    } else if (s === "blk") {
      p.blk++;
    } else if (u === "reb" && p.reb > 0) {
      p.reb--;
    } else if (u === "stl" && p.stl > 0) {
      p.stl--;
    } else if (u === "blk" && p.blk > 0) {
      p.blk--;
    }

    save();
    refreshSheet();
    render();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSheet();
  });

  render();
})();
