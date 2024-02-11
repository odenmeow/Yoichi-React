const myWorkScript = (LZString, bootstrap) => {
  class HTMLTime {
    static interval;
    static lock = false;
    constructor() {}
    static showTime() {
      let clock = document.querySelector(".yoichi-orderTime");
      let { timeStr, dateStr } = generateTime();
      if (clock == null) return;
      clock.innerText = timeStr;
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
  HTMLTime.t_showUp();
  class Product {
    static products = [];
    constructor(name, price) {
      this.name = name;
      this.price = price;
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
      data.map(({ name, price }) => {
        new Product(name, Number(price));
        // 這邊直接改變了所以才不用回傳!
      });
    }
    static historyUpdate() {
      localStorage.setItem("yoichiProducts", JSON.stringify(Product.products));
    }
  }
  // 讀取商品資料
  Product.historyRetrieve();

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
        //console.log("i=", i);
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
  class Order {
    static orders = [];
    // 生成訂單按鈕 按下去之後會把PickedProduct.pickedProducts=[] 清空 !
    constructor(
      productsLog,
      details,
      totalPrice,
      orderTime,
      orderDate,
      status
    ) {
      // 短路做法  JS 獨有 特性 ，JAVA無。
      this.productsLog = productsLog || Product.products;
      this.details = details || PickedProduct.pickedProducts;
      this.totalPrice = totalPrice || this.counting();
      this.orderTime = orderTime || generateTime("time");
      this.orderDate = orderDate || generateTime("date");
      this.status = status || "pending";
      // status : pending paid fulfill
      Order.orders.push(this);
      // 生成完畢.........無論 [選取資料] 從何取得都 清空。
      PickedProduct.pickedProducts = [];
    }
    counting() {
      let total = 0;
      // 不想改變、只想做事
      this.productsLog.map((product) => {
        let seletedProduct = this.details.find(
          (p) => product.name == p.pickedName
        );
        // 如果有東西自然會是 [] = truthy 如沒 則undefined =falsy
        if (seletedProduct) {
          total += seletedProduct.pickedNumber * product.price;
        }
      });
      let discount = document.querySelector(".yoichi-discountValue");
      try {
        total -= Number(discount.innerText);
      } catch (e) {
        alert("不可輸入數字以外");
      }
      return total;
    }
    // 只有當需要讀取歷史紀錄才改變物件的static 內容，不用擔心一般訂單
    static historyRetrieve(date) {
      let data;

      if (date) {
        data = localStorage.getItem(`yoichiOrders-${date}`);
        if (data == null || data.includes(null)) {
          console.log("沒歷史紀錄或短缺");
          console.log("localData=", data);
          return "沒歷史紀錄或短缺";
        }
        data = JSON.parse(LZString.decompress(data));
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
        }) => {
          Product.products = []; //前後都要清空 ， 我只是做map 創新物件。
          PickedProduct.pickedProducts = [];
          //  如果displayProducts有需求 則使用讀取後的Order.orders內的資訊去查詢才正確!
          productsLog = productsLog.map(({ name, price }) => {
            return new Product(name, price);
          });
          details = details.map(({ pickedName, pickedNumber }) => {
            return new PickedProduct(pickedName, pickedNumber);
          });
          Product.products = [];
          PickedProduct.pickedProducts = [];
          return new Order(
            productsLog,
            details,
            totalPrice,
            orderTime,
            orderDate,
            status
          ); //如果有傳入則用傳入的資訊
        }
      );
      Order.orders = data;
    }
    static historyUpdate() {
      let { dateStr } = generateTime();
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
          // console.log("之後", records, shiftData);
          localStorage.removeItem(shiftData);
          // records.push(shiftData);
        }
        if (records.includes(itemKey)) {
          return;
        }
        records.push(itemKey);
        localStorage.setItem("dateRecords", JSON.stringify(records));
      }
    }
  }

  Order.historyRetrieve();
  console.log(Order.orders);
  // new Order();
  // console.log(Order.orders);
  // 下面是新增訂單addbtn、預設時、依照Product.products出現的。
  // 後續我還會做修改頁面時使用的 (remove跟append)
  function displayProducts(info, oid) {
    let productsInfo;
    if (info == "new") {
      Product.historyRetrieve(); //依照最新設定顯示
      // 訂單編號要自動推算
      document.querySelector(".yoichi-orderNumber").innerText =
        Order.orders.length;
      PickedProduct.pickedProducts = [];
      document.querySelector(".yoichi-orderNumber").innerText =
        Order.orders.length;
      let reviseOrderBtn = document.querySelector(".yoichi-order-send");
      reviseOrderBtn.classList.add("yoichi-order-create");
      reviseOrderBtn.classList.remove("yoichi-order-revise");
      reviseOrderBtn.classList.remove("immutable-order");
      reviseOrderBtn.innerText = "生成";
      document.querySelector(".yoichi-tiptool").innerHTML = "<p>新單</p>";
      HTMLTime.t_showUp();
    } else if (info == "revise") {
      // 如果要求顯示舊訂單則依log去顯示
      // Product.products = Order.orders[oid].productsLog;
      Order.historyRetrieve(); // 這邊就接著之後更改Product.products使用特定Order的 productsLog 歷史紀錄囉
      // 後續不可以Product.historyupdate覆蓋，會覆蓋商家的最新編輯售價
      // 送出修改之後，重新diplayProducts("new")
      // HTMLTime要停止 、改成訂單產生的時間
      // 下面兩行不小心害我誤傷QQ
      // Product.products = Order.orders[oid].productsLog;
      // PickedProduct.pickedProducts = Order.orders[oid].details;
      // 深拷貝 Product.products
      Product.products = JSON.parse(
        JSON.stringify(Order.orders[oid].productsLog)
      );

      // 深拷貝 PickedProduct.pickedProducts
      PickedProduct.pickedProducts = JSON.parse(
        JSON.stringify(Order.orders[oid].details)
      );
      // 改變按鈕 【送出】 => 【修改】 如果null代表找不到，那一定跟上一個訂單有關
      let reviseOrderBtn = document.querySelector(".yoichi-order-send");
      reviseOrderBtn.classList.add("yoichi-order-revise");
      reviseOrderBtn.classList.remove("yoichi-order-create");
      reviseOrderBtn.classList.remove("immutable-order");
      reviseOrderBtn.innerText = "修改";

      if (Order.orders[oid].status == "paid") {
        // 改內容文字
        let btn = document.querySelector(".yoichi-order-revise");
        btn.innerText = "不可修改"; //要二度確認作廢與否
        btn.classList.add("immutable-order"); //如果偵測到就使用廢棄的方式
      }

      (function deprecatedBtnTooltip() {
        let div_deprecate = document.querySelector(".yoichi-tiptool");
        div_deprecate.innerHTML = "";
        let deprecatedBtn = document.createElement("button");
        deprecatedBtn.classList.add("yoichi-deprecatedBtn");
        deprecatedBtn.innerHTML = "作廢";
        div_deprecate.append(deprecatedBtn);
        deprecatedBtn.addEventListener("click", (e) => {
          // 顯示是否作廢 (防止按錯)
          let confirmed = window.confirm("確定要作廢?");
          document.querySelectorAll("button.yoichi-triplebtn").forEach((b) => {
            if (b.hasAttribute("aria-describedby")) {
              b.click();
            }
          });
          if (confirmed) {
            Order.orders[oid].status = "deprecated";
            Order.historyUpdate();
            alert("成功作廢!");
            displayProducts("new");
            loadOrderPage();
          }
        });
      })();

      // 改訂單編號
      document.querySelector(".yoichi-orderNumber").innerText = oid;
      HTMLTime.t_vanish();
      document.querySelector(".yoichi-orderTime").innerText =
        Order.orders[oid].orderTime;
    }
    let block = document.querySelector(".cal-Area form");
    block.innerHTML = `<section class="yoichi-block yoichi-block-title">
            <div class="yoichi-p-name">商品名稱</div>
            <div class="yoichi-p-number">數量</div>
            <div class="yoichi-p-btns">操作</div>
          </section>`;
    Product.products.forEach((product, index) => {
      let section = document.createElement("section");
      section.classList.add("yoichi-block", "yoichi-block-items");
      let defaultValue = "";
      if (info == "revise") {
        Order.orders[oid].details.filter((pickedProduct) => {
          if (pickedProduct.pickedName == product.name) {
            defaultValue = pickedProduct.pickedNumber;
          }
        });
      }
      section.innerHTML = `<label class="yoichi-p-name" for="yoichi-product-${index}">
              <p>${product.name}</p></label
            >
            <input
              class="yoichi-p-number"
              type="text"
              id="yoichi-product-${index}"
              name="yoichi-product-${index}"
              value="${defaultValue}"
            />
            <div class="yoichi-p-btns">
              
              <div class="y-p-b-4">
                <button type="button" class="btn btn-warning">清空</button>
              </div>
              <div class="y-p-b-3">
                <button type="button" class="btn btn-info">3</button>
              </div>
              <div class="y-p-b-2">
                <button type="button" class="btn btn-info">2</button>
              </div>
              <div class="y-p-b-1">
                <button type="button" class="btn btn-info">1</button>
              </div>
              <div class="y-p-b-minus-1">
                <button type="button" class="btn btn-info">-</button>
              </div>
            </div>`;
      block.append(section);
    });
    // 先計算看看 (因為如果是修改的商品預設的數量 並非由按鈕觸發(不會run計算calculateAll))
    calculateAll();
    (function numberBtnsAppendFunction() {
      let btnsGroup = document.querySelectorAll(".yoichi-p-btns");
      btnsGroup.forEach((group) => {
        let btns = group.querySelectorAll("button");
        btns.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            // console.log(e.target.innerText);  + - 1 2 3 4 5
            // 先得知目前數字為多少
            let section = e.target.parentElement.parentElement.parentElement;
            // console.log(section);
            let pName = section.querySelector(".yoichi-p-name p");
            let pNumber = section.querySelector(".yoichi-p-number");
            if (
              !(pNumber.value == "") && // 空字串is ok 視為0
              !Number(pNumber.value) && // 數字 is ok
              !(Number(pNumber.value) == 0) // 數字 0 is ok     以上皆可繼續執行
            ) {
              return;
            }
            if (pNumber.value == null) pNumber.value = 0;
            let theNumber = Number(pNumber.value);
            switch (e.target.innerText) {
              case "1":
                theNumber++;
                break;
              case "-":
                theNumber--;
                break;
              case "2":
                theNumber += 2;
                break;
              case "3":
                theNumber += 3;
                break;
              case "清空":
                theNumber = "";
            }
            if (theNumber <= 0) {
              pNumber.value = "";
            } else {
              pNumber.value = theNumber;
            }
            new PickedProduct(pName.innerText, pNumber.value);
            // console.log(pName.innerText, pNumber.value);
            // console.log(PickedProduct.pickedProducts);
            calculateAll();
          });
        });
      });
    })();
  }
  displayProducts("new");

  function calculateAll() {
    let subTotal = document.querySelector(".yoichi-subtotalValue");
    let subSum = 0;
    let discountSum = 0;
    // 如果revise則以 order歷史紀錄算錢 如果new則自動以localStorage算錢
    PickedProduct.pickedProducts.forEach((pp) => {
      // undefined if not found.
      let product = Product.products.find(
        (product) => product.name == pp.pickedName
      );
      subSum += product.price * pp.pickedNumber;
      if (pp.pickedName == "蔥肉串" && Number(pp.pickedNumber) >= 3) {
        discountSum += Math.floor(Number(pp.pickedNumber) / 3) * 5;
      }
    });
    subTotal.innerText = subSum;
    let discount = document.querySelector(".yoichi-discountValue");
    // 暫時取消折扣
    discountSum = 0;
    discount.innerText = discountSum;
    let total = document.querySelector(".yoichi-totalValue");
    total.innerText = subSum - discountSum;
    if (subTotal.innerText == "0") {
      subTotal.innerText = "";
      discount.innerText = "";
      total.innerText = "";
    }
  }
  // function calcuDiscount() {
  //   PickedProduct.pickedProducts.forEach((pp) => {
  //     let;
  //   });
  // }
  // function calcuTotal() {}

  function sendOrderBtn() {
    let btnSend = document.querySelector(".yoichi-order-create");
    if (btnSend == null) return;
    btnSend.innerHTML = "生成";
    btnSend.addEventListener("click", (e) => {
      if (e.target.classList.contains("yoichi-order-create")) {
        // 訂單按扭 名稱叫做 生成

        let total = document.querySelector(".yoichi-totalValue");
        if (total.innerText == "" || total.innerText == "0") {
          (function showWarn() {
            let body = document.querySelector("body");
            let warn = document.createElement("div");
            warn.innerText = "請先添加內容";
            warn.className = "noSend alert alert-danger";
            warn.setAttribute("role", "alert");
            body.append(warn);
            warn.addEventListener("animationend", (e) => {
              e.target.remove();
            });
            warn.style.animation = "opacityTransitions 2.5s ease forwards";
          })();
          return; //不做事
        }
        // if找不到 .revise 則新增訂單，否則修改Orders的Order內容即可 !

        document.querySelectorAll("button.yoichi-triplebtn").forEach((b) => {
          if (b.hasAttribute("aria-describedby")) {
            b.click();
          }
        });
        new Order();
        Order.historyUpdate();
        // else{ 修改ooxx}
        //console.log(Order.orders);
        (function clearScreen() {
          let discount = document.querySelector(".yoichi-discountValue");
          discount.innerText = "";
          let total = document.querySelector(".yoichi-totalValue");
          total.innerText = "";
          let subTotal = document.querySelector(".yoichi-subtotalValue");
          subTotal.innerText = "";
          let numberInputs = document.querySelectorAll(".yoichi-p-number");
          numberInputs.forEach((numberInput) => {
            numberInput.value = "";
          });
        })();
        (function showWarn() {
          let body = document.querySelector("body");
          let warn = document.createElement("div");
          // <div class="successSend alert alert-warning" role="alert">新增成功</div>
          warn.innerText = "新增成功";
          warn.className = "successSend alert alert-warning";
          warn.setAttribute("role", "alert");
          body.append(warn);
          warn.addEventListener("animationend", (e) => {
            e.target.remove();
          });
          warn.style.animation = "opacityTransitions 2.1s ease forwards";
          setTimeout(() => {
            let targetElement = document.querySelector(".presentation-Area");
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        })();
        loadOrderPage();
        document.querySelector(".yoichi-orderNumber").innerText =
          Order.orders.length;
      } else if (e.target.classList.contains("immutable-order")) {
        // 廢棄要優先 因為同時會有 revise + immutable-order
        console.log("只能廢棄不可修改");
      } else if (e.target.classList.contains("yoichi-order-revise")) {
        // 修改訂單
        console.log("觸發修改訂單");
        let total = document.querySelector(".yoichi-totalValue");
        if (total.innerText == "" || total.innerText == "0") {
          (function showWarn() {
            let body = document.querySelector("body");
            let warn = document.createElement("div");
            warn.innerText = "請先添加內容";
            warn.className = "noSend alert alert-danger";
            warn.setAttribute("role", "alert");
            body.append(warn);
            warn.addEventListener("animationend", (e) => {
              e.target.remove();
            });
            warn.style.animation = "opacityTransitions 2.5s ease forwards";
          })();
          return; //不做事
        }
        let oid = document.querySelector(".yoichi-orderNumber").innerText;
        document.querySelectorAll("button.yoichi-triplebtn").forEach((b) => {
          if (b.hasAttribute("aria-describedby")) {
            console.log("被點囉");
            b.click();
          }
        });
        let o = new Order();
        Order.orders.pop();
        Order.orders[oid] = o;
        displayProducts("new");
        loadOrderPage();
        Order.historyUpdate(); //要記得更新
        let targetElement = document.querySelector(".presentation-Area");
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  sendOrderBtn();
  function generateTime(str) {
    let now = new Date();

    // 日期部分
    let dateOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Taipei",
    };
    let dateStr = now.toLocaleDateString("zh-TW", dateOptions);

    // 時間部分
    let timeOptions = {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
      timeZone: "Asia/Taipei",
    };
    let timeStr = now.toLocaleTimeString("zh-TW", timeOptions);
    let hour = timeStr.substring(0, 2);
    let other = timeStr.substring(2);
    hour = Number(hour) % 24;
    timeStr = hour.toString().padStart(2, "0") + other;
    if (str) {
      switch (str) {
        case "date":
          return dateStr;
        case "time":
          return timeStr;
      }
      return;
    }
    return { dateStr, timeStr };
  }

  (function addNewOrderBtn() {
    let btn = document.querySelector(".newOrderBtn");
    btn.addEventListener("click", (e) => {
      try {
        let header = document.querySelector("header");
        // console.log("滑動中");
        header.scrollIntoView({
          behavior: "instant",
          block: "start",
        });

        displayProducts("new");
      } catch (e) {
        console.log(e, "滑動中這邊錯誤");
      }
    });
  })();

  // ==========下方為訂單區，f5 (reload) 時 ，拉當天資料 ，初始顯示===========

  function loadOrderPage() {
    let orderScreen = document.querySelector(".presentation-Area");
    // 清空避免二度呼叫內部已經有東西又追加!
    orderScreen.innerHTML = "";
    let sellLog = {};
    let fulfilledOrdersTotalAmount = 0;
    (function create_NotFulfilled_Orders() {
      Order.orders.forEach((order, index) => {
        let products = ``;
        order.details.forEach((pick) => {
          products =
            products +
            ` <div class="order-detail">
        <div class="order-p-name"><p>${pick.pickedName}</p></div>
                <div class="order-p-number"><p>${pick.pickedNumber}</p></div> </div> `;
        });
        let yoichi_order_shown = document.createElement("section");
        yoichi_order_shown.classList = "yoichi-order-shown";
        let btnMsg = "按我";
        let btnColor = "danger";
        // console.log(order.status, "狀態");
        if (order.status == "paid") {
          btnMsg = "已付";
          btnColor = "success";
        }
        if (order.status == "fulfilled") {
          // console.log("訂單", index);
          order.details.forEach((p) => {
            if (sellLog[p.pickedName] == undefined) {
              sellLog[p.pickedName] = Number(p.pickedNumber);
            } else {
              sellLog[p.pickedName] += Number(p.pickedNumber);
              // console.log("選取數量", sellLog[p.pickedName]);
            }
          });
          fulfilledOrdersTotalAmount += order.totalPrice;
          return; //直接跳過，不創建該訂單了
        }
        if (order.status == "deprecated") {
          return;
        }
        yoichi_order_shown.innerHTML = `
   
          <div class="yoichi-card">
            <div class="yoichi-card-time-number">
              <div class="order-time"><p>${order.orderTime}</p></div>
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
                <button type="button"  data-bs-custom-class="custom-popover" data-bs-placement="top"  class="yoichi-triplebtn btn btn-lg btn-${btnColor}" data-bs-toggle="popover" data-bs-title="${index}" data-bs-content="生成中...">${btnMsg}</button>

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
      for (let name in sellLog) {
        // console.log(sellLog[name], name);
        // 3 '蔥肉串'
        // 3 '香腸'
        // 3 '豬肉串'
        products =
          products +
          ` <div class="order-detail">
        <div class="order-p-name"><p>${name}</p></div>
                <div class="order-p-number"><p>${sellLog[name]}</p></div> </div> `;
      }
      // console.log(fulfilledOrdersTotalAmount); // 345元
      let yoichi_order_shown = document.createElement("section");
      yoichi_order_shown.classList = "yoichi-order-shown";

      yoichi_order_shown.innerHTML = `
   
          <div class="yoichi-card">
            <div class="yoichi-card-time-number">
              <div class="order-time"><p>商品名稱</p></div>
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

              pop.querySelector(".popover-body");
              let header_num = pop.querySelector(".popover-header").innerText;
              // console.log("數字" + header.innerText);
              // 接著依靠數字做出訂單狀態按鈕
              let body = pop.querySelector(".popover-body");
              body.innerHTML = `
                    <div class="fulfillOrder order-${header_num}"><button>完成</button></div>
                    <div class="reviseOrder order-${header_num}"><button>修改</button></div>
                    <div class="paidOrder order-${header_num}"><button>付款</button></div>
              `;
              let paidBtn = document.querySelector(
                `.paidOrder.order-${header_num} button`
              );
              let reviseBtn = document.querySelector(
                `.reviseOrder.order-${header_num} button`
              );
              let fulfillBtn = document.querySelector(
                `.fulfillOrder.order-${header_num} button`
              );
              paidBtn.addEventListener("click", (e) => {
                // console.log("paidBtn數字是" + header_num);
                // 去修改對應編號的 order 狀態為 paid
                Order.orders[header_num].status = "paid";
                document
                  .querySelectorAll("button.yoichi-triplebtn")
                  .forEach((b) => {
                    if (b.hasAttribute("aria-describedby")) {
                      console.log("被點囉");
                      b.click();
                    }
                  });
                Order.historyUpdate(); //保存狀態否則畫面f5刷新就沒了
                // console.log(Order.orders[header_num]);
                displayProducts("new"); //編輯到一半付錢就視同放棄修改

                loadOrderPage();
              });
              reviseBtn.addEventListener("click", (e) => {
                //console.log("reviseBtn數字是" + header_num);
                // 去顯示訂單修改畫面出來
                // 已經付款的 只能廢棄訂單 (跳出提示)
                displayProducts("revise", header_num);
                // 應該要自動往上
                let header = document.querySelector("header");
                //console.log("滑動中");
                header.scrollIntoView({
                  behavior: "instant",
                  block: "start",
                });
                // document
                //   .querySelector(`[data-bs-title="${header_num}"]`)
                //   .click();
                document
                  .querySelectorAll("button.yoichi-triplebtn")
                  .forEach((b) => {
                    if (b.hasAttribute("aria-describedby")) {
                      console.log("被點囉");

                      b.click();
                    }
                  });
              });
              fulfillBtn.addEventListener("click", (e) => {
                // console.log("fulfillBtn數字是" + header_num);
                // 去修改對應編號的 order 狀態為 fulfill
                if (Order.orders[header_num].status == "paid") {
                  // 已經付錢，直接修改狀態，然後刷新，讓訂單離場
                  Order.orders[header_num].status = "fulfilled";
                  // document
                  //   .querySelector(`[data-bs-title="${header_num}"]`)
                  //   .click();

                  Order.historyUpdate(); //保存狀態否則畫面f5刷新就沒了
                  displayProducts("new");
                  loadOrderPage();
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
                document
                  .querySelectorAll("button.yoichi-triplebtn")
                  .forEach((b) => {
                    if (b.hasAttribute("aria-describedby")) {
                      console.log("被點囉");
                      b.click();
                    }
                  });
              });
            }
          }
        });
      });

      observer.observe(btn, { attributes: true });
    });
  }
  loadOrderPage();
};
export default myWorkScript;
