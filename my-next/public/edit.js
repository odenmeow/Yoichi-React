const myEditScript = (LZString, bootstrap) => {
  class Product {
    static products = [];
    constructor(name, price, discountQty = 0, discountAmount = 0) {
      this.name = name;
      this.price = price;
      this.discountQty = discountQty;
      this.discountAmount = discountAmount;
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
      data.map(({ name, price, discountQty, discountAmount }) => {
        new Product(
          name,
          Number(price),
          Number(discountQty) || 0,
          Number(discountAmount) || 0
        );
      });
    }
    static historyUpdate() {
      localStorage.setItem("yoichiProducts", JSON.stringify(Product.products));
    }
    static generateDefault() {
      new Product("一串心", 20, 0, 0);
      new Product("雞腿串", 60, 0, 0);
      new Product("豬肉串", 40, 0, 0);
      new Product("香腸", 40, 0, 0);
      new Product("蔥肉串", 40, 0, 0);
      this.historyUpdate();
    }
  }
  function displayHistoryItems() {
    Product.products.forEach(({ name, price, discountQty, discountAmount }, index) => {
      // 創造前先看有沒有存在目前畫面!
      let checkExist = document.querySelector(`#yoichi-p-show-edit-${index}`);
      if (checkExist) {
      } else {
        let p_shows = document.createElement("div");
        p_shows.classList.add("yoichi-p-shows");
        p_shows.innerHTML = [
          `<div class="yoichi-p-show-name">`,
          `<p>${name}</p>`,
          `</div>`,
          `<div class="yoichi-p-show-price">`,
          `<p>${price}元</p>`,
          `<p>折扣數量: ${discountQty || 0}</p>`,
          `<p>折扣金額: ${discountAmount || 0}</p>`,
          `</div>`,
          `<button
        type="button"
        id="yoichi-p-show-edit-${index}"
        class="yoichi-p-show-edit btn btn-warning"
        data-bs-toggle="modal"
        data-bs-target="#Modal-edit-product"
      >`,
          `編輯
      </button>
    </div>`,
        ].join("");
        let container = document.querySelector("section.show-products");
        container.append(p_shows);
      }
    });
  }
  // Step0  update variable of Product.products ( sync with history)
  // 模擬資料更新 或者 讀取歷史資料進來
  // new Product("牛肉串", 50);
  // new Product("豬肉串", 40);
  // new Product("蔥肉串", 35);
  // new Product("雞肉串", 50);
  // Product.historyUpdate(); //不能單獨直接 否則會把舊資料先清空!
  class Visit {
    constructor(first) {
      this.first = first;
    }
    static historyRetrieve() {
      let data = JSON.parse(localStorage.getItem("visited"));
      console.log(data, "(true=已訪問過)");
      if (!data) {
        this.historyUpdate(); // 沒訪問過 visited=null
      } else {
        Product.historyRetrieve();
      }
    }
    static historyUpdate() {
      //  if not get a visit log
      //  generate default Products && visit log =true
      let data = JSON.stringify(new Visit(true));
      Product.generateDefault();
      localStorage.setItem("visited", data);
    }
  }
  Visit.historyRetrieve();
  // Product.historyRetrieve(); 併入Visit.historyRetrieve了
  // Step1  Display the history items on user's screen.
  // 剛連線，初始畫面透過localStorage查找歷史資料、去建立html顯示畫面出來
  displayHistoryItems();

  // Step2 針對畫面 all btEdits 增加監聽功能 ，modalEdit才能知道是誰被點取，
  // 內含一小function
  (function btnEditAppendFunctions() {
    let btnEdits = document.querySelectorAll(".yoichi-p-show-edit");
    btnEdits.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let parentElement = e.target.parentElement;
        // 跟sync 合併使用
        // 每次被點選 都要查看自已的yoichi-p-show-edit-${index} index是多少
        let index = btn.id.match(/\d+/);
        index = Number(index[0]);
        synchronizeEditModalContent(parentElement, index);
      });
    });
    // #yoichi-p-delete  這是modalEdit 刪除按鈕，只會有一個，欲知who被刪除直接參照modal內名稱跟價錢
  })();
  // 使Modal 編輯畫面 讀取form area的內容 (by .now-edit-product-${index})
  function synchronizeEditModalContent(parentElement, index) {
    let productName = parentElement.querySelector(
      ".yoichi-p-show-name p"
    ).innerText;
    let productPrice = parentElement.querySelector(
      ".yoichi-p-show-price p"
    ).innerText;
    let productDiscountQty = Product.products[index].discountQty || 0;
    let productDiscountAmount = Product.products[index].discountAmount || 0;

    document.querySelector("#yoichi-p-edit-setName").value = productName;
    if (productPrice.endsWith("元")) {
      productPrice = productPrice.replace("元", "");
    }
    document.querySelector("#yoichi-p-edit-setPrice").value = productPrice;
    document.querySelector("#yoichi-p-edit-setDiscountQty").value =
      productDiscountQty;
    document.querySelector("#yoichi-p-edit-setDiscountAmount").value =
      productDiscountAmount;

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
      let discountQtyInput = document.querySelector("#yoichi-p-add-setDiscountQty");
      let discountAmountInput = document.querySelector(
        "#yoichi-p-add-setDiscountAmount"
      );
      // appendAlert("成功", "success");

      if (Product.products.filter((p) => nameInput.value == p.name).length) {
        alert("重複商品名稱");
        console.log("重複了");
        return;
      }

      // [] 屬於 truthy value!

      if (
        isNaN(Number(priceInput.value)) ||
        isNaN(Number(discountQtyInput.value || 0)) ||
        isNaN(Number(discountAmountInput.value || 0))
      ) {
        console.log("非數字");
      } else {
        Product.historyRetrieve();
        new Product(
          nameInput.value,
          Number(priceInput.value),
          Number(discountQtyInput.value || 0),
          Number(discountAmountInput.value || 0)
        );
        // console.log("是數字");
        // console.log(Product.products);
        nameInput.value = "";
        priceInput.value = "";
        discountQtyInput.value = "";
        discountAmountInput.value = "";
        Product.historyUpdate();
        displayHistoryItems();
        // 有更新要重新抓資料
        // 編輯按鈕要附加功能上去
        let btnEdits = document.querySelectorAll(".yoichi-p-show-edit");
        btnEdits.forEach((btn, i) => {
          if (i == Product.products.length - 1) {
            btn.addEventListener("click", (e) => {
              let parentElement = e.target.parentElement;
              // 跟sync 合併使用
              // 每次被點選 都要查看自已的yoichi-p-show-edit-${index} index是多少
              let index = btn.id.match(/\d+/);
              index = Number(index[0]);
              synchronizeEditModalContent(parentElement, index);
            });
          }
        });
      }
    });
  })();
  // Step4 editModal 內部刪除按鈕   只需要被呼喚一次就夠
  (function editProductDelete() {
    let btnDelete = document.querySelector("#yoichi-p-delete");
    console.log("執行一次");
    btnDelete.addEventListener("click", (e) => {
      let modalEdit = document.querySelector("#yoichi-product-edit");
      modalEdit.classList.forEach((c) => {
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
            Product.products = Product.products.filter((p, index) => {
              if (Number(numberPart) == index) {
                let checkExist = document.querySelector(
                  `#yoichi-p-show-edit-${index}`
                );
                console.log(checkExist.parentElement);
                checkExist.parentElement.addEventListener(
                  "animationend",
                  (e) => {
                    console.log("被觸發了");
                    e.target.remove();
                    // 直接刪除會跳號，要處理一下。
                    // 更新 畫面上面的edit-標籤號碼 不要讓它跳號!
                    (function refreshEdit_id() {
                      let displayAreaDiv = document.querySelectorAll(
                        ".yoichi-p-show-edit"
                      );
                      console.log("正在改編號");
                      displayAreaDiv.forEach((btn, index) => {
                        console.log(btn, index);
                        btn.id = `yoichi-p-show-edit-${index}`;
                      });
                    })();
                  }
                );
                checkExist.parentElement.style.animation =
                  "scaleDown 0.3s ease forwards";
                return false; // vanish
              } else {
                return true; //pass
              }
            });
            console.log(Product.products);
            Product.historyUpdate();
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

      modalEdit.classList.forEach((c) => {
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
                let newName = document.querySelector(
                  "#yoichi-p-edit-setName"
                ).value;

                let newPrice = document.querySelector(
                  "#yoichi-p-edit-setPrice"
                ).value;
                let newDiscountQty = document.querySelector(
                  "#yoichi-p-edit-setDiscountQty"
                ).value;
                let newDiscountAmount = document.querySelector(
                  "#yoichi-p-edit-setDiscountAmount"
                ).value;
                if (
                  isNaN(Number(newPrice)) ||
                  isNaN(Number(newDiscountQty || 0)) ||
                  isNaN(Number(newDiscountAmount || 0))
                ) {
                  console.log("非數字");
                } else {
                  // 改變暫存products資料完成
                  p.name = newName;
                  console.log("你好 ", p.name, p.price);
                  p.price = Number(newPrice);
                  p.discountQty = Number(newDiscountQty || 0);
                  p.discountAmount = Number(newDiscountAmount || 0);

                  // 改變畫面
                  console.log(checkExist.parentElement);
                  checkExist.parentElement.querySelector(
                    ".yoichi-p-show-name p"
                  ).innerText = p.name;
                  checkExist.parentElement.querySelector(
                    ".yoichi-p-show-price p"
                  ).innerText = p.price + "元";
                  checkExist.parentElement.querySelector(
                    ".yoichi-p-show-price"
                  ).innerHTML = `<p>${p.price}元</p><p>折扣數量: ${
                    p.discountQty || 0
                  }</p><p>折扣金額: ${p.discountAmount || 0}</p>`;
                }
              }
              return p;
            });
            console.log(Product.products);
            // 實踐更新
            Product.historyUpdate();
            // window.location.reload();
          }
        }
      });
    });
  })();
};
export default myEditScript;
