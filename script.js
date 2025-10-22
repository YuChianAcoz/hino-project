$(document).ready(function () {
  var data = {};
  var now = new Date();
  var currentYear = now.getFullYear().toString();
  var currentMonth = now.getMonth() + 1;

  var quarterMap = {
    Q1: ["01", "02", "03"],
    Q2: ["04", "05", "06"],
    Q3: ["07", "08", "09"],
    Q4: ["10", "11", "12"]
  };
  var quarterNames = { Q1: "一", Q2: "二", Q3: "三", Q4: "四" };

  /* ---------------- 安全工具函式 ---------------- */

  function safeHttpUrl(u) {
    try {
      if (!u) return "";
      if (/^(?:\.{0,2}\/|assets\/)/.test(u)) return u;
      var url = new URL(u, location.origin);
      return url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  }

  function safeTel(u) {
    if (!u) return "";
    return /^tel:[0-9+\-*#\s]+$/.test(u) ? u : "";
  }

  function setSafeHref($el, raw) {
    var v = "";
    if (typeof raw === "string" && raw.startsWith("tel:")) v = safeTel(raw);
    else v = safeHttpUrl(raw);

    if (!v) {
      $el.attr("href", "#").attr("rel", "nofollow noopener noreferrer");
    } else {
      $el.attr("href", v).attr("rel", "noopener noreferrer");
    }
  }

  function appendSafe($parent, $child) {
    if (!$parent || !$child) return;
    var parentEl = $parent[0] || $parent;
    var childEl = $child[0] || $child;
    if (parentEl && childEl && parentEl.appendChild && childEl.nodeType === 1) {
      parentEl.appendChild(childEl);
    }
  }

  function divWithText(cls, txt) {
    var $d = $("<div>");
    if (cls) $d.addClass(cls);
    $d.text(typeof txt === "string" ? txt : (txt || ""));
    return $d;
  }

  function isSafeYear(y) {
    return typeof y === "string" && /^\d{4}$/.test(y);
  }
  function isSafeQuarter(q) {
    return q === "Q1" || q === "Q2" || q === "Q3" || q === "Q4";
  }

  $.getJSON("data.json", function (json) {
    data = json["微笑大使"];

    var currentQuarter =
      (currentMonth >= 4 && currentMonth <= 6) ? "Q2" :
      (currentMonth >= 7 && currentMonth <= 9) ? "Q3" :
      (currentMonth >= 10) ? "Q4" : "Q1";

    if (data[currentYear]) {
      populateYearSelector(currentYear);
      populateQuarterSelector(currentYear, currentQuarter);
    } else {
      var firstYear = Object.keys(data).sort().reverse()[0];
      populateYearSelector(firstYear);
      populateQuarterSelector(firstYear, "Q1");
    }

    $("#current").on("click", function () {
      var nowYear = new Date().getFullYear().toString();
      var nowMonth = new Date().getMonth() + 1;
      var nowQuarter =
        (nowMonth >= 4 && nowMonth <= 6) ? "Q2" :
        (nowMonth >= 7 && nowMonth <= 9) ? "Q3" :
        (nowMonth >= 10) ? "Q4" : "Q1";

      console.log(nowYear);
      console.log(nowMonth);
      console.log(nowQuarter);
      
      if (data[nowYear]) {
        populateQuarterSelector(nowYear, nowQuarter);
      } else {
        alert("當年度目前尚無資料");
      }
    });
  });

  /* ---------------- UI 行為 ---------------- */

  function populateYearSelector(selectedYear) {
    var $menu = $("#customSelectorMenu").empty();
    var years = Object.keys(data).sort().reverse();

    years.forEach(function (year) {
      if (year === currentYear) return;
      var safeYear = /^\d{4}$/.test(String(year)) ? String(year) : null;
      if (!safeYear) return;

      var $li = $("<li>");
      $li.text(safeYear);
      $li.on("click", function () {
        populateQuarterSelector(safeYear);
        $menu.hide();
      });
      appendSafe($menu, $li);
    });

    var $hero = $("<li>").text("服務英雄").on("click", function () {
      var w = window.open("https://www.hino.com.tw/hinohero", "_blank", "noopener,noreferrer");
      if (w) w.opener = null;
      $menu.hide();
    });
    appendSafe($menu, $hero);
  }

  $("#customSelectorBtn").on("click", function (e) {
    e.stopPropagation();
    $("#customSelectorMenu").toggle();
  });
  $(document).on("click", function () {
    $("#customSelectorMenu").hide();
  });

  function populateQuarterSelector(year, preselectQuarter = "Q1") {
    var $quarterSelector = $("#seasonSelector").empty();
    var selectEl = $quarterSelector[0];
    var validQuarters = [];
    var safeYear = isSafeYear(String(year)) ? String(year) : "";

    if (!isSafeQuarter(preselectQuarter)) preselectQuarter = "Q1";

    $.each(quarterMap, function (quarter, months) {
      if (!isSafeQuarter(quarter)) return;

      var hasData = months.some(function (m) {
        return data[year] && data[year][m];
      });

      if (hasData) {
        validQuarters.push(quarter);

        var opt = document.createElement("option");
        opt.value = quarter; // value 取自白名單 quarter
        var label = (safeYear ? safeYear : "") + "年第" + quarterNames[quarter] + "次微笑大使";
        opt.textContent = label;

        if (quarter === preselectQuarter) opt.selected = true;

        if (typeof selectEl.add === "function") {
          selectEl.add(opt);
        } else {
          selectEl.appendChild(opt);
        }
      }
    });

    var selectedQuarter = validQuarters.includes(preselectQuarter) ? preselectQuarter : validQuarters[0];
    if (selectedQuarter) updateContent(year, selectedQuarter);
    else updateContent(year, null);

    $quarterSelector.off("change").on("change", function () {
      var v = $(this).val();
      if (isSafeQuarter(v)) {
        updateContent(year, v);
      }
    });
  }
  
  function updateContent(year, quarter) {
    var nowYear = new Date().getFullYear().toString();
    var $breadcrumb = $("#breadcrumb").empty();
    var $grid = $("#ambassadorGrid").empty();

    $breadcrumb[0].appendChild(document.createTextNode("微笑大使 › "));
    var $hl = $("<span>").addClass("highlight");
    if (year === nowYear) {
      $hl.text("當年度得獎者");
    } else {
      var safeYear = /^\d{4}$/.test(String(year)) ? String(year) : "";
      $hl.text("當年度得獎者 › " + safeYear);
    }
    appendSafe($breadcrumb, $hl);

    var months = quarterMap[quarter] || [];
    var rendered = 0;

    months.forEach(function (month) {
      var list = (data[year] && data[year][month]) ? data[year][month] : [];
      list.forEach(function (person) {

        var $card = $("<div>").addClass("card");
        var $img = $("<img>");
        var photo = safeHttpUrl(person.photo);
        if (photo) $img.attr("src", photo);
        $img.attr("alt", (typeof person.name === "string" ? person.name : ""));
        appendSafe($card, $img);

        var $infoRow = $("<div>").addClass("info-row");
        var $name = divWithText("name", (typeof person.name === "string" ? person.name : ""));
        var $dept = divWithText("dept", (typeof person.dept === "string" ? person.dept : ""));
        appendSafe($infoRow, $name);
        appendSafe($infoRow, $dept);
        appendSafe($card, $infoRow);

        $card.on("click", function () { openModal(person); });

        appendSafe($grid, $card);
        rendered++;
      });
    });

    if (rendered === 0) {
      var $empty = $("<div>").addClass("empty").text("目前沒有資料");
      appendSafe($grid, $empty);
    }
  }

  function openModal(person) {
    var photo = safeHttpUrl(person.photo);
    if (photo) $("#modal-photo").attr("src", photo);
    else $("#modal-photo").removeAttr("src");

    $("#modal-intro").text(person.intro || "尚無介紹");
    $("#modal-promise").text(person.promise || "尚無介紹");
    $("#modal-recommend").text(person.recommend || "尚無介紹");
    $("#modal-intro-name").text(person.name || "");
    $("#modal-intro-dept").text(person.dept || "");

    setSafeHref($("#modal-line"), person.line || "#");
    setSafeHref($("#modal-fb"), person.fb || "#");
    setSafeHref($("#modal-phone"), person.phone || "#");

    $("#modal").removeClass("hidden");
  }

  window.closeModal = function () {
    $("#modal").addClass("hidden");
  };
});
