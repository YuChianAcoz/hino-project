$(document).ready(function () {
  let data = {};
  const quarterMap = {
    Q1: ["01", "02", "03"],
    Q2: ["04", "05", "06"],
    Q3: ["07", "08", "09"],
    Q4: ["10", "11", "12"]
  };
  const quarterNames = {
    Q1: "一",
    Q2: "二",
    Q3: "三",
    Q4: "四"
  };

  $.getJSON("data.json", function (json) {
    data = json["微笑大使"];

    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = now.getMonth() + 1;
    let currentQuarter = "Q1";
    if (currentMonth >= 4 && currentMonth <= 6) currentQuarter = "Q2";
    else if (currentMonth >= 7 && currentMonth <= 9) currentQuarter = "Q3";
    else if (currentMonth >= 10) currentQuarter = "Q4";

    const initYear = data[currentYear] ? currentYear : Object.keys(data).sort().reverse()[0];
    populateCustomYearSelector(initYear);
    populateQuarterSelector(initYear, currentQuarter);

    $("#current").on("click", function () {
      const nowYear = new Date().getFullYear().toString();
      const nowMonth = new Date().getMonth() + 1;
      let nowQuarter = "Q1";
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

  function populateCustomYearSelector(selectedYear) {
    const $options = $("#customYearOptions");
    $options.empty();

    Object.keys(data).sort().reverse().forEach(year => {
      if (year === "2023" || year === "2024") {
        $options.append(`<div><a href="https://www.hino.com.tw/hinohero" target="_blank">${year}</a></div>`);
      } else {
        $options.append(`<div><a href="#" data-year="${year}">${year}</a></div>`);
      }
    });

    $options.on("click", "a[data-year]", function (e) {
      e.preventDefault();
      const year = $(this).data("year");
      populateQuarterSelector(year);
      $("#customYearOptions").addClass("hidden");
    });
  }

  $("#customYearSelect").on("click", function () {
    $("#customYearOptions").toggleClass("hidden");
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest(".custom-select-wrapper").length) {
      $("#customYearOptions").addClass("hidden");
    }
  });

  function populateQuarterSelector(year, preselectQuarter = "Q1") {
    const $quarterSelector = $("#seasonSelector");
    $quarterSelector.empty();

    $.each(quarterMap, function (quarter, months) {
      const hasData = months.some(month => data[year]?.[month]);
      if (hasData) {
        const isSelected = quarter === preselectQuarter ? "selected" : "";
        $quarterSelector.append(`<option value="${quarter}" ${isSelected}>${year}年第${quarterNames[quarter]}次微笑大使</option>`);
      }
    });

    updateContent(year, preselectQuarter);

    $quarterSelector.off("change").on("change", function () {
      updateContent(year, $(this).val());
    });
  }

  function updateContent(year, quarter) {
    const nowYear = new Date().getFullYear().toString();
    const $breadcrumb = $("#breadcrumb");
    const $grid = $("#ambassadorGrid");

    $breadcrumb.html(
      year === nowYear
        ? `微笑大使 › <span class="highlight">當年度得獎者</span>`
        : `微笑大使 › <span class="highlight">當年度得獎者 › ${year}</span>`
    );

    $grid.empty();
    const months = quarterMap[quarter];
    months.forEach(month => {
      (data[year]?.[month] || []).forEach(person => {
        const $card = $("<div class='card'></div>").html(`
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
