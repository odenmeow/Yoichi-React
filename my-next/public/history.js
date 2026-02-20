const myHistoryScript = (LZString, bootstrap) => {
  if (window.__yoichiHistoryScriptInitialized) {
    return;
  }
  window.__yoichiHistoryScriptInitialized = true;

  const HISTORY_PASSWORD = "11806";
  let lockOverlay;
  let lockInput;

  const normalizeTextColor = (value) => {
    if (typeof value !== "string") return "#ff0000";
    const normalized = value.trim();
    return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : "#ff0000";
  };

  const normalizeProductName = (value) => String(value || "").trim();
  const cloneItemNotes = (itemNotes) =>
    JSON.parse(JSON.stringify(itemNotes || {}));

  const NOTE_OPTIONS_DEFAULT = [
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

  const applyCardCellScale = () => {
    const parsed = Number(localStorage.getItem("yoichi-card-cell-scale"));
    const scale = Number.isFinite(parsed)
      ? Math.min(2, Math.max(1, Number(parsed.toFixed(2))))
      : 1.3;
    document.documentElement.style.setProperty(
      "--yoichi-card-cell-scale",
      String(scale)
    );
  };

  const getNoteOptions = () => {
    const saved = JSON.parse(localStorage.getItem("yoichi-note-options") || "null");
    if (!Array.isArray(saved) || saved.length === 0) return NOTE_OPTIONS_DEFAULT;
    return saved
      .map((option, index) => {
        const label = String(option?.label || "").trim();
        if (!label) return null;
        return {
          id: String(option?.id || `custom-${index}`).trim() || `custom-${index}`,
          label,
          color: normalizeTextColor(option?.color || "#111827"),
          group:
            typeof option?.group === "string" && option.group.trim()
              ? option.group.trim()
              : "",
        };
      })
      .filter(Boolean);
  };

  const hasAnyNoteSelected = (row = {}, noteOptions = getNoteOptions()) =>
    noteOptions.some((option) => option.id !== "normal" && row[option.id]);

  const ensureOrderNotes = (order) => {
    if (!order || typeof order !== "object") return {};
    if (!order.itemNotes || typeof order.itemNotes !== "object") {
      order.itemNotes = {};
    }
    return order.itemNotes;
  };

  const ensureOrderGlobalNotes = (order) => {
    if (!order || typeof order !== "object") return {};
    if (!order.globalNotes || typeof order.globalNotes !== "object") {
      order.globalNotes = {};
    }
    return order.globalNotes;
  };

  const getOrderProductNotes = (order, productName) => {
    const itemNotes = ensureOrderNotes(order);
    const key = normalizeProductName(productName);
    return Array.isArray(itemNotes[key]) ? itemNotes[key] : [];
  };

  const hasOrderProductNotes = (order, productName, noteOptions) =>
    getOrderProductNotes(order, productName).some((row) =>
      hasAnyNoteSelected(row, noteOptions)
    );

  const hasGlobalNotes = (order, noteOptions = getNoteOptions()) =>
    hasAnyNoteSelected(ensureOrderGlobalNotes(order), noteOptions);

  const getMergedRowWithGlobal = (row = {}, global = {}) => ({ ...global, ...row });

  const getAlphabetLabel = (index) => {
    let n = Number(index) || 0;
    let out = "";
    do {
      out = String.fromCharCode(97 + (n % 26)) + out;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return out;
  };

  let historyNoteModalState = null;
  let popoverObservers = [];

  const getHistoryNoteModal = () => {
    if (historyNoteModalState) return historyNoteModalState;
    const modal = document.createElement("section");
    modal.className = "yoichi-note-modal yoichi-note-modal--picker";
    modal.style.cssText =
      "position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,.45);align-items:center;justify-content:center;padding:1rem;";
    modal.innerHTML = `
      <div class="yoichi-note-modal-panel">
        <div class="yoichi-note-modal-header">
          <h4 class="yoichi-note-modal-title"></h4>
          <button type="button" class="btn btn-outline-secondary yoichi-note-close">關閉</button>
        </div>
        <div class="yoichi-note-modal-body">
          <div class="yoichi-note-grid-wrap">
            <table class="yoichi-note-grid-table"><thead><tr><th>品項</th></tr></thead><tbody></tbody></table>
          </div>
        </div>
      </div>`;
    document.body.append(modal);
    modal.style.display = "none";
    const title = modal.querySelector('.yoichi-note-modal-title');
    const theadRow = modal.querySelector('thead tr');
    const tbody = modal.querySelector('tbody');
    modal.querySelector('.yoichi-note-close').addEventListener('click',()=>{modal.style.display='none';});
    modal.addEventListener('click',(e)=>{ if(e.target===modal) modal.style.display='none';});
    historyNoteModalState = { modal, title, theadRow, tbody };
    return historyNoteModalState;
  };

  const openHistoryNoteModal = (orderIndex, productName, qty, mode='product') => {
    const order = Order.orders[orderIndex];
    if (!order) return;
    const modalState = getHistoryNoteModal();
    const noteOptions = getNoteOptions();
    const globalNotes = ensureOrderGlobalNotes(order);
    const notes = getOrderProductNotes(order, productName);
    const amount = Math.max(1, Number(qty) || 0);
    const rows = mode === 'global' ? [globalNotes] : notes.length === amount ? notes : Array.from({length: amount}, ()=>getMergedRowWithGlobal({}, globalNotes));

    modalState.title.innerText = mode === 'global' ? `訂單 ${orderIndex} 全域口味` : `${productName} 歷史口味（${amount}份）`;
    modalState.theadRow.innerHTML = `<th>品項</th>${noteOptions.map((o)=>`<th style="color:${normalizeTextColor(o.color)}">${o.label}</th>`).join('')}`;
    modalState.tbody.innerHTML = rows.map((row,index)=>{
      const rowName = mode === 'global' ? '全域' : `${productName}${getAlphabetLabel(index)}`;
      return `<tr><td>${rowName}</td>${noteOptions.map((o)=>`<td><button type="button" class="yoichi-note-cell-btn ${row[o.id] ? 'is-selected':''}" data-selected="${row[o.id] ? '1':'0'}"></button></td>`).join('')}</tr>`;
    }).join('');
    modalState.modal.style.display = 'flex';
  };

  const bindHistoryNoteTriggers = () => {
    document.querySelectorAll('.yoichi-order-note-trigger').forEach((btn)=>{
      btn.addEventListener('click',()=>{
        const orderIndex = Number(btn.dataset.orderIndex);
        const productName = decodeURIComponent(btn.dataset.productName || '');
        const qty = Number(btn.dataset.qty) || 1;
        if (!Number.isFinite(orderIndex) || !productName) return;
        openHistoryNoteModal(orderIndex, productName, qty, 'product');
      });
    });
    document.querySelectorAll('.yoichi-order-global-note-trigger').forEach((btn)=>{
      btn.addEventListener('click',()=>{
        const orderIndex = Number(btn.dataset.orderIndex);
        if (!Number.isFinite(orderIndex)) return;
        openHistoryNoteModal(orderIndex, '全域設定', 1, 'global');
      });
    });
  };

  const setHistoryLocked = (locked) => {
    document.body.classList.toggle("yoichi-history-locked", locked);
    if (!lockOverlay) {
      return;
    }
    lockOverlay.style.display = locked ? "flex" : "none";
    if (locked && lockInput) {
      lockInput.value = "";
      lockInput.focus();
    }
  };

  const initHistoryPasswordLock = () => {
    if (!document.getElementById("yoichi-history-lock-style")) {
      const style = document.createElement("style");
      style.id = "yoichi-history-lock-style";
      style.innerHTML = `
        body.yoichi-history-locked header,
        body.yoichi-history-locked main,
        body.yoichi-history-locked footer {
          filter: blur(5px);
          pointer-events: none;
          user-select: none;
        }
      `;
      document.head.append(style);
    }

    lockOverlay = document.createElement("section");
    lockOverlay.className = "yoichi-history-lock-overlay";
    lockOverlay.style.cssText =
      "position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;";
    lockOverlay.innerHTML = `
      <form class="yoichi-history-lock-form" style="width:min(90vw,420px);background:#fff;border-radius:12px;padding:1.25rem;display:grid;gap:.75rem;">
        <h3 style="margin:0;">請輸入密碼觀看歷史紀錄</h3>
        <input type="password" class="form-control yoichi-history-lock-input" />
        <button type="submit" class="btn btn-primary">解鎖</button>
      </form>
    `;

    lockInput = lockOverlay.querySelector(".yoichi-history-lock-input");
    const lockForm = lockOverlay.querySelector(".yoichi-history-lock-form");
    lockForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if ((lockInput.value || "") === HISTORY_PASSWORD) {
        setHistoryLocked(false);
        return;
      }
      alert("密碼錯誤");
      lockInput.value = "";
      lockInput.focus();
    });

    const lockOnHidden = () => {
      if (document.hidden) {
        setHistoryLocked(true);
      }
    };

    document.addEventListener("visibilitychange", lockOnHidden);
    document.body.append(lockOverlay);
    setHistoryLocked(true);

    window.__yoichiHistoryCleanup = () => {
      document.removeEventListener("visibilitychange", lockOnHidden);
      if (lockOverlay) {
        lockOverlay.remove();
      }
      document.body.classList.remove("yoichi-history-locked");
    };
  };

  class HTMLTime {
    static interval;
    static lock = false;
    constructor() {}
    static showTime() {
      let clock = document.querySelector(".yoichi-orderTime");
      let { timeStr, dateStr } = generateTime();
      clock.innerText = timeStr;
      if (clock == null) return;
    }
    static t_showUp() {
      if (this.lock == false) {
        this.lock = true;
        this.interval = setInterval(() => {
          this.showTime();
        }, 1000);
      }
    }
    static t_vanish() {
      this.lock = false;
      clearInterval(this.interval);
    }
  }

  class Product {
    static products = [];
    constructor(name, price, discountQty = 0, discountAmount = 0, textColor = "#ff0000") {
      this.name = name;
      this.price = price;
      this.discountQty = discountQty;
      this.discountAmount = discountAmount;
      this.textColor = normalizeTextColor(textColor);
      Product.products.push(this);
    }

    static historyRetrieve() {
      const data = JSON.parse(localStorage.getItem("yoichiProducts"));

      if (data == null || data.includes(null)) {
        console.log("沒歷史紀錄或短缺");

        console.log("localData=", data);
        return "沒歷史紀錄或短缺";
      }
      Product.products = [];
      data.forEach(({ name, price, discountQty, discountAmount, textColor }) => {
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
        // 這邊直接改變了所以才不用回傳!
      });

      if (Product.products.length !== data.length) {
        Product.historyUpdate();
      }
    }
    static historyUpdate() {
      localStorage.setItem("yoichiProducts", JSON.stringify(Product.products));
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
  if (Product.historyRetrieve() === "沒歷史紀錄或短缺") {
    Product.generateDefault();
    Product.historyRetrieve();
  }

  class PickedProduct {
    // 數字按鈕按下去，增加數量的同時， 創造物件
    // 物件不會全部被static log陣列接收 ， 如果有重複則覆蓋值。
    static pickedProducts = [];
    constructor(pickedName, pickedNumber) {
      this.pickedName = pickedName;
      this.pickedNumber = pickedNumber;
      let successChanged = 0;
      // 如果數字是空字串 從陣列移除
      if (this.pickedNumber == "") {
        let i;
        PickedProduct.pickedProducts.forEach((e, index) => {
          if (e.pickedName == this.pickedName) {
            i = index;
          }
        });
        // 下面會直接刪除 第i個物件
        console.log("i=", i);
        if (i != undefined) {
          PickedProduct.pickedProducts.splice(i, 1);
        }
      }
      // 非空字串 且 名稱重複則 改變數量
      PickedProduct.pickedProducts = PickedProduct.pickedProducts.map((p) => {
        if (p.pickedName == this.pickedName && this.pickedNumber != "") {
          if (isNaN(Number(this.pickedNumber))) {
            alert("不可非數字");
            return;
          }
          p.pickedNumber = this.pickedNumber;
          successChanged = 1;
        }
        return p;
      });
      // 如果數字是空字串就不理 不加入
      if (!successChanged && this.pickedNumber != "")
        PickedProduct.pickedProducts.push(this);
    }
  }
  function calculateDiscountForProduct(product, pickedNumber) {
    let picked = Number(pickedNumber) || 0;
    let discountQty = Number(product.discountQty) || 0;
    let discountAmount = Number(product.discountAmount) || 0;
    if (discountQty <= 0 || discountAmount <= 0 || picked < discountQty) {
      return 0;
    }
    return Math.floor(picked / discountQty) * discountAmount;
  }

  class Order {
    static orders = [];
    // 生成訂單按鈕 按下去之後會把PickedProduct.pickedProducts=[] 清空 !
    constructor(
      productsLog,
      details,
      totalPrice,
      orderTime,
      orderDate,
      status,
      itemNotes,
      globalNotes
    ) {
      // 短路做法  JS 獨有 特性 ，JAVA無。
      this.productsLog = productsLog || Product.products;
      this.details = details || PickedProduct.pickedProducts;
      this.totalPrice = totalPrice || this.counting();
      this.orderTime = orderTime || generateTime("time");
      this.orderDate = orderDate || generateTime("date");
      this.status = status || "pending";
      this.itemNotes = cloneItemNotes(itemNotes);
      this.globalNotes = cloneItemNotes(globalNotes);
      // status : pending paid fulfill
      Order.orders.push(this);
      // 生成完畢.........無論 [選取資料] 從何取得都 清空。
      PickedProduct.pickedProducts = [];
    }
    counting() {
      let total = 0;
      this.productsLog.map((product) => {
        let seletedProduct = this.details.find(
          (p) => product.name == p.pickedName
        );
        if (seletedProduct) {
          let pickedNumber = Number(seletedProduct.pickedNumber) || 0;
          let lineSubTotal = pickedNumber * product.price;
          let lineDiscount = calculateDiscountForProduct(product, pickedNumber);
          total += Math.max(0, lineSubTotal - lineDiscount);
        }
      });
      return total;
    }
    // 只有當需要讀取歷史紀錄才改變物件的static 內容，不用擔心一般訂單
    static historyRetrieve(date) {
      let data;

      if (date) {
        //   data = localStorage.getItem(`yoichiOrders-${date}`);
        data = localStorage.getItem(`${date}`);
        if (data == null || data.includes(null)) {
          console.log("沒歷史紀錄或短缺");
          console.log("localData=", data);
          return "沒歷史紀錄或短缺";
        }
        data = JSON.parse(LZString.decompress(data));
        console.log("有資料阿", data);
      } else {
        let { dateStr } = generateTime();
        //取回要取回當天的紀錄，如果有給date則取回那天的 (做出來但是工作區不會使用，歷史紀錄才會用到)
        data = localStorage.getItem(`yoichiOrders-${dateStr}`);
        if (data == null || data.includes(null)) {
          console.log("沒歷史紀錄或短缺");
          console.log("localData=", data);
          return "沒歷史紀錄或短缺";
        }
        data = JSON.parse(LZString.decompress(data));
      }

      Order.orders = [];
      // 針對每一筆訂單 解構
      data = data.map(
        ({
          productsLog,
          details,
          totalPrice,
          orderTime,
          orderDate,
          status,
          itemNotes,
          globalNotes,
        }) => {
          const safeProductsLog = Array.isArray(productsLog)
            ? productsLog.map(
                ({ name, price, discountQty, discountAmount, textColor }) => ({
                  name: normalizeProductName(name),
                  price: Number(price),
                  discountQty: Number(discountQty) || 0,
                  discountAmount: Number(discountAmount) || 0,
                  textColor: normalizeTextColor(textColor),
                })
              )
            : [];
          const safeDetails = Array.isArray(details)
            ? details.map(({ pickedName, pickedNumber }) => ({
                pickedName: normalizeProductName(pickedName),
                pickedNumber,
              }))
            : [];

          return new Order(
            safeProductsLog,
            safeDetails,
            totalPrice,
            orderTime,
            orderDate,
            status,
            itemNotes,
            globalNotes
          ); //如果有傳入則用傳入的資訊
        }
      );
      Order.orders = data;
    }
    static historyUpdate(date) {
      // let { dateStr } = generateTime();
      let dateStr = date.substring("yoichiOrders-".length);

      //console.log("印出來看看", Order.orders);
      Order.orders = Order.orders.filter((order) => order.orderDate == dateStr);
      let itemKey = `yoichiOrders-${dateStr}`;
      localStorage.setItem(
        itemKey,
        LZString.compress(JSON.stringify(Order.orders))
      );
      // 也添加LZString 壓縮功能!
      let dateRecords = localStorage.getItem("dateRecords");
      if (dateRecords == null || dateRecords.includes(null)) {
        let records = JSON.parse(dateRecords);
        // console.log(JSON.parse(JSON.stringify(records)));
        records = [];
        records.push(itemKey);
        localStorage.setItem("dateRecords", JSON.stringify(records));
      } else {
        let records = JSON.parse(dateRecords);
        // console.log(JSON.parse(JSON.stringify(records)));
        if (records.length > 180) {
          let shiftData = records.shift();
          // console.log("之後", records);
          localStorage.removeItem(shiftData);
        }
        if (records.includes(itemKey)) {
          return;
        }
        records.push(itemKey);
        localStorage.setItem("dateRecords", JSON.stringify(records));
      }
    }
  }
  const getProductOrderMeta = () => {
    const productIndexMap = new Map();
    const productColorMap = new Map();
    Product.products.forEach((product, index) => {
      productIndexMap.set(normalizeProductName(product.name), index);
      productColorMap.set(
        normalizeProductName(product.name),
        normalizeTextColor(product.textColor)
      );
    });
    return { productIndexMap, productColorMap };
  };

  const sortPickedDetailsByProductOrder = (details = [], productIndexMap) =>
    [...details].sort((a, b) => {
      const aName = normalizeProductName(a.pickedName);
      const bName = normalizeProductName(b.pickedName);
      const ai = productIndexMap.has(aName)
        ? productIndexMap.get(aName)
        : Number.MAX_SAFE_INTEGER;
      const bi = productIndexMap.has(bName)
        ? productIndexMap.get(bName)
        : Number.MAX_SAFE_INTEGER;
      if (ai === bi) return aName.localeCompare(bName);
      return ai - bi;
    });

  const buildOrderDetailsHtml = (details = [], productColorMap, orderIndex, order) => {
    const noteOptions = getNoteOptions();
    const globalApplied = hasGlobalNotes(order, noteOptions);
    return details
      .map((pick) => {
        const productName = normalizeProductName(pick.pickedName);
        const hasNote = hasOrderProductNotes(order, productName, noteOptions);
        const cellClass = hasNote
          ? "yoichi-has-note"
          : globalApplied
          ? "yoichi-has-global-note"
          : "";
        return ` <div class="order-detail">
        <div class="order-p-name yoichi-order-note-trigger ${cellClass}" data-order-index="${orderIndex}" data-product-name="${encodeURIComponent(
          productName
        )}" data-qty="${Number(pick.pickedNumber) || 0}"><p style="color:${
          productColorMap.get(normalizeProductName(pick.pickedName)) || "inherit"
        }">${pick.pickedName}</p></div>
                <div class="order-p-number"><p>${pick.pickedNumber}</p></div> </div> `;
      })
      .join("");
  };

  const closeAllPopovers = () => {
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach((trigger) => {
      try {
        const instance = bootstrap.Popover.getInstance(trigger);
        if (instance) {
          instance.hide();
          instance.dispose();
        }
      } catch (error) {
        console.warn("popover dispose 失敗", error);
      }
      trigger.removeAttribute("aria-describedby");
    });
    document.querySelectorAll(".popover").forEach((el) => el.remove());
  };

  const resetPopoverObservers = () => {
    popoverObservers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn("popover observer disconnect 失敗", error);
      }
    });
    popoverObservers = [];
  };

  // 會顯示所有狀態的版本
  function loadOrderPage(date) {
    closeAllPopovers();
    resetPopoverObservers();
    let orderScreen = document.querySelector(".presentation-Area");
    // 清空避免二度呼叫內部已經有東西又追加!
    orderScreen.innerHTML = "";
    let sellLog = {};
    let fulfilledOrdersTotalAmount = 0;
    const { productIndexMap, productColorMap } = getProductOrderMeta();
    (function create_NotFulfilled_Orders() {
      Order.orders.forEach((order, index) => {
        const sortedDetails = sortPickedDetailsByProductOrder(
          order.details,
          productIndexMap
        );
        const products = buildOrderDetailsHtml(sortedDetails, productColorMap, index, order);
        let yoichi_order_shown = document.createElement("section");
        yoichi_order_shown.classList = "yoichi-order-shown";
        let btnMsg = "按我";
        let btnColor = "danger";
        // console.log(order.status, "狀態");
        if (order.status == "pending") {
          btnMsg = "未付";
          btnColor = "warning";
          // return;
        }
        if (order.status == "paid") {
          btnMsg = "已付";
          btnColor = "success";
          //return; //改成已經付款 會跳回去原本工作區觀看
        }
        if (order.status == "fulfilled") {
          btnMsg = "完成";
          btnColor = "info";
          // console.log("訂單", index);
          sortedDetails.forEach((p) => {
            const pickedName = normalizeProductName(p.pickedName);
            if (sellLog[pickedName] == undefined) {
              sellLog[pickedName] = Number(p.pickedNumber);
            } else {
              sellLog[pickedName] += Number(p.pickedNumber);
              // console.log("選取數量", sellLog[p.pickedName]);
            }
          });
          fulfilledOrdersTotalAmount += order.totalPrice;
          // return ;不跳過了，創建該訂單
        }
        if (order.status == "deprecated") {
          btnMsg = "廢棄";
          btnColor = "secondary";
          // return; 不跳過了
        }
        yoichi_order_shown.innerHTML = `
   
          <div class="yoichi-card">
            <div class="yoichi-card-time-number">
              <div class="order-time yoichi-order-global-note-trigger ${hasGlobalNotes(order, getNoteOptions()) ? "yoichi-has-global-note" : ""}" data-order-index="${index}"><p>${order.orderTime}</p></div>
              <div class="order-number "><p class="with-notation">${index}</p></div>
            </div>
            <div class="yoichi-card-order-detail">
              
                ${products}
              
            </div>
            <div class="yoichi-card-bottom">
              <div class="order-total-price">
                <p>${order.totalPrice}</p>
              </div>
              <div class="order-buttonMotion">
                <button type="button"   data-bs-custom-class="custom-popover" data-bs-placement="top"  class="yoichi-triplebtn btn btn-lg btn-${btnColor}" data-bs-toggle="popover" data-bs-title="${index}" data-bs-content="生成中...">${btnMsg}</button>

              </div>
            </div>
          </div>
     `;
        //   data-bs-trigger="focus"
        let shownExist = orderScreen.querySelector(".yoichi-order-shown");
        if (shownExist) {
          orderScreen.insertBefore(yoichi_order_shown, shownExist);
        } else {
          orderScreen.append(yoichi_order_shown);
        }
        const popoverTriggerList = document.querySelectorAll(
          '[data-bs-toggle="popover"]'
        );
        const popoverList = [...popoverTriggerList].map(
          (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
        );
      });
    })();
    (function create_fulfilledOrdersSummary() {
      let products = ``;
      const soldProducts = [];
      const productMetaMap = new Map();
      Product.products.forEach((product, index) => {
        const normalizedName = normalizeProductName(product.name);
        productMetaMap.set(normalizedName, {
          displayName: product.name,
          color: normalizeTextColor(product.textColor),
          sortIndex: index,
        });
      });

      Object.entries(sellLog).forEach(([rawName, qty]) => {
        const normalizedName = normalizeProductName(rawName);
        const soldQty = Number(qty) || 0;
        if (!normalizedName || soldQty <= 0) return;
        const knownProduct = productMetaMap.get(normalizedName);
        soldProducts.push({
          name: knownProduct?.displayName || rawName,
          color: knownProduct?.color || "#374151",
          soldQty,
          sortIndex:
            typeof knownProduct?.sortIndex === "number"
              ? knownProduct.sortIndex
              : Number.MAX_SAFE_INTEGER,
          normalizedName,
        });
      });

      soldProducts
        .sort((a, b) => {
          if (a.sortIndex === b.sortIndex) {
            return a.normalizedName.localeCompare(b.normalizedName);
          }
          return a.sortIndex - b.sortIndex;
        })
        .forEach((product) => {
          products =
            products +
            ` <div class="order-detail">
        <div class="order-p-name"><p style="color:${product.color}">${product.name}</p></div>
                <div class="order-p-number"><p>${product.soldQty}</p></div> </div> `;
        });
      // console.log(fulfilledOrdersTotalAmount); // 345元
      let yoichi_order_shown = document.createElement("section");
      yoichi_order_shown.classList = "yoichi-order-shown";

      yoichi_order_shown.innerHTML = `
   
          <div class="yoichi-card">
            <div class="yoichi-card-time-number">
              <div class="order-time"><p>商品</p></div>
              <div class="order-number"><p>總售出</p></div>
            </div>
            <div class="yoichi-card-order-detail">
              
                ${products}
              
            </div>
            <div class="yoichi-card-bottom">
              <div class="order-total-price">
                <p>${fulfilledOrdersTotalAmount}</p>
              </div>
              
            </div>
          </div>
     `;
      let shownExist = orderScreen.querySelector(".yoichi-order-shown");
      if (shownExist) {
        orderScreen.insertBefore(yoichi_order_shown, shownExist);
      } else {
        orderScreen.append(yoichi_order_shown);
      }
    })();

    bindHistoryNoteTriggers();

    // 替.popover-body 裡面增加元素，然後flex，放三個按鈕!
    let btns = orderScreen.querySelectorAll(".yoichi-triplebtn");
    // console.log(btns);
    btns.forEach((btn, index) => {
      let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "aria-describedby"
          ) {
            // console.log(
            //   "aria-describedby 屬性已變化，值為：",
            //   btn.getAttribute("aria-describedby")
            // );
            // 在這裡執行，null變化也會被偵測，所以要過濾
            let popID = btn.getAttribute("aria-describedby");
            if (popID) {
              let pop = document.querySelector(`#${popID}`);
              if (!pop) return;
              const headerElement = pop.querySelector(".popover-header");
              if (!headerElement) return;
              let header_num = headerElement.innerText;
              const order = Order.orders[header_num];
              if (!order) {
                closeAllPopovers();
                return;
              }
              // console.log("數字" + header.innerText);
              // 接著依靠數字做出訂單狀態按鈕
              let body = pop.querySelector(".popover-body");
              if (!body) return;
              body.innerHTML = `
                    <div class="fulfillOrder order-${header_num}"><button>完成</button></div>
                    <div class="reviseOrder order-${header_num}"><button>作廢</button></div>
                    <div class="paidOrder order-${header_num}"><button>${order.status == "paid" ? "取消付款" : "付款"}</button></div>
              `;
              let paidBtn = body.querySelector(`.paidOrder.order-${header_num} button`);
              let reviseBtn = body.querySelector(`.reviseOrder.order-${header_num} button`);
              let fulfillBtn = body.querySelector(`.fulfillOrder.order-${header_num} button`);
              if (!paidBtn || !reviseBtn || !fulfillBtn) return;
              paidBtn.addEventListener("click", (e) => {
                //console.log("paidBtn數字是" + header_num);
                // 付款狀態可切換，fulfilled 也可退回 paid 以回工作區
                Order.orders[header_num].status =
                  Order.orders[header_num].status == "paid" ? "pending" : "paid";
                // document
                //   .querySelector(`[data-bs-title="${header_num}"]`)
                //   .click();
                closeAllPopovers();
                Order.historyUpdate(date); //保存狀態否則畫面f5刷新就沒了
                //console.log(Order.orders[header_num]);
                //   displayProducts("new"); //編輯到一半付錢就視同放棄修改

                loadOrderPage(date);
              });
              // 這邊是歷史紀錄，所以中間這個按鈕實際功能為作廢!!!
              reviseBtn.addEventListener("click", (e) => {
                //console.log("reviseBtn數字是" + header_num);
                //   // 去顯示訂單修改畫面出來
                //   // 已經付款的 只能廢棄訂單 (跳出提示)
                //   //   displayProducts("revise", header_num);
                //   // 應該要自動往上
                //   let header = document.querySelector("header");
                //   console.log("滑動中");
                //   header.scrollIntoView({
                //     behavior: "instant",
                //     block: "start",
                //   });
                Order.orders[header_num].status = "deprecated";
                // document
                //   .querySelector(`[data-bs-title="${header_num}"]`)
                //   .click();
                closeAllPopovers();
                Order.historyUpdate(date); //保存狀態否則畫面f5刷新就沒了
                //console.log(Order.orders[header_num]);
                //   displayProducts("new"); //編輯到一半付錢就視同放棄修改

                loadOrderPage(date);
              });
              fulfillBtn.addEventListener("click", (e) => {
                //console.log("fulfillBtn數字是" + header_num);
                // 去修改對應編號的 order 狀態為 fulfill
                if (Order.orders[header_num].status == "paid") {
                  // 已經付錢，直接修改狀態，然後刷新，讓訂單離場
                  Order.orders[header_num].status = "fulfilled";
                  // document
                  //   .querySelector(`[data-bs-title="${header_num}"]`)
                  //   .click();

                  Order.historyUpdate(date); //保存狀態否則畫面f5刷新就沒了
                  // displayProducts("new");
                  loadOrderPage(date);
                } else {
                  // 不可以跳過付錢的警告
                  (function showWarn() {
                    let body = document.querySelector("body");
                    let warn = document.createElement("div");
                    // <div class="successSend alert alert-warning" role="alert">新增成功</div>
                    warn.innerText = "請先付款";
                    warn.className = "noSend alert alert-warning";
                    warn.setAttribute("role", "alert");
                    body.append(warn);
                    warn.addEventListener("animationend", (e) => {
                      e.target.remove();
                    });
                    warn.style.animation =
                      "opacityTransitions 2.1s ease forwards";
                  })();
                }
                closeAllPopovers();
              });
            }
          }
        });
      });

      observer.observe(btn, { attributes: true });
      popoverObservers.push(observer);
    });
  }
  function loadOrdersByDate(date) {
    //console.log("我進來了", date);
    Order.historyRetrieve(date);
    //console.log(Order.orders);
    loadOrderPage(date);
  }
  function selectedDate(num) {
    let dateRecords = localStorage.getItem("dateRecords");
    dateRecords = JSON.parse(dateRecords);

    /* 中間用來刪除 日期的，一打開就會刪除最舊的日子*/
    //   dateRecords.shift();
    //   localStorage.setItem("dateRecords", JSON.stringify(dateRecords));
    /* 中間用來刪除 日期的*/

    let copydate = JSON.parse(JSON.stringify(dateRecords));
    if (copydate == null) return;

    copydate = [...new Set(copydate)].reverse();
    let packsFor3 = 0;
    let target = document.querySelector(".presentation-Area.date-block");
    if (target) {
      target.innerHTML = "";
    }
    let dateArr = [];
    for (let i = 1; i <= copydate.length; i++) {
      // console.log(copydate[i-1].slice("yoichiOrders-".length));

      dateArr.push(copydate[i - 1].slice("yoichiOrders-".length));
      if (i == copydate.length && dateArr.length == 1) {
        //console.log("製作中");
        let shown = document.createElement("section");
        shown.classList = "yoichi-order-shown";
        shown.style.flexBasis = "20%";
        shown.innerHTML = `<div class="yoichi-card">
      <div class="yoichi-card-time-number" style="flex-grow: 1">
        <div class="order-time date-exist" style="flex-grow: 1">
          <p>${dateArr[0]}</p>
        </div>
      </div>
      <div class="yoichi-card-time-number" style="flex-grow: 1">
        <div class="order-time" style="flex-grow: 1">
          <p></p>
        </div>
      </div>
      <div class="yoichi-card-time-number" style="flex-grow: 1">
        <div class="order-time" style="flex-grow: 1">
          <p></p>

        </div>
      </div>
    </div>`;
        dateArr = [];
        target.append(shown);
        break;
      }
      if (i == copydate.length && dateArr.length == 2) {
        let shown = document.createElement("section");
        shown.classList = "yoichi-order-shown";
        shown.style.flexBasis = "20%";
        shown.innerHTML = `<div class="yoichi-card">
      <div class="yoichi-card-time-number" style="flex-grow: 1">
        <div class="order-time date-exist" style="flex-grow: 1">
          <p>${dateArr[0]}</p>
        </div>
      </div>
      <div class="yoichi-card-time-number" style="flex-grow: 1">
        <div class="order-time date-exist" style="flex-grow: 1">
          <p>${dateArr[1]}</p>

        </div>
      </div>
      <div class="yoichi-card-time-number" style="flex-grow: 1">
        <div class="order-time" style="flex-grow: 1">
          <p></p>

        </div>
      </div>
    </div>`;
        dateArr = [];
        target.append(shown);
        break;
      }
      if (i % 3 == 0) {
        let shown = document.createElement("section");
        shown.classList = "yoichi-order-shown";
        shown.style.flexBasis = "20%";
        shown.innerHTML = `<div class="yoichi-card">
      <div class="yoichi-card-time-number" style="flex-grow: 1">
        <div class="order-time date-exist" style="flex-grow: 1">
          <p>${dateArr[0]}</p>
        </div>
      </div>
      <div class="yoichi-card-time-number" style="flex-grow: 1">
        <div class="order-time date-exist" style="flex-grow: 1">
          <p>${dateArr[1]}</p>
        </div>
      </div>
      <div class="yoichi-card-time-number" style="flex-grow: 1">
        <div class="order-time date-exist" style="flex-grow: 1">
          <p>${dateArr[2]}</p>
        </div>
      </div>
    </div>`;
        dateArr = [];
        target.append(shown);
      }
    }
    (function addListenerToDates() {
      let dates = document.querySelectorAll(".order-time.date-exist");
      dates.forEach((date) => {
        date.addEventListener("click", (e) => {
          // e.stopPropagation(); // 阻止事件冒泡 不是我要的
          let others = document.querySelectorAll(".order-time.date-exist");
          others.forEach((o) => (o.style.backgroundColor = "initial"));
          e.currentTarget.style.backgroundColor = "aqua";

          //console.log(e.currentTarget); //這才是我要的!
          let fullStr =
            "yoichiOrders-" + e.currentTarget.querySelector("p").innerText;
          loadOrdersByDate(fullStr);
        });
      });
      //console.log("追加完畢");
    })();
    //   <section class="yoichi-order-shown" style="flex-basis: 20%">
    //     <div class="yoichi-card">
    //       <div class="yoichi-card-time-number" style="flex-grow: 1">
    //         <div class="order-time" style="flex-grow: 1">
    //           <p>時間</p>
    //         </div>
    //       </div>
    //       <div class="yoichi-card-time-number" style="flex-grow: 1">
    //         <div class="order-time" style="flex-grow: 1">
    //           <p>時間</p>
    //         </div>
    //       </div>
    //       <div class="yoichi-card-time-number" style="flex-grow: 1">
    //         <div class="order-time" style="flex-grow: 1">
    //           <p>時間</p>
    //         </div>
    //       </div>
    //     </div>
    //   </section>;

    //   loadOrdersByDate(dateRecords[num]);
  }
  initHistoryPasswordLock();
  applyCardCellScale();
  selectedDate(3);
};
export default myHistoryScript;
