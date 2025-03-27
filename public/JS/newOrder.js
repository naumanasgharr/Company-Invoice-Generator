fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));



document.addEventListener("DOMContentLoaded",()=>{
  const form = document.getElementById('mainForm');
  document.querySelector('#addOrderButton').addEventListener('click',()=>{
    const productContainer = document.querySelector('.productContainer');
    const orderSection = document.createElement('div');
    const orderHeader = document.createElement('div');
    orderSection.className = 'orderSection';
    orderHeader.className = 'orderHeader';
    orderHeader.innerHTML = `
      <label for = 'orderNumber'>PO Number:</label>
      <input type='text' name='orderNumber' id='orderNumber'>
    `;
    const removeOrderButton = document.createElement('button');
    removeOrderButton.innerText = 'Remove order';
    removeOrderButton.id = 'removeOrderButton';
    removeOrderButton.type = 'button';
    removeOrderButton.addEventListener('click',()=>{
      orderSection.remove();  
    });
    orderHeader.append(removeOrderButton);
    orderSection.appendChild(orderHeader);
    productContainer.appendChild(orderSection);

    const addProductButton = document.createElement('button');
    addProductButton.type = 'button';
    addProductButton.id = 'addProductButton';
    addProductButton.innerText = 'add product';
    orderHeader.appendChild(addProductButton);
    addProductButton.addEventListener('click',()=>{
      const productRow = document.createElement('div');
      productRow.className = 'productRow';
      productRow.innerHTML =`
        <label for="productNumber">Article ID: </label>
        <input class = "prodInput" type="text" id="productNumber" name = "productNumber">
        <label for="productAmount">Order Qty: </label>
        <input class = "prodInput" id ="productAmount" name ="productAmount" min="0" step="1" value="0" />               
        <label for="unitPrice">Unit Price: </label>
        <input class="unitPrice" type="number" name="unitPrice" min="0" step="0.01">
        <label for="currency">Currency: </label>
        <select name="currency" class="currency">
          <option>USD</option>
          <option>PKR</option>
          <option>SAUDI RIYAL</option>
          <option>UAE DHIRAM</option>
        </select>
        <br>
        <br>
      `;
      const removeProductButton = document.createElement('button');
      removeProductButton.id = 'RemoveProductButton';
      removeProductButton.type = 'button';
      removeProductButton.innerText = 'Remove';
      removeProductButton.addEventListener('click',()=>{
        productRow.remove();
      });
      productRow.appendChild(removeProductButton);
      orderSection.appendChild(productRow);
    });
  });

  form.addEventListener('submit',async function (event){
    event.preventDefault();
    const formData = {
      orderDate: form.orderDate.value,
      customerID: form.customerID.value,
      loadingPort: form.loadingPort.value,
      shippingPort: form.shippingPort.value,
      shipmentDate: form.shipmentDate.value,
      orders: []
    };
    document.querySelectorAll('.orderSection').forEach(orderDiv=>{
      const order = {
        orderNumber: orderDiv.querySelector('[name=orderNumber]').value,
        products: []
      };
      orderDiv.querySelectorAll('.productRow').forEach(row=>{
        const product = {
          productNumber: row.querySelector('[name="productNumber"]').value,
          productAmount: row.querySelector('[name="productAmount"]').value,
          unitPrice: row.querySelector('[name="unitPrice"]').value,
          currency: row.querySelector('[name="currency"]').value
        };
        order.products.push(product);
      });
      formData.orders.push(order);
    });
    console.log("Collected Order Data:", formData);
    try{
    const response = await fetch("http://localhost:3000/performaInvoice",{
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    });
    if (response.ok) {
      const result = await response.json();
      //console.log("Response:", result);
      if(result.message)
      {
        alert('success!');
        window.location.href = "../Invoices/performa1.html";
      }
      else{
        alert('failure');
      }
    }
    }catch (error) {
      console.error("Fetch Error:", error);
      alert("An error occurred while submitting the order.");
    }
  });
});