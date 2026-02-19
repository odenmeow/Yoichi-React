const myEditScript = (LZString, bootstrap) => {
  if (window.__yoichiEditScriptInitialized) {
    return;
  }
  window.__yoichiEditScriptInitialized = true;

  const safeForEach = (collection, callback) => {
    Array.prototype.forEach.call(collection || [], callback);
  };
  const safeStorageGet = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("無法讀取 localStorage", key, error);
      return null;
    }
  };
  const safeStorageSet = (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn("無法寫入 localStorage", key, error);
      return false;
    }
  };

  const safeParseJSON = (raw) => {
    if (typeof raw !== "string") return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("JSON parse 失敗", error);
      return null;
    }
  };

  const normalizeTextColor = (value) => {
    if (typeof value !== "string") return "#ff0000";
    const normalized = value.trim();
    return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : "#ff0000";
  };

  class Product {
    static products = [];
    constructor(
      name,
      price,
      discountQty = 0,
      discountAmount = 0,
      textColor = "#ff0000"
    ) {
      this.name = name;
      this.price = price;
      this.discountQty = discountQty;
      this.discountAmount = discountAmount;
      this.textColor = normalizeTextColor(textColor);
      Product.products.push(this);
    }

    static historyRetrieve() {
      const data = JSON.parse(safeStorageGet("yoichiProducts"));

      if (!Array.isArray(data) || data.length === 0 || data.includes(null)) {
        console.log("沒歷史紀錄或短缺");

        console.log("localData=", data);
        return "沒歷史紀錄或短缺";
      }
      Product.products = [];
      safeForEach(
        data,
        ({ name, price, discountQty, discountAmount, textColor }) => {
        let safeName = String(name || "").trim();
        let safePrice = Number(price);
        if (!safeName || !Number.isFinite(safePrice) || safePrice <= 0) {
          return;
        }
        new Product(
          safeName,
          safePrice,
          Number(discountQty) || 0,
          Number(discountAmount) || 0,
          normalizeTextColor(textColor)
        );
        }
      );

      if (Product.products.length === 0) {
        return "沒歷史紀錄或短缺";
      }

      if (Product.products.length !== data.length) {
        Product.historyUpdate();
      }
    }
    static historyUpdate() {
      safeStorageSet("yoichiProducts", JSON.stringify(Product.products));
    }
    static generateDefault() {
      Product.products = [];
      new Product("香腸", 45, 0, 0, "#ff0000");
      new Product("蔥肉串", 45, 0, 0, "#00a803");
      new Product("豬肉串", 45, 0, 0, "#fd3030");
      new Product("一串心", 20, 0, 0, "#ff0000");
      new Product("雞腿串", 65, 0, 0, "#2e58ff");
      new Product("七里香", 50, 0, 0, "#3859ff");
      new Product("雞心", 50, 0, 0, "#4542ff");
      new Product("雞骨輪", 60, 2, 20, "#325afb");
      new Product("米腸", 40, 0, 0, "#ff9061");
      Product.historyUpdate();
    }
  }
  function displayHistoryItems() {
    const container = document.querySelector("section.show-products");
    if (!container) return;
    safeForEach(
      container.querySelectorAll(".yoichi-p-product-row"),
      (row) => row.remove()
    );
    const title = container.querySelector(".yoichi-p-show-name");
    if (title) {
      title.innerText = `商品資料（${Product.products.length}列）`;
    }
    safeForEach(
      Product.products,
      ({ name, price, discountQty, discountAmount, textColor }, index) => {
        let p_shows = document.createElement("div");
        p_shows.classList.add("yoichi-p-shows", "yoichi-p-product-row");
        p_shows.innerHTML = [
          `<div class="yoichi-p-show-meta">`,
          `<div class="yoichi-p-field yoichi-p-field-name"><p class="yoichi-p-label">商品名稱</p><p class="yoichi-p-value" style="color:${normalizeTextColor(
            textColor
          )}">${name}</p></div>`,
          `<div class="yoichi-p-field yoichi-p-field-price"><p class="yoichi-p-label">售價</p><p class="yoichi-p-value">${price}</p></div>`,
          `<div class="yoichi-p-field yoichi-p-field-discountQty"><p class="yoichi-p-label">折扣數量</p><p class="yoichi-p-value">${
            discountQty || 0
          }</p></div>`,
          `<div class="yoichi-p-field yoichi-p-field-discountAmount"><p class="yoichi-p-label">折扣金額</p><p class="yoichi-p-value">${
            discountAmount || 0
          }</p></div>`,
          `<div class="yoichi-p-field yoichi-p-field-textColor"><p class="yoichi-p-label">文字顏色</p><p class="yoichi-p-value">${normalizeTextColor(
            textColor
          )}</p></div>`,
          `</div>`,
          `<div class="yoichi-p-controls">`,
          `<button type="button" class="btn btn-outline-secondary yoichi-p-move-up" data-index="${index}">上移</button>`,
          `<button type="button" class="btn btn-outline-secondary yoichi-p-move-down" data-index="${index}">下移</button>`,
          `<button type="button" class="btn btn-outline-primary yoichi-p-change-color" data-index="${index}">改色</button>`,
          `<button type="button" id="yoichi-p-show-edit-${index}" class="yoichi-p-show-edit btn btn-warning" data-bs-toggle="modal" data-bs-target="#Modal-edit-product">編輯</button>`,
          `<input type="color" class="yoichi-p-color-picker d-none" value="${normalizeTextColor(
            textColor
          )}" data-index="${index}" />`,
          `</div>`,
        ].join("");
        container.append(p_shows);
      }
    );
    bindProductRowEvents();
  }

  function swapProducts(firstIndex, secondIndex) {
    const temp = Product.products[firstIndex];
    Product.products[firstIndex] = Product.products[secondIndex];
    Product.products[secondIndex] = temp;
    Product.historyUpdate();
    displayHistoryItems();
  }

  function bindProductRowEvents() {
    safeForEach(document.querySelectorAll(".yoichi-p-show-edit"), (btn) => {
      btn.addEventListener("click", (e) => {
        let parentElement = e.target.closest(".yoichi-p-product-row");
        let index = Number(btn.id.match(/\d+/)[0]);
        synchronizeEditModalContent(parentElement, index);
      });
    });

    safeForEach(document.querySelectorAll(".yoichi-p-move-up"), (btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        if (!Number.isFinite(index) || index <= 0) return;
        swapProducts(index, index - 1);
      });
    });

    safeForEach(document.querySelectorAll(".yoichi-p-move-down"), (btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        if (!Number.isFinite(index) || index >= Product.products.length - 1) {
          return;
        }
        swapProducts(index, index + 1);
      });
    });

    safeForEach(
      document.querySelectorAll(".yoichi-p-change-color"),
      (btn, btnIndex) => {
        const picker = document.querySelectorAll(".yoichi-p-color-picker")[
          btnIndex
        ];
        if (!picker) return;
        btn.addEventListener("click", () => {
          picker.click();
        });
        picker.addEventListener("change", () => {
          const index = Number(picker.dataset.index);
          if (!Product.products[index]) return;
          Product.products[index].textColor = normalizeTextColor(picker.value);
          Product.historyUpdate();
          displayHistoryItems();
        });
      }
    );
  }
  // Step0  update variable of Product.products ( sync with history)
  // 模擬資料更新 或者 讀取歷史資料進來
  // new Product("牛肉串", 50);
  // new Product("豬肉串", 40);
  // new Product("蔥肉串", 35);
  // new Product("雞肉串", 50);
  // Product.historyUpdate(); //不能單獨直接 否則會把舊資料先清空!
  if (Product.historyRetrieve() === "沒歷史紀錄或短缺") {
    Product.generateDefault();
    Product.historyRetrieve();
  }
  // Step1  Display the history items on user's screen.
  // 剛連線，初始畫面透過localStorage查找歷史資料、去建立html顯示畫面出來
  displayHistoryItems();

  // 使Modal 編輯畫面 讀取form area的內容 (by .now-edit-product-${index})
  function synchronizeEditModalContent(parentElement, index) {
    let productName = parentElement.querySelector(
      ".yoichi-p-field-name .yoichi-p-value"
    ).innerText;
    let productPrice = parentElement.querySelector(
      ".yoichi-p-field-price .yoichi-p-value"
    ).innerText;
    let productDiscountQty = Product.products[index].discountQty || 0;
    let productDiscountAmount = Product.products[index].discountAmount || 0;
    let productTextColor = normalizeTextColor(Product.products[index].textColor);

    document.querySelector("#yoichi-p-edit-setName").value = productName;
    document.querySelector("#yoichi-p-edit-setPrice").value = productPrice;
    document.querySelector("#yoichi-p-edit-setDiscountQty").value =
      productDiscountQty;
    document.querySelector("#yoichi-p-edit-setDiscountAmount").value =
      productDiscountAmount;
    document.querySelector("#yoichi-p-edit-setTextColor").value =
      productTextColor;

    let modalEdit = document.querySelector("#yoichi-product-edit");
    for (let i = 0; i <= Product.products.length; i++) {
      modalEdit.classList.remove(`now-edit-product-${i}`);
    }
    modalEdit.classList.add(`now-edit-product-${index}`);
  }
  // Step3 新增商品的按鈕功能!
  (function btnAddAppendFunctions() {
    // 下面只會被選取一次不會每次更新
    let btnAdd_save = document.querySelector("#yoichi-p-addSave");
    btnAdd_save.addEventListener("click", (e) => {
      let nameInput = document.querySelector("#yoichi-p-add-setName");
      let priceInput = document.querySelector("#yoichi-p-add-setPrice");
      let discountQtyInput = document.querySelector(
        "#yoichi-p-add-setDiscountQty"
      );
      let discountAmountInput = document.querySelector(
        "#yoichi-p-add-setDiscountAmount"
      );
      let textColorInput = document.querySelector("#yoichi-p-add-setTextColor");
      // appendAlert("成功", "success");

      let newName = nameInput.value.trim();
      let newPrice = Number(priceInput.value);
      let newDiscountQty = Number(discountQtyInput.value || 0);
      let newDiscountAmount = Number(discountAmountInput.value || 0);
      let newTextColor = normalizeTextColor(textColorInput.value);

      if (!newName) {
        alert("商品名稱不可空白");
        return;
      }

      if (Product.products.filter((p) => newName == p.name).length) {
        alert("重複商品名稱");
        console.log("重複了");
        return;
      }

      // [] 屬於 truthy value!

      if (
        !Number.isFinite(newPrice) ||
        newPrice <= 0 ||
        !Number.isFinite(newDiscountQty) ||
        !Number.isFinite(newDiscountAmount)
      ) {
        console.log("非數字");
        alert("請輸入正確金額（售價需大於0）");
      } else {
        Product.historyRetrieve();
        new Product(
          newName,
          newPrice,
          Math.max(0, newDiscountQty),
          Math.max(0, newDiscountAmount),
          newTextColor
        );
        // console.log("是數字");
        // console.log(Product.products);
        nameInput.value = "";
        priceInput.value = "";
        discountQtyInput.value = "";
        discountAmountInput.value = "";
        textColorInput.value = "#ff0000";
        Product.historyUpdate();
        displayHistoryItems();
      }
    });
  })();
  // Step4 editModal 內部刪除按鈕   只需要被呼喚一次就夠
  (function editProductDelete() {
    let btnDelete = document.querySelector("#yoichi-p-delete");
    console.log("執行一次");
    btnDelete.addEventListener("click", (e) => {
      let modalEdit = document.querySelector("#yoichi-product-edit");
      safeForEach(Array.from(modalEdit.classList), (c) => {
        if (c.includes(`now-edit-product-`)) {
          // console.log("c是", c);
          let numberPart = c.match(/\d+/); //  /表示開始正則跟結束正則
          //['0', index: 17, input: 'now-edit-product-0', groups: undefined] = numberPart 這是正則回傳型態 = 陣列
          // numberPart[0];  這是匹配成功的部份
          numberPart = numberPart[0];
          if (isNaN(Number(numberPart))) {
            console.log("numberPart錯誤");
          } else {
            // 記得回傳，因為他不更動原始呼叫物件
            Product.products = Product.products.filter(
              (p, index) => Number(numberPart) !== index
            );
            console.log(Product.products);
            Product.historyUpdate();
            displayHistoryItems();
          }
        }
      });
    });
  })();
  // Step5 editModal 內部保存按鈕  只需要被呼喚一次就夠
  (function editProductSave() {
    let btnSave = document.querySelector("#yoichi-p-editSave");

    // 請保持良好的實踐、每次先移除 (避免重複附加到既有element身上)
    // 先移除 不會報錯、反而可以保證只會有一人負責監聽!
    // 或者改使用IIFE ，使用IIFE也不要放在其他函數內
    btnSave.addEventListener("click", (e) => {
      let modalEdit = document.querySelector("#yoichi-product-edit");

      safeForEach(Array.from(modalEdit.classList), (c) => {
        if (c.includes(`now-edit-product-`)) {
          // console.log("c是", c);
          let numberPart = c.match(/\d+/); //  /表示開始正則跟結束正則
          //['0', index: 17, input: 'now-edit-product-0', groups: undefined] = numberPart 這是正則回傳型態 = 陣列
          // numberPart[0];  這是匹配成功的部份
          numberPart = numberPart[0];
          if (isNaN(Number(numberPart))) {
            console.log("numberPart錯誤");
          } else {
            // 記得回傳，因為他不更動原始呼叫物件
            Product.products = Product.products.map((p, index) => {
              console.log("請查收", Number(numberPart), index);
              if (Number(numberPart) == index) {
                let checkExist = document.querySelector(
                  `#yoichi-p-show-edit-${index}`
                );
                let newName = document
                  .querySelector("#yoichi-p-edit-setName")
                  .value.trim();

                let newPrice = document.querySelector(
                  "#yoichi-p-edit-setPrice"
                ).value;
                let newDiscountQty = document.querySelector(
                  "#yoichi-p-edit-setDiscountQty"
                ).value;
                let newDiscountAmount = document.querySelector(
                  "#yoichi-p-edit-setDiscountAmount"
                ).value;
                let newTextColor = normalizeTextColor(
                  document.querySelector("#yoichi-p-edit-setTextColor").value
                );
                if (!newName) {
                  alert("商品名稱不可空白");
                  return p;
                }

                if (
                  Product.products.some(
                    (product, pIndex) =>
                      pIndex !== index && product.name == newName
                  )
                ) {
                  alert("重複商品名稱");
                  return p;
                }

                if (
                  !Number.isFinite(Number(newPrice)) ||
                  Number(newPrice) <= 0 ||
                  !Number.isFinite(Number(newDiscountQty || 0)) ||
                  !Number.isFinite(Number(newDiscountAmount || 0))
                ) {
                  console.log("非數字");
                  alert("請輸入正確金額（售價需大於0）");
                } else {
                  // 改變暫存products資料完成
                  p.name = newName;
                  console.log("你好 ", p.name, p.price);
                  p.price = Number(newPrice);
                  p.discountQty = Math.max(0, Number(newDiscountQty || 0));
                  p.discountAmount = Math.max(
                    0,
                    Number(newDiscountAmount || 0)
                  );
                  p.textColor = newTextColor;

                  // 改變畫面
                  console.log(checkExist.parentElement);
                  checkExist.parentElement.querySelector(
                    ".yoichi-p-field-name .yoichi-p-value"
                  ).innerText = p.name;
                  checkExist.parentElement.querySelector(
                    ".yoichi-p-field-price .yoichi-p-value"
                  ).innerText = p.price;
                  checkExist.parentElement.querySelector(
                    ".yoichi-p-field-discountQty .yoichi-p-value"
                  ).innerText = p.discountQty || 0;
                  checkExist.parentElement.querySelector(
                    ".yoichi-p-field-discountAmount .yoichi-p-value"
                  ).innerText = p.discountAmount || 0;
                  checkExist.parentElement.querySelector(
                    ".yoichi-p-field-name .yoichi-p-value"
                  ).style.color = p.textColor;
                  checkExist.parentElement.querySelector(
                    ".yoichi-p-field-textColor .yoichi-p-value"
                  ).innerText = p.textColor;
                }
              }
              return p;
            });
            console.log(Product.products);
            // 實踐更新
            Product.historyUpdate();
            displayHistoryItems();
            // window.location.reload();
          }
        }
      });
    });
  })();

  (function setupThemeSwitcher() {
    const container = document.querySelector("section.show-products");
    if (!container) return;
    const themeKey = "yoichi-edit-theme";
    const themes = ["classic", "soft", "contrast"];
    const applyTheme = (theme) => {
      safeForEach(themes, (t) => container.classList.remove(`theme-${t}`));
      container.classList.add(`theme-${theme}`);
    };

    const savedTheme = safeStorageGet(themeKey);
    applyTheme(themes.includes(savedTheme) ? savedTheme : "classic");

    safeForEach(document.querySelectorAll(".yoichi-theme-btn"), (btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.dataset.theme;
        if (!themes.includes(theme)) return;
        safeStorageSet(themeKey, theme);
        applyTheme(theme);
      });
    });
  })();

  (function setupFlavorSettingsManager() {
    const flavorKey = "yoichi-note-options";
    const summaryToggleBtn = document.querySelector(".yoichi-summary-toggle-btn");
    if (!summaryToggleBtn) return;

    const defaultOptions = [
      { id: "normal", label: "普", color: "#111827", group: "" },
      { id: "noSesame", label: "不芝麻", color: "#78eaf2", group: "" },
      { id: "noPepper", label: "不胡椒", color: "#80f5e7", group: "" },
      { id: "sesameMore", label: "芝麻多", color: "#9ebeff", group: "sesame" },
      { id: "sesameLess", label: "芝麻少", color: "#99b6ff", group: "sesame" },
      { id: "pepperMore", label: "胡椒多", color: "#111827", group: "pepper" },
      { id: "pepperLess", label: "胡椒少", color: "#111827", group: "pepper" },
      { id: "veryMild", label: "微微辣", color: "#ffd270", group: "spice" },
      { id: "mild", label: "微辣", color: "#ffa55c", group: "spice" },
      { id: "small", label: "小辣", color: "#ffb1a3", group: "spice" },
      { id: "medium", label: "中辣", color: "#ff6c52", group: "spice" },
      { id: "large", label: "大辣", color: "#ff1100", group: "spice" },
    ];

    const normalizeOptions = (raw) => {
      if (!Array.isArray(raw) || raw.length === 0) {
        return defaultOptions;
      }
      const normalized = raw
        .map((item, index) => {
          const label = String(item?.label || "").trim();
          if (!label) return null;
          return {
            id: String(item?.id || `custom-${index}`).trim() || `custom-${index}`,
            label,
            color: normalizeTextColor(item?.color || "#111827"),
            group:
              typeof item?.group === "string" && item.group.trim()
                ? item.group.trim()
                : "",
          };
        })
        .filter(Boolean);
      return normalized.length ? normalized : defaultOptions;
    };

    const readOptions = () =>
      normalizeOptions(safeParseJSON(safeStorageGet(flavorKey)));

    const writeOptions = (options) => {
      const normalized = normalizeOptions(options);
      safeStorageSet(flavorKey, JSON.stringify(normalized));
      return normalized;
    };

    summaryToggleBtn.innerText = "口味個人化設定";
    summaryToggleBtn.classList.remove("btn-outline-success", "btn-outline-warning");
    summaryToggleBtn.classList.add("btn-outline-primary");

    const modal = document.createElement("section");
    modal.className = "yoichi-note-modal yoichi-note-modal--settings";
    modal.style.cssText =
      "position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,.45);align-items:center;justify-content:center;padding:1rem;";
    modal.innerHTML = `
      <div class="yoichi-note-modal-panel">
        <div class="yoichi-note-modal-header">
          <h4 class="yoichi-note-modal-title">口味個人化設定</h4>
          <button type="button" class="btn btn-outline-secondary yoichi-note-close">關閉</button>
        </div>
        <div class="yoichi-note-modal-body">
          <div class="yoichi-note-grid-wrap">
            <table class="yoichi-note-grid-table">
              <thead><tr><th>#</th><th>名稱</th><th>群組</th><th>顏色</th><th>操作</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
          <div style="margin-top:.6rem;display:flex;gap:.5rem;">
            <button type="button" class="btn btn-outline-primary yoichi-flavor-add">新增口味</button>
            <button type="button" class="btn btn-outline-secondary yoichi-flavor-reset">重置預設</button>
          </div>
        </div>
        <div class="yoichi-note-modal-footer">
          <button type="button" class="btn btn-primary yoichi-flavor-save">儲存設定</button>
        </div>
      </div>
    `;
    document.body.append(modal);
    modal.style.display = "none";

    const tbody = modal.querySelector("tbody");
    const closeBtn = modal.querySelector(".yoichi-note-close");
    const addBtn = modal.querySelector(".yoichi-flavor-add");
    const resetBtn = modal.querySelector(".yoichi-flavor-reset");
    const saveBtn = modal.querySelector(".yoichi-flavor-save");
    let editingOptions = [];

    const renderRows = () => {
      tbody.innerHTML = editingOptions
        .map(
          (option, index) => `
            <tr data-index="${index}">
              <td>${index + 1}</td>
              <td><input type="text" class="form-control yoichi-flavor-label" value="${option.label}" /></td>
              <td><input type="text" class="form-control yoichi-flavor-group" value="${option.group || ""}" placeholder="例如 spice" /></td>
              <td><input type="color" class="form-control form-control-color yoichi-flavor-color" value="${normalizeTextColor(option.color)}" /></td>
              <td style="display:flex;gap:.4rem;justify-content:center;">
                <button type="button" class="btn btn-sm btn-outline-secondary yoichi-flavor-up">上移</button>
                <button type="button" class="btn btn-sm btn-outline-secondary yoichi-flavor-down">下移</button>
                <button type="button" class="btn btn-sm btn-outline-danger yoichi-flavor-remove">刪除</button>
              </td>
            </tr>`
        )
        .join("");
    };

    const openModal = () => {
      editingOptions = readOptions().map((item) => ({ ...item }));
      renderRows();
      modal.style.display = "flex";
    };

    const closeModal = () => {
      modal.style.display = "none";
    };

    summaryToggleBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    addBtn.addEventListener("click", () => {
      editingOptions.push({
        id: `custom-${Date.now()}-${editingOptions.length}`,
        label: `口味${editingOptions.length + 1}`,
        color: "#111827",
        group: "",
      });
      renderRows();
    });

    resetBtn.addEventListener("click", () => {
      editingOptions = defaultOptions.map((item) => ({ ...item }));
      renderRows();
    });

    tbody.addEventListener("input", (event) => {
      const tr = event.target.closest("tr[data-index]");
      if (!tr) return;
      const index = Number(tr.dataset.index);
      if (!editingOptions[index]) return;
      if (event.target.classList.contains("yoichi-flavor-label")) {
        editingOptions[index].label = String(event.target.value || "");
      }
      if (event.target.classList.contains("yoichi-flavor-color")) {
        editingOptions[index].color = normalizeTextColor(event.target.value);
      }
      if (event.target.classList.contains("yoichi-flavor-group")) {
        editingOptions[index].group = String(event.target.value || "").trim();
      }
    });

    tbody.addEventListener("click", (event) => {
      const tr = event.target.closest("tr[data-index]");
      if (!tr) return;
      const index = Number(tr.dataset.index);
      if (!editingOptions[index]) return;
      if (event.target.classList.contains("yoichi-flavor-up") && index > 0) {
        [editingOptions[index - 1], editingOptions[index]] = [
          editingOptions[index],
          editingOptions[index - 1],
        ];
        renderRows();
      }
      if (
        event.target.classList.contains("yoichi-flavor-down") &&
        index < editingOptions.length - 1
      ) {
        [editingOptions[index + 1], editingOptions[index]] = [
          editingOptions[index],
          editingOptions[index + 1],
        ];
        renderRows();
      }
      if (event.target.classList.contains("yoichi-flavor-remove")) {
        editingOptions.splice(index, 1);
        renderRows();
      }
    });

    saveBtn.addEventListener("click", () => {
      editingOptions = writeOptions(editingOptions);
      closeModal();
    });
  })();

  (function setupActionUiManager() {
    const key = "yoichi-action-ui-config";
    const actionBtn = document.querySelector(".yoichi-action-ui-btn");
    if (!actionBtn) return;

    const normalizeConfig = (raw) => {
      const data = raw && typeof raw === "object" ? raw : {};
      return {
        popupScale: Math.min(300, Math.max(50, Number(data.popupScale) || 100)),
        popupHeightScale: Math.min(300, Math.max(50, Number(data.popupHeightScale) || 100)),
        headerWeight: Math.min(300, Math.max(50, Number(data.headerWeight) || 100)),
        firstButton: Math.min(300, Math.max(50, Number(data.firstButton) || 100)),
        secondButton: Math.min(300, Math.max(50, Number(data.secondButton) || 100)),
        thirdButton: Math.min(300, Math.max(50, Number(data.thirdButton) || 100)),
      };
    };

    const modal = document.createElement("section");
    modal.className = "yoichi-note-modal yoichi-note-modal--settings";
    modal.style.cssText =
      "position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,.45);align-items:center;justify-content:center;padding:1rem;";
    modal.innerHTML = `
      <div class="yoichi-note-modal-panel" style="width:min(92vw,620px)">
        <div class="yoichi-note-modal-header">
          <h4 class="yoichi-note-modal-title">按我UI 調整</h4>
          <button type="button" class="btn btn-outline-secondary yoichi-note-close">關閉</button>
        </div>
        <div class="yoichi-note-modal-body" style="display:grid;gap:.85rem;">
          <label class="form-label mb-0">彈出窗寬度（50% ~ 300%）</label>
          <input type="range" class="form-range yoichi-action-popup-scale" min="50" max="300" step="1" />
          <label class="form-label mb-0">彈出窗高度（50% ~ 300%）</label>
          <input type="range" class="form-range yoichi-action-popup-height-scale" min="50" max="300" step="1" />
          <label class="form-label mb-0">上方數字區權重（50% ~ 300%）</label>
          <input type="range" class="form-range yoichi-action-header-height" min="50" max="300" step="1" />
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;">
            <div><label class="form-label mb-0">完成按鈕權重（50% ~ 300%）</label><input type="range" class="form-range yoichi-action-btn1" min="50" max="300" step="1" /></div>
            <div><label class="form-label mb-0">修改按鈕權重（50% ~ 300%）</label><input type="range" class="form-range yoichi-action-btn2" min="50" max="300" step="1" /></div>
            <div><label class="form-label mb-0">付款按鈕權重（50% ~ 300%）</label><input type="range" class="form-range yoichi-action-btn3" min="50" max="300" step="1" /></div>
          </div>
          <small class="text-muted">全部改成 bar，預設 100%，三顆按鈕會依權重自動換算占比。</small>
        </div>
        <div class="yoichi-note-modal-footer">
          <button type="button" class="btn btn-primary yoichi-action-ui-save">儲存設定</button>
        </div>
      </div>
    `;
    document.body.append(modal);
    modal.style.display = "none";

    const closeBtn = modal.querySelector(".yoichi-note-close");
    const saveBtn = modal.querySelector(".yoichi-action-ui-save");
    const popupScaleInput = modal.querySelector(".yoichi-action-popup-scale");
    const popupHeightScaleInput = modal.querySelector(".yoichi-action-popup-height-scale");
    const headerHeightInput = modal.querySelector(".yoichi-action-header-height");
    const btn1Input = modal.querySelector(".yoichi-action-btn1");
    const btn2Input = modal.querySelector(".yoichi-action-btn2");
    const btn3Input = modal.querySelector(".yoichi-action-btn3");

    const openModal = () => {
      const config = normalizeConfig(safeParseJSON(safeStorageGet(key)));
      popupScaleInput.value = String(config.popupScale);
      popupHeightScaleInput.value = String(config.popupHeightScale);
      headerHeightInput.value = String(config.headerWeight);
      btn1Input.value = String(config.firstButton);
      btn2Input.value = String(config.secondButton);
      btn3Input.value = String(config.thirdButton);
      modal.style.display = "flex";
    };

    const closeModal = () => {
      modal.style.display = "none";
    };

    saveBtn.addEventListener("click", () => {
      const config = normalizeConfig({
        popupScale: popupScaleInput.value,
        popupHeightScale: popupHeightScaleInput.value,
        headerWeight: headerHeightInput.value,
        firstButton: btn1Input.value,
        secondButton: btn2Input.value,
        thirdButton: btn3Input.value,
      });
      safeStorageSet(key, JSON.stringify(config));
      closeModal();
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    actionBtn.addEventListener("click", openModal);
  })();

  (function setupNoteUiManager() {
    const key = "yoichi-note-save-ui-config";
    const noteBtn = document.querySelector(".yoichi-note-ui-btn");
    if (!noteBtn) return;

    const normalizeConfig = (raw) => {
      const data = raw && typeof raw === "object" ? raw : {};
      const align = ["left", "center", "right", "stretch"].includes(data.align)
        ? data.align
        : "right";
      return {
        width: Math.min(300, Math.max(50, Number(data.width) || 100)),
        height: Math.min(300, Math.max(50, Number(data.height) || 100)),
        align,
      };
    };

    const modal = document.createElement("section");
    modal.className = "yoichi-note-modal yoichi-note-modal--settings";
    modal.style.cssText =
      "position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,.45);align-items:center;justify-content:center;padding:1rem;";
    modal.innerHTML = `
      <div class="yoichi-note-modal-panel" style="width:min(92vw,560px)">
        <div class="yoichi-note-modal-header">
          <h4 class="yoichi-note-modal-title">客製化UI（備註儲存鍵）</h4>
          <button type="button" class="btn btn-outline-secondary yoichi-note-close">關閉</button>
        </div>
        <div class="yoichi-note-modal-body" style="display:grid;gap:.85rem;">
          <label class="form-label mb-0">儲存按鈕寬度（50% ~ 300%）</label>
          <input type="range" class="form-range yoichi-note-save-width" min="50" max="300" step="1" />
          <label class="form-label mb-0">儲存按鈕高度（50% ~ 300%）</label>
          <input type="range" class="form-range yoichi-note-save-height" min="50" max="300" step="1" />
          <label class="form-label mb-0">按鈕位置</label>
          <select class="form-select yoichi-note-save-align">
            <option value="left">靠左</option>
            <option value="center">置中</option>
            <option value="right">靠右</option>
            <option value="stretch">滿版長條</option>
          </select>
        </div>
        <div class="yoichi-note-modal-footer">
          <button type="button" class="btn btn-primary yoichi-note-ui-save">儲存設定</button>
        </div>
      </div>
    `;
    document.body.append(modal);
    modal.style.display = "none";

    const closeBtn = modal.querySelector(".yoichi-note-close");
    const saveBtn = modal.querySelector(".yoichi-note-ui-save");
    const widthInput = modal.querySelector(".yoichi-note-save-width");
    const heightInput = modal.querySelector(".yoichi-note-save-height");
    const alignInput = modal.querySelector(".yoichi-note-save-align");

    const openModal = () => {
      const config = normalizeConfig(safeParseJSON(safeStorageGet(key)));
      widthInput.value = String(config.width);
      heightInput.value = String(config.height);
      alignInput.value = config.align;
      modal.style.display = "flex";
    };

    const closeModal = () => {
      modal.style.display = "none";
    };

    saveBtn.addEventListener("click", () => {
      const config = normalizeConfig({
        width: widthInput.value,
        height: heightInput.value,
        align: alignInput.value,
      });
      safeStorageSet(key, JSON.stringify(config));
      closeModal();
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    noteBtn.addEventListener("click", openModal);
  })();
};
export default myEditScript;
