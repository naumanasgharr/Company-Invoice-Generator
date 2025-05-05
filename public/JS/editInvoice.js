fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));



document.addEventListener("DOMContentLoaded", () => {
    hideViewButtonOnChange();
});
let originalData = {};
let deletedOrderDetails = [];
let deletedOrders = [];
const editForm = document.createElement('form');
editForm.name = 'editForm';
editForm.id = 'editForm';
editForm.action = '#';
editForm.method = 'POST';
fetch("http://localhost:3000/api/selectInvoice",{
    method: 'GET',
    credentials: 'include'
})
.then(response=>response.json())
.then(data=>{
    const select = document.getElementById('selectInvoiceNumber');
    data.forEach(element => {
        const option = document.createElement('option');
        option.className = 'invoiceNumber';
        option.value = element.invoice_number;
        option.innerText = element.invoice_number;
        select.appendChild(option);
    });
    select.addEventListener("change",function (){
        let index = 0;
        let index2 = 0;
        const selectedInvoice = this.value;
        const mainDiv = document.querySelector('.form');
        mainDiv.innerHTML = '';
        if(selectedInvoice != 'select'){
            editForm.innerHTML = ''; // Also clear the form before adding new data
            mainDiv.appendChild(editForm);
            fetch(`http://localhost:3000/api/invoiceDetails?invoice_number=${selectedInvoice}`,{
                method: 'GET',
                credentials: 'include'
            })
            .then(response=>response.json())
            .then(data=>{
                originalData = JSON.parse(JSON.stringify(data));
                console.log(data);
                const invoiceData = data.invoiceData;
                const orderData = data.orders;
                const invoiceDiv = document.createElement('div');
                invoiceDiv.className = 'invoiceDetails';
                const productDiv = document.createElement('div');
                productDiv.className = 'productContainer';

                // generating order date input
                const orderDateLabel = document.createElement('label');
                orderDateLabel.htmlFor = 'orderDate';
                orderDateLabel.innerText = 'Order Date: ';
                const orderDateInput = document.createElement('input');
                orderDateInput.name = 'orderDate';
                orderDateInput.id = 'orderDate';
                orderDateInput.type = 'date';
                orderDateInput.value = `${invoiceData.order_date}`;

                //generating invoice number input 
                const invoiceNumberLabel = document.createElement('label');
                invoiceNumberLabel.htmlFor = 'invoiceNum';
                invoiceNumberLabel.innerText = 'Invoice Number: ';
                const invoiceNumberInput = document.createElement('input');
                invoiceNumberInput.name = 'invoiceNum';
                invoiceNumberInput.id = 'invoiceNum';
                invoiceNumberInput.type = 'text';
                invoiceNumberInput.value = `${invoiceData.invoice_number}`;
                invoiceNumberInput.disabled = true;

                //generating customer ID input
                const customerIDLabel = document.createElement('label');
                customerIDLabel.htmlFor = 'customerID';
                customerIDLabel.innerText = 'Customer ID: ';
                const customerIDInput = document.createElement('input');
                customerIDInput.name = 'customerID';
                customerIDInput.id = 'customerID';
                customerIDInput.type = 'text';
                customerIDInput.value = `${invoiceData.customer_id}`;

                //generating shipment date input
                const shipmentDateLabel = document.createElement('label');
                shipmentDateLabel.htmlFor = 'shippingDate';
                shipmentDateLabel.innerText = 'Shipping Date: ';
                const shipmentDateInput = document.createElement('input');
                shipmentDateInput.name = `shipmentDate`;
                shipmentDateInput.className = 'shipmentDate';
                shipmentDateInput.type = 'date';
                shipmentDateInput.value = `${invoiceData.shipping_date}`;

                //generating shipment port input
                const shipmentPortLabel = document.createElement('label');
                shipmentPortLabel.htmlFor = 'shippingPort';
                shipmentPortLabel.innerText = 'Shipping Port: ';
                const shipmentPortInput = document.createElement('input');
                shipmentPortInput.name = `shippingPort`;
                shipmentPortInput.className = 'shippingPort';
                shipmentPortInput.type = 'text';
                shipmentPortInput.value = `${invoiceData.shipping_port}`;
                        
                //generating loading port input
                const loadingPortLabel = document.createElement('label');
                loadingPortLabel.htmlFor = 'loadingPort';
                loadingPortLabel.innerText = 'Loading Port: ';
                const loadingPortInput = document.createElement('input');
                loadingPortInput.name = `loadingPort`;
                loadingPortInput.className = 'loadingPort';
                loadingPortInput.type = 'text';
                loadingPortInput.value = `${invoiceData.loading_port}`;
                //appending inputs to invoiceDiv and invoiceDiv to editForm
                invoiceDiv.append(orderDateLabel,orderDateInput,invoiceNumberLabel,invoiceNumberInput,customerIDLabel,customerIDInput,shipmentDateLabel,shipmentDateInput,loadingPortLabel,loadingPortInput,shipmentPortLabel,shipmentPortInput);
                mainDiv.appendChild(editForm);
                editForm.appendChild(invoiceDiv);

                //adding a new order
                const newOrderButton = document.createElement('button');
                newOrderButton.id = 'addNewOrder';
                newOrderButton.innerText = 'New Order';
                newOrderButton.type = 'button';
                newOrderButton.addEventListener('click',()=>{
                const orderSection = document.createElement('div');
                orderSection.className = 'orderSection';
                orderSection.innerHTML = `
                    <label for = 'orderNumber'>PO Number:</label>
                    <input type='text' name='orderNumber' class='orderNumber'>
                `;
                const removeOrderButton = document.createElement('button');
                removeOrderButton.innerText = 'Remove order';
                removeOrderButton.className = 'removeOrder';
                removeOrderButton.type = 'button';
                removeOrderButton.addEventListener('click',()=>{
                    orderSection.remove();  
                });
                orderSection.appendChild(removeOrderButton);
                productDiv.appendChild(orderSection);

                const addProductButton = document.createElement('button');
                addProductButton.type = 'button';
                addProductButton.className = 'addProduct';
                addProductButton.innerText = 'add product';
                orderSection.appendChild(addProductButton);
                addProductButton.addEventListener('click',()=>{
                    const productRow = document.createElement('div');
                        productRow.className = 'productRow';
                        productRow.innerHTML =`
                            <label for="productNumber">Article ID: </label>
                            <input class = "prodInput" type="text" id="productNumber" name = "productNumber">
                            <label for="productAmount">Article Amount (pieces): </label>
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
                        `;
                    const removeProductButton = document.createElement('button');
                    removeProductButton.className = 'removeProduct';
                    removeProductButton.type = 'button';
                            removeProductButton.innerText = 'Remove Product';
                            removeProductButton.addEventListener('click',()=>{
                                productRow.remove();
                            });
                            productRow.appendChild(removeProductButton);
                            orderSection.appendChild(productRow);
                            });
                        });
                        productDiv.appendChild(newOrderButton);
                        
                        orderData.forEach(order=>{
                            const orderSection = document.createElement('div');
                            orderSection.className = 'orderSection';
                            //order number
                            const orderNumberLabel = document.createElement('label');
                            orderNumberLabel.htmlFor = 'orderNumber';
                            orderNumberLabel.innerText = 'PO Number: ';
                            const orderNumberInput = document.createElement('input');
                            orderNumberInput.name = `orderNumber`;
                            orderNumberInput.className = 'orderNumber';
                            orderNumberInput.type = 'text';
                            orderNumberInput.value = `${order.orderNumber}`;

                            //hidden order_id input
                            const orderIdInput = document.createElement('input');
                            orderIdInput.value = `${order.order_id}`;
                            orderIdInput.hidden = true;
                            orderIdInput.name = 'orderID';

                            //add new product row
                            const newProductButton = document.createElement("button");
                            newProductButton.innerText = "Add Product";
                            newProductButton.type = "button";
                            newProductButton.className = "addProduct";
                            newProductButton.addEventListener('click',()=>{
                                const newRow = document.createElement('div');
                                newRow.className = 'productRow';
                                newRow.innerHTML = `
                                    <label for = 'productNumber'>Article ID: </label>
                                    <input type = 'text' name = 'productNumber' id = 'productNumber'>
                                    <label for = 'productAmount'>Article Amount:</label>
                                    <input type = 'text' name = 'productAmount' id = 'productAmount'> 
                                    <label for = 'unitPrice'>Unit Price:</label>
                                    <input type = 'number' name = 'unitPrice' id = 'unitPrice' min = '0' step = '0.01'>
                                    <label for = 'currency'>Currency: </label>
                                    <select name = 'currency' class= 'currency'>
                                    <option>USD</option>
                                    <option>PKR</option>
                                    <option>SAUDI RIYAL</option>
                                    <option>UAE DHIRAM</option>
                                    </select>
                                `;
                                const removeProductButton = document.createElement("button");
                                removeProductButton.innerText = "Remove Product";
                                removeProductButton.type = "button";
                                removeProductButton.className = "removeProduct";
                                removeProductButton.addEventListener("click", function () {
                                    newRow.remove(); // Remove row from UI
                                });
                                newRow.appendChild(removeProductButton);
                                orderSection.appendChild(newRow);    
                            });

                            //remove order completely
                            const removeOrderButton = document.createElement("button");
                            removeOrderButton.innerText = "Remove Order";
                            removeOrderButton.type = "button";
                            removeOrderButton.className = "removeOrder";
                            removeOrderButton.addEventListener('click',()=>{
                                orderSection.remove();
                                deletedOrders.push(order.order_id);
                                console.log("deleted orders: ",deletedOrders);
                            });
                            orderSection.append(orderNumberLabel, orderIdInput, orderNumberInput,removeOrderButton,newProductButton);
                            //ORDERS
                            order.orderDetails.forEach(detail=>{
                                const productRow = document.createElement('div');
                                productRow.className = 'productRow';
                                
                                //hidden orderDetail id input
                                const detailIdInput = document.createElement('input');
                                detailIdInput.name = 'detailId';
                                detailIdInput.value =`${detail.detailId}`;
                                detailIdInput.hidden = true;
                                
                                //product number
                                const productNumberLabel = document.createElement('label');
                                productNumberLabel.htmlFor = 'productNumber';
                                productNumberLabel.innerText = 'Article ID: ';
                                const productNumberInput = document.createElement('input');
                                productNumberInput.name = `productNumber`;
                                productNumberInput.className = 'productNumber';
                                productNumberInput.type = 'text';
                                productNumberInput.value = `${detail.article_number}`;

                                //hidden product id input
                                const productIdInput = document.createElement('input');
                                productIdInput.name = 'productId';
                                productIdInput.value = `${detail.article_id}`;
                                productIdInput.hidden = true;

                                //product amount 
                                const productAmountLabel = document.createElement('label');
                                productAmountLabel.htmlFor = 'productAmount';
                                productAmountLabel.innerText = 'Article Amount: ';
                                const productAmountInput = document.createElement('input');
                                productAmountInput.name = `productAmount`;
                                productAmountInput.className = 'productAmount';
                                productAmountInput.type = 'text';
                                productAmountInput.value = `${detail.article_amount}`;
                                //unit price
                                const unitPriceLabel = document.createElement('label');
                                unitPriceLabel.htmlFor = 'unitPrice';
                                unitPriceLabel.innerText = 'Unit Price : ';
                                const unitPriceInput = document.createElement('input');
                                unitPriceInput.name = `unitPrice`;
                                unitPriceInput.className = 'unitPrice';
                                unitPriceInput.type = 'number';
                                unitPriceInput.min = '0';
                                unitPriceInput.step = '0.01';
                                unitPriceInput.value = `${detail.unit_price}`;

                                const currencyLabel = document.createElement('label');
                                currencyLabel.htmlFor = 'currency';
                                currencyLabel.innerText = 'Currency: ';
                                const currencySelect = document.createElement('select');
                                currencySelect.name = `currency`;
                                currencySelect.className = 'currency';
                                ['USD', 'PKR', 'SAUDI RIYAL', 'UAE DHIRAM'].forEach(currency => {
                                    const option = document.createElement('option');
                                    option.innerText = currency;
                                    currencySelect.appendChild(option);
                                });
                                currencySelect.value = `${detail.currency}`;

                                // remove button for removing the productRows
                                const removeProductButton = document.createElement("button");
                                removeProductButton.innerText = "Remove Product";
                                removeProductButton.type = "button";
                                removeProductButton.className = "removeProduct";
                                //removeProductButton.dataset.orderIndex = index;

                                removeProductButton.addEventListener("click", function () {
                                    productRow.remove(); // Remove row from UI
                                    deletedOrderDetails.push(detail.detailId);
                                    // Track order for deletion
                                    //updateRowIndices(); // Update field names after deletion
                                    console.log("deleted order details: ",deletedOrderDetails);
                                });

                                productRow.append(detailIdInput,productNumberLabel,productNumberInput,productIdInput,productAmountLabel,productAmountInput,unitPriceLabel,unitPriceInput,currencyLabel,currencySelect,removeProductButton);
                                orderSection.appendChild(productRow);
                            });
                            index++;
                            productDiv.appendChild(orderSection);
                            //console.log(order);
                        });
                        editForm.appendChild(productDiv);
                        const submitButtonDiv = document.createElement('div');
                        submitButtonDiv.className = 'submitButtonDiv';
                        submitButtonDiv.innerHTML =`
                            <button id="save" type="submit">Save</button>
                        `;
                        editForm.append(submitButtonDiv);

                        editForm.addEventListener("submit",editFormSubmitHandler);
                    })
                .catch(error => console.error('Error fetching customer data:', error));
            }
        });
    })
.catch(error => console.error('Error fetching customer data:', error));

function updateRowIndices() {
    document.querySelectorAll('.productRow').forEach((row, newIndex) => {
        row.querySelectorAll('input, select').forEach((input) => {
            let name = input.name.replace(/\[\d+\]/, `[${newIndex}]`);
            input.name = name;
        });
    });
}

function showViewButton(){
    const buttonDiv = document.querySelector('.submitButtonDiv');
    if (!buttonDiv) {
        buttonDiv = document.createElement('div');
        buttonDiv.className = 'submitButtonDiv';
        document.querySelector('#editForm').appendChild(buttonDiv);
    }

    const existingButton = document.querySelector('#viewInvoice');
    if(existingButton){
        existingButton.remove();
        
    }
    const viewButton = document.createElement('button');
    viewButton.innerText = 'View Invoice';
    viewButton.id = 'viewInvoice';
    viewButton.type = 'button';
    viewButton.className = 'button';
    buttonDiv.appendChild(viewButton);

    viewButton.addEventListener('click', ()=>{
        //form.removeEventListener("submit", editFormSubmitHandler);
        //viewButton.removeEventListener("click", viewButtonEventHandler);
        viewButton.addEventListener("click",viewButtonEventHandler);
    });

    hideViewButtonOnChange();
}

function hideViewButtonOnChange() {
    const inputs = document.querySelectorAll("#editForm input, #editForm select, #editForm textarea");

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            const viewButton = document.getElementById("viewInvoice");
            if (viewButton) {
                viewButton.remove(); // Remove the button when user changes anything
            }
        });
    });
}

async function editFormSubmitHandler(event){
    event.preventDefault();
    const formData={
        new:{
            orderDate: editForm.orderDate.value,
            invoiceNum: editForm.invoiceNum.value,
            customerID: editForm.customerID.value,
            loadingPort: editForm.loadingPort.value,
            shippingPort: editForm.shippingPort.value,
            shipmentDate: editForm.shipmentDate.value,
            deletedOrders: deletedOrders,
            deletedOrderDetails: deletedOrderDetails,
            orders: []
        }
    };
    document.querySelectorAll('.orderSection').forEach(orderDiv=>{
        let orderId = null;
        const orderIdInput = orderDiv.querySelector('[name="orderID"]');
        if(orderIdInput){
            orderId = orderIdInput.value;
        }
        const order = {
            orderNumber: orderDiv.querySelector('.orderNumber').value,
            orderId: orderId,
            products: []
        };
        orderDiv.querySelectorAll('.productRow').forEach(row=>{
            let detailId = null;
            let productId = null;
            const productIdInput = row.querySelector('[name="productId"]');
            const detailIdInput = row.querySelector('[name="detailId"]');
            if(detailIdInput){
                detailId = detailIdInput.value;
            }
            if(productIdInput){
                productId = productIdInput.value;
            }
            const product = {
                orderid: orderId,
                detailId: detailId,
                productId: productId,
                productNumber: row.querySelector('[name="productNumber"]').value,
                productAmount: row.querySelector('[name="productAmount"]').value,
                unitPrice: row.querySelector('[name="unitPrice"]').value,
                currency: row.querySelector('[name="currency"]').value
            };
            order.products.push(product);
        });
        formData.new.orders.push(order);
    });
    console.log(formData);
    try{
        const response = await fetch("http://localhost:3000/editPerformaInvoice",{
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        const result = await response.json();
        if (!response.ok) {
            alert("Error: " + result.error);
        } else {
            alert(result.message);
            showViewButton();
        }
        console.log("Server Response:", result);
    }catch (error) {
        console.error("Fetch Error:", error);
        alert("An error occurred while submitting the order.");
    }

}

async function viewButtonEventHandler(event){
    event.preventDefault();
    const form = document.querySelector('#editForm');
    const formData = {
      orderDate: form.orderDate.value,
      invoiceNum: form.invoiceNum.value,
      customerID: form.customerID.value,
      loadingPort: form.loadingPort.value,
      shippingPort: form.shippingPort.value,
      shipmentDate: form.shipmentDate.value,
      source: 'editForm',
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
      console.log("Response:", result);
      if(result.message)
      {
        //alert('success!');
        window.location.href = "../Invoices/performa1.html";
      }
      else{
        alert('failure');
      }

      // Redirect user to the URL returned by the backend
    }
    }catch (error) {
      console.error("Fetch Error:", error);
      alert("An error occurred while submitting the order.");
    }
}

