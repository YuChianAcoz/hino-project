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
  var quarterNames = {
    Q1: "一",
    Q2: "二",
    Q3: "三",
    Q4: "四"
  };

  $.getJSON("data.json", function (json) {
    data = json["微笑大使"];

    var currentQuarter = "Q1";
    if (currentMonth >= 4 && currentMonth <= 6) currentQuarter = "Q2";
    else if (currentMonth >= 7 && currentMonth <= 9) currentQuarter = "Q3";
    else if (currentMonth >= 10) currentQuarter = "Q4";

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

      var nowQuarter = "Q1";
      if (nowMonth >= 4 && nowMonth <= 6) nowQuarter = "Q2";
      else if (nowMonth >= 7 && nowMonth <= 9) nowQuarter = "Q3";
      else if (nowMonth >= 10) nowQuarter = "Q4";

      if (data[nowYear]) {
        populateQuarterSelector(nowYear, nowQuarter);
      } else {
        alert("當年度目前尚無資料");
      }
    });
  });

  function populateYearSelector(selectedYear) {
    var $menu = $("#customSelectorMenu").empty();
    var years = Object.keys(data).sort().reverse();

    years.forEach(year => {
      if (year === currentYear) return;
      
      var safeYear = /^\d{4}$/.test(String(year)) ? String(year) : null;
      if (!safeYear) return;

      var $li = $("<li>").text(safeYear).on("click", () => {
        populateQuarterSelector(safeYear);
        $menu.hide();
      });

      $menu.append($li);
  });

  // 加上特別選項：服務英雄
  const $hero = $("<li>")
    .text("服務英雄")
    .on("click", () => {
      window.open("https://www.hino.com.tw/hinohero", "_blank", "noopener,noreferrer");
      $menu.hide();
    });

  $menu.append($hero);
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
    var validQuarters = [];
    var safeYear = /^\d{4}$/.test(String(year)) ? String(year) : "";
    
    $.each(quarterMap, function (quarter, months) {
      var hasData = months.some(month => data[year]?.[month]);
      if (hasData) {
        validQuarters.push(quarter);
        
        var $opt = $("<option>").val(quarter).text(`${safeYear}年第${quarterNames[quarter]}次微笑大使`);

        if (quarter === preselectQuarter) {
          $opt.prop("selected", true);
        }
        $quarterSelector.append($opt);
      }
    });

    var selectedQuarter = validQuarters.includes(preselectQuarter) ? preselectQuarter : validQuarters[0];

    if (selectedQuarter) {
      updateContent(year, selectedQuarter);
    } else {
      updateContent(year, null);
    }

    $quarterSelector.off("change").on("change", function () {
      updateContent(year, $(this).val());
    });
  }

// 只允許相對資源或 https，避免 javascript: 等惡意 scheme
function safeUrl(u) {
  try {
    if (!u) return "";
    // 允許本地 assets/ 或相對路徑
    if (/^(?:\.{0,2}\/|assets\/)/.test(u)) return u;
    var url = new URL(u, location.origin);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function updateContent(year, quarter) {
  var nowYear = new Date().getFullYear().toString();
  var $breadcrumb = $("#breadcrumb").empty();
  var $grid = $("#ambassadorGrid").empty();
  var $prefix = $(document.createTextNode("微笑大使 › "));
  var $hl = $("<span>").addClass("highlight");
  
  if (year === nowYear) {
    $hl.text("當年度得獎者");
  } else {
    var safeYear = /^\d{4}$/.test(String(year)) ? String(year) : String(year || "");
    $hl.text(`當年度得獎者 › ${safeYear}`);
  }
  
  $breadcrumb.append($prefix).append($hl);

  var months = quarterMap[quarter] || [];
  var rendered = 0;

  months.forEach(month => {
    var list = (data[year] && data[year][month]) ? data[year][month] : [];
    list.forEach(person => {
      var $card = $("<div>").addClass("card");
      var $img = $("<img>");
      var photo = safeUrl(person.photo);
      
      if (photo) $img.attr("src", photo);
      $img.attr("alt", person.name || "");
      $card.append($img);

      var $infoRow = $("<div>").addClass("info-row");
      var $name = $("<div>").addClass("name").text(person.name || "");
      var $dept = $("<div>").addClass("dept").text(person.dept || "");
      $infoRow.append($name, $dept);
      $card.append($infoRow);

      $card.on("click", function () {
        openModal(person);
      });

      $grid.append($card);
      rendered++;
    });
  });

  if (rendered === 0) {
    $grid.append($("<div>").addClass("empty").text("目前沒有資料"));
  }
}

  function openModal(person) {
    $("#modal-photo").attr("src", person.photo);
    $("#modal-intro").text(person.intro || "尚無介紹");
    $("#modal-promise").text(person.promise || "尚無介紹");
    $("#modal-recommend").text(person.recommend || "尚無介紹");
    $("#modal-line").attr("href", person.line || "#");
    $("#modal-fb").attr("href", person.fb || "#");
    $("#modal-phone").attr("href", person.phone || "#");
    $("#modal-intro-name").text(person.name)
    $("#modal-intro-dept").text(person.dept)
    $("#modal").removeClass("hidden");
  }

  window.closeModal = function () {
    $("#modal").addClass("hidden");
  };
});

