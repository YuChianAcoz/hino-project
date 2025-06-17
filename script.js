$(document).ready(function () {
  let data = {};
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

    var now = new Date();
    var currentYear = now.getFullYear().toString();
    var currentMonth = now.getMonth() + 1;

    let currentQuarter = "Q1";
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
    var $yearSelector = $("#yearSelector");
    $yearSelector.empty();

    var placeholderOption = $('<option value="" disabled selected class="placeholder-option">歷屆得獎者</option>');
    $yearSelector.append(placeholderOption);

    placeholderOption.hide();

    $.each(Object.keys(data).sort().reverse(), function (_, year) {
      $yearSelector.append(`<option value="${year}">${year}</option>`);
    });

    $yearSelector.off("change").on("change", function () {
      var year = $(this).val();

      if (year === "2023" ||　year === "2024") {
      window.open("https://www.hino.com.tw/hinohero", "_blank");
      this.selectedIndex = 0;
      return;
    }

      populateQuarterSelector(year);
      this.selectedIndex = 0;
    });
  }

  

  function populateQuarterSelector(year, preselectQuarter = "Q1") {
    var $quarterSelector = $("#seasonSelector");
    $quarterSelector.empty();

    $.each(quarterMap, function (quarter, months) {
      var hasData = months.some(month => data[year][month]);
      if (hasData) {
        var isSelected = quarter === preselectQuarter ? "selected" : "";
        $quarterSelector.append(`<option value="${quarter}" ${isSelected}>${year}年第${quarterNames[quarter]}次微笑大使</option>`);
      }
    });

    updateContent(year, preselectQuarter);

    $quarterSelector.off("change").on("change", function () {
      updateContent(year, $(this).val());
    });
  }

  function updateContent(year, quarter) {
    var nowYear = new Date().getFullYear().toString();
    var $breadcrumb = $("#breadcrumb");
    var $grid = $("#ambassadorGrid");

    if (year === nowYear) {
      $breadcrumb.html(`微笑大使 › <span class="highlight">當年度得獎者</span>`);
    }
    else {
      $breadcrumb.html(`微笑大使 › <span class="highlight">當年度得獎者 › ${year}</span>`);
    }

    $grid.empty();

    var months = quarterMap[quarter];
    months.forEach(month => {
      var list = data[year][month] || [];
      list.forEach(person => {
        var $card = $("<div class='card'></div>").html(`
          <img src="${person.photo}" alt="${person.name}" />
          <div class="info-row">
            <div class="name">${person.name}</div>
            <div class="dept">${person.dept}</div>
          </div>
        `);

        $card.on("click", function () {
          openModal(person);
        });

        $grid.append($card);
      });
    });
  }

  function openModal(person) {
    $("#modal-photo").attr("src", person.photo);
    $("#modal-intro").text(person.intro || "尚無介紹");
    $("#modal-promise").text(person.promise || "尚無介紹");
    $("#modal-recommend").text(person.recommend || "尚無介紹");
    $("#modal-line").attr("href", person.line || "#");
    $("#modal-fb").attr("href", person.fb || "#");
    $("#modal-phone").attr("href", person.phone || "#");

    $("#modal").removeClass("hidden");
  }

  window.closeModal = function () {
    $("#modal").addClass("hidden");
  };
});
