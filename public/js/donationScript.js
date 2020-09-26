function addToCart(event){
  //console.log(event);
  let button = event.target;
  let item = button.parentNode.parentNode;
  let cart = document.getElementById("cart");

  let itemName = item.getElementsByClassName("store-item-title")[0].innerText;
  let itemPrice = item.getElementsByClassName("store-item-price")[0].innerText;
  itemPrice = itemPrice.split(" ")[1];
  let itemId = item.dataset.itemId;

  let cartItem = document.createElement('div');
  cartItem.classList += "cart-item";
  cartItem.dataset.itemId = item.dataset.itemId;

  let cartItemName = document.createElement('span');
  cartItemName.classList += "cart-item-name";
  cartItemName.innerText = itemName;
  cartItem.append(cartItemName);
  let cartItemPrice = document.createElement('span');
  cartItemPrice.classList += "cart-item-price";
  cartItemPrice.innerText = itemPrice;
  cartItem.append(cartItemPrice);

  // let cartItemQuantity = document.createElement('input');
  // cartItemQuantity.classList += "cart-item-quantity";
  // cartItemQuantity.value = 1;

  let cartItemQuantity = document.createElement('div');
  cartItemQuantity.classList += "cart-item-quantity";
  let decrementButton = document.createElement("button");
  decrementButton.classList += "btn quantity-decrement-button";
  decrementButton.innerHTML = "-";
  decrementButton.onclick = decreaseQuantity;
  cartItemQuantity.append(decrementButton);
  let quantityValue = document.createElement("label");
  quantityValue.classList += "quantity-value";
  quantityValue.innerHTML = "1";
  cartItemQuantity.append(quantityValue);
  let incrementButton = document.createElement("button");
  incrementButton.classList += "btn quantity-increment-button";
  incrementButton.innerHTML = "+";
  incrementButton.onclick = increaseQuantity;
  cartItemQuantity.append(incrementButton);

  //cartItemQuantity.onchange = quantityChange;//(event);
  cartItem.append(cartItemQuantity);
  
  let cartItemTotal = document.createElement('span');
  cartItemTotal.classList += "cart-item-total";
  cartItemTotal.innerText = itemPrice;
  cartItem.append(cartItemTotal);

  let cartItemRemoveButton = document.createElement("button");
  cartItemRemoveButton.classList += "btn remove-button";
  cartItemRemoveButton.innerHTML = "Remove";
  cartItemRemoveButton.onclick = removeItem;
  cartItem.append(cartItemRemoveButton);

  cart.append(cartItem);

  reCalculateCartTotal();
}

function removeItem(event){
  console.log(event);
  let elt = event.target.parentElement;
  console.log(elt);
  elt.parentElement.removeChild(elt);

  reCalculateCartTotal();
}

function decreaseQuantity(event){
  let quantityElement = event.target.parentNode.getElementsByClassName("quantity-value")[0];
  let quantityString = quantityElement.innerHTML;
  let quantity = parseInt(quantityString);
  quantity -= 1;
  if(quantity < 0){
    quantity = 10;
  }
  quantityString = quantity.toString();
  quantityElement.innerHTML = quantityString;

  quantityChange(quantityElement);
}

function increaseQuantity(event){
  let quantityElement = event.target.parentNode.getElementsByClassName("quantity-value")[0];
  let quantityString = quantityElement.innerHTML;
  let quantity = parseInt(quantityString);
  quantity += 1;
  if(quantity > 10){
    quantity = 1;
  }
  quantityString = quantity.toString();
  quantityElement.innerHTML = quantityString;

  quantityChange(quantityElement);
}

function quantityChange(elt){
  let inputElement = elt;

  let quantity = inputElement.innerHTML;
  let price = inputElement.parentNode.parentNode.getElementsByClassName("cart-item-price")[0].innerText;
  price = price.slice(1,price.length);

  let totalFloat = (parseFloat(price) * parseFloat(quantity));
  let totalString = "R" + totalFloat.toString();

  inputElement.parentNode.parentNode.getElementsByClassName("cart-item-total")[0].innerText = totalString;

  reCalculateCartTotal();
}

function reCalculateCartTotal(){
  let sum = 0;
  let cart = document.getElementById("cart");
  let cartItems = cart.getElementsByClassName("cart-item");
  for(let i = 0; i < cartItems.length; i++){
    let elt = cartItems[i];
    let quantityString = elt.getElementsByClassName("cart-item-quantity")[0].getElementsByClassName("quantity-value")[0].innerHTML;
    let quantity = parseInt(quantityString);
    let price = elt.getElementsByClassName("cart-item-price")[0].innerText;
    price = price.slice(1,price.length);

    let totalFloat = (parseFloat(price) * parseFloat(quantity));
    sum += totalFloat;
  }

  let cartTotalElement = document.getElementById("cartTotal").getElementsByClassName('cartTotal-lable')[0];
  let cartTotalString = cartTotalElement.innerText;
  let cartTotalFloat = parseFloat(cartTotalString.slice(14,cartTotalString.length));

  cartTotalFloat = sum;
  cartTotalString = "Total Price: R" + cartTotalFloat.toString();
  cartTotalElement.innerText = cartTotalString;
}

let items = [];

function purchase(){
  items = [];
  let cart = document.getElementById("cart");
  let cartItems = cart.getElementsByClassName("cart-item");
  for(let i = 0; i < cartItems.length; i++){
    let elt = cartItems[i];
    let quantity = elt.getElementsByClassName("cart-item-quantity")[0].getElementsByClassName("quantity-value")[0].innerHTML;
    let obj = {id:elt.dataset.itemId, quantity:quantity};
    items.push(obj);
  }
  for(let i = cartItems.length-1; i >= 0; i--){
    let elt = cartItems[i];
    elt.parentElement.removeChild(elt);
  }
  document.getElementById("info").style = "display: block;";
}

function confirmation(){
  let infoForm = document.getElementById("info");
  infoForm.style = "display: none;";

  let data = {};
  data.first = infoForm.getElementsByClassName("name_first")[0].value;
  data.last = infoForm.getElementsByClassName("name_last")[0].value;
  data.email = infoForm.getElementsByClassName("email_address")[0].value;
  data.number = infoForm.getElementsByClassName("cell_number")[0].value;
  let info = {data:data, items:items};

  fetch('/getPaymentData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(info)
  }).then((res) => {
    return res.json();
  }).then((paymentData) => {
    let htmlForm = `<form id="paymentForm" action="https://www.payfast.co.za/eng/process" method="post">`;
    for (let key in paymentData) {
      if(paymentData.hasOwnProperty(key)){
        value = paymentData[key];
        if (value !== "") {
          htmlForm +=`<input name="${key}" type="hidden" value="${value.trim()}" />`;
        }
      }
    }
    htmlForm += '</form>';
    let holder = document.createElement("div");
    holder.innerHTML = htmlForm;
    document.getElementsByTagName('body')[0].append(holder);
    let f = document.getElementById("paymentForm");
    f.submit();
  }).catch((err) => {
    console.error(err);
  })
}