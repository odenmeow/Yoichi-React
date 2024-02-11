const myHistoryScript = (LZString, bootstrap) => {
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
  // 會顯示所有狀態的版本
  function loadOrderPage(date) {
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
          order.details.forEach((p) => {
            if (sellLog[p.pickedName] == undefined) {
              sellLog[p.pickedName] = Number(p.pickedNumber);
            } else {
              sellLog[p.pickedName] += Number(p.pickedNumber);
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
                    <div class="reviseOrder order-${header_num}"><button>作廢</button></div>
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
                //console.log("paidBtn數字是" + header_num);
                // 去修改對應編號的 order 狀態為 paid
                Order.orders[header_num].status = "paid";
                // document
                //   .querySelector(`[data-bs-title="${header_num}"]`)
                //   .click();
                document
                  .querySelectorAll(".popover.custom-popover")
                  .forEach((popover) => {
                    popover.classList.remove("show");
                  });
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
                document
                  .querySelectorAll(".popover.custom-popover")
                  .forEach((popover) => {
                    popover.classList.remove("show");
                  });
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
                  document
                    .querySelectorAll(".popover.custom-popover")
                    .forEach((popover) => {
                      popover.classList.remove("show");
                    });
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
              });
            }
          }
        });
      });

      observer.observe(btn, { attributes: true });
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

    copydate.reverse();
    let packsFor3 = 0;
    let target = document.querySelector(".presentation-Area.date-block");
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
  selectedDate(3);
};
export default myHistoryScript;
