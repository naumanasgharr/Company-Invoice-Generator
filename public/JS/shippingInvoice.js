fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));

fetch('http://localhost:3000/api/customerNames',{
  method: 'GET',
  credentials: 'include'
})
.then(response=>response.json())
.then(data=>{
    const customerNameSelect = document.querySelector('#customerName');
    data.forEach(name=>{
        const customerNameOption = document.createElement('option');
        customerNameOption.value = name.id;
        customerNameOption.innerText = name.name;
        customerNameSelect.appendChild(customerNameOption);
    });
    document.querySelector('#customerName').addEventListener('change',()=>{
        const customerIdInput = document.querySelector('#customerID');
        customerIdInput.value = customerNameSelect.value;
        const orderNumberSelect = document.querySelector('#order-invoiceNumbers');
        const cartonPackingLabel = document.querySelector('#cartonPackingLabel');
        const cartonPackingUnit = document.querySelector('#cartonPackingUnits');
        const addButton = document.querySelector('#addButton');
        const cartonsValueLabel = document.querySelector('#cartonsValueLabel');
        const netWeightLabel = document.querySelector('#cartonNetWeightLabel');
        const grossWeightLabel = document.querySelector('#cartonGrossWeightLabel');
        const articleNumberSelect = document.querySelector('#articleNumbers');
        netWeightLabel.hidden = true;
        grossWeightLabel.hidden = true;
        orderNumberSelect.hidden = true;
        cartonsValueLabel.hidden = true;
        addButton.hidden = true;
        cartonPackingUnit.hidden = true;
        cartonPackingLabel.hidden = true;
        const unitPriceLabel = document.querySelector('#unitPriceLabel');
        const currencyLabel = document.querySelector('#currencyLabel');
        currencyLabel.hidden = true;
        unitPriceLabel.hidden = true;
        netWeightLabel.querySelector('input').value = '';
        grossWeightLabel.querySelector('input').value = '';
        cartonsValueLabel.querySelector('input').value = '';
        articleNumberSelect.innerHTML = '';
        articleNumberSelect.hidden = true;

        if(customerNameSelect.value !== '--SELECT--'){
            orderNumberSelect.innerHTML = '';
            articleNumberSelect.hidden = false;
            fetch(`http://localhost:3000/api/articleNumbersAndNamesForShipmentInvoice?customerId=${customerNameSelect.value}`,{
              method: 'GET',
              credentials: 'include'
            })
            .then(response=>response.json())
            .then(data=>{
              console.log(data);
                const selectOption = document.createElement('option');
                selectOption.innerText = '--SELECT--';
                articleNumberSelect.appendChild(selectOption);
                data.forEach(obj=>{
                    const articleNumberOption = document.createElement('option');
                    articleNumberOption.value = obj.customer_article_id;
                    articleNumberOption.innerText = `${obj.article_number}-${obj.description}`;
                    articleNumberSelect.appendChild(articleNumberOption);
                });
                articleNumberSelect.addEventListener('change',()=>{
                    const cartonPackingLabel = document.querySelector('#cartonPackingLabel');
                    const cartonPackingUnit = document.querySelector('#cartonPackingUnits');
                    const addButton = document.querySelector('#addButton');
                    const cartonsValueLabel = document.querySelector('#cartonsValueLabel');
                    const netWeightLabel = document.querySelector('#cartonNetWeightLabel');
                    const grossWeightLabel = document.querySelector('#cartonGrossWeightLabel');
                    const unitPriceLabel = document.querySelector('#unitPriceLabel');
                    const currencyLabel = document.querySelector('#currencyLabel');
                    currencyLabel.hidden = true;
                    unitPriceLabel.hidden = true;
                    netWeightLabel.hidden = true;
                    grossWeightLabel.hidden = true;
                    cartonsValueLabel.hidden = true;
                    addButton.hidden = true;
                    cartonPackingUnit.hidden = true;
                    cartonPackingLabel.hidden = true;
                    netWeightLabel.querySelector('input').value = '';
                    grossWeightLabel.querySelector('input').value = '';
                    cartonsValueLabel.querySelector('input').value = '';
                    const orderNumberSelect = document.querySelector('#order-invoiceNumbers');
                    orderNumberSelect.hidden = true;
                    const displayDiv = document.querySelector('#display');
                    displayDiv.innerHTML = '';
                    orderNumberSelect.innerHTML = '';

                    if(articleNumberSelect.value !='--SELECT--'){
                        orderNumberSelect.hidden = false;
                        orderNumberSelect.innerHTML = '';
                        fetch(`http://localhost:3000/api/invoiceAndOrderNumbers?articleNumber=${articleNumberSelect.value}`,{
                          method: 'GET',
                          credentials: 'include'
                        })
                        .then(response => response.json())
                        .then(data=>{
                            const selectOption = document.createElement('option');
                            selectOption.innerText = '--SELECT--';
                            orderNumberSelect.appendChild(selectOption);
                            data.forEach(obj=>{
                                const orderNumberOption = document.createElement('option');
                                orderNumberOption.innerText = `${obj.order_number} - Inv: ${obj.invoice_number}`;
                                orderNumberOption.value = `${obj.order_id}`;
                                orderNumberSelect.appendChild(orderNumberOption);
                            });
                            orderNumberSelect.replaceWith(orderNumberSelect.cloneNode(true));
                            document.querySelector('#order-invoiceNumbers').addEventListener('change', handleOrderNumberChange);  
                            
                        })  
                        .catch(error=>console.log(error));
                    }
                    
                });
            })
            .catch(error=>console.log(error));
        }

    });
    
    
})
.catch(error=>console.log(error));

function handleOrderNumberChange() {
    const orderNumberSelect = document.querySelector('#order-invoiceNumbers');
    const articleNumberSelect = document.querySelector('#articleNumbers');
    const displayDiv = document.querySelector('#display');
    const cartonPackingLabel = document.querySelector('#cartonPackingLabel');
    const cartonPackingUnit = document.querySelector('#cartonPackingUnits');
    const cartonsValueLabel = document.querySelector('#cartonsValueLabel');
    const netWeightLabel = document.querySelector('#cartonNetWeightLabel');
    const grossWeightLabel = document.querySelector('#cartonGrossWeightLabel');
    const unitPriceLabel = document.querySelector('#unitPriceLabel');
    const currencyLabel = document.querySelector('#currencyLabel');
    const cartonPackingInput = document.querySelector('#cartonPackingInput');
    const unitPriceInput = document.querySelector('#unitPrice');
    const currencyInput = document.querySelector('#currency');
    currencyLabel.hidden = true;
    unitPriceLabel.hidden = true;
    netWeightLabel.hidden = true;
    grossWeightLabel.hidden = true;
    const addButton = document.querySelector('#addButton');
    cartonPackingLabel.hidden = true;
    addButton.hidden = true;
    cartonsValueLabel.hidden = true;
    cartonPackingUnit.hidden = true;
    netWeightLabel.querySelector('input').value = '';
    grossWeightLabel.querySelector('input').value = '';
    cartonsValueLabel.querySelector('input').value = '';


    displayDiv.innerHTML = ''; 

    if (orderNumberSelect.value != '--SELECT--') {
        fetch(`http://localhost:3000/api/orderDetailsShippingInvoiceDisplay?order_id=${orderNumberSelect.value}&article_id=${articleNumberSelect.value}`,{
          method: 'GET',
          credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const articleAmountLabel = document.createElement('label');
                articleAmountLabel.htmlFor = 'articleAmount';
                articleAmountLabel.innerText = `ARTICLE AMOUNT FOR ${data[0].article_number}:`;
                const articleAmountinput = document.createElement('input');
                articleAmountinput.name = 'articleAmount';
                articleAmountinput.disabled = true;
                articleAmountinput.value = `${data[0].article_amount}-${data[0].carton_packing_type}`;

                const balanceLabel = document.createElement('label');
                balanceLabel.htmlFor = 'balance';
                balanceLabel.innerText = `BALANCE AMOUNT:`;
                const balanceInput = document.createElement('input');
                balanceInput.name = 'balance';
                balanceInput.disabled = true;
                balanceInput.value = `${data[0].balance}-${data[0].carton_packing_type}`;
                cartonPackingInput.value = `${data[0].carton_packing}`;
                unitPriceInput.value = `${data[0].unit_price}`;
                currencyInput.value = `${data[0].currency}`;
                cartonPackingUnit.innerHTML =`<option>${data[0].carton_packing_type}</option>`;
                
                cartonPackingLabel.hidden = false;
                cartonPackingUnit.hidden = false;
                cartonsValueLabel.hidden = false;
                netWeightLabel.hidden = false;
                grossWeightLabel.hidden = false;
                addButton.hidden = false;
                currencyLabel.hidden = false;
                unitPriceLabel.hidden = false;



                displayDiv.append(articleAmountLabel, articleAmountinput, balanceLabel, balanceInput);
            })
            .catch(error => console.log(error));
    }
}

document.querySelector('#addButton').addEventListener('click',()=>{
    const subDiv = document.querySelector('#subDiv');
    const productDiv = document.createElement('div');
    productDiv.className = 'productDiv';
    const mainDiv = document.querySelector('#mainDiv');
    
    const header = document.createElement('p');
    const selectedOptionText = mainDiv.querySelector('#articleNumbers').options[mainDiv.querySelector('#articleNumbers').selectedIndex].innerText;
    header.innerHTML = `
        <br>
        <strong>${selectedOptionText}</strong>
        <br>
        Cartons: ${mainDiv.querySelector('#cartonsValueInput').value}
        <br>
        Carton Packing: ${mainDiv.querySelector('#cartonPackingInput').value} - ${mainDiv.querySelector('#cartonPackingUnits').value}
        <br>
        Net WT: ${mainDiv.querySelector('#cartonNetWeight').value} - Gross WT: ${mainDiv.querySelector('#cartonGrossWeight').value}
        <br>
        Unit Price: ${mainDiv.querySelector('#unitPrice').value} ${mainDiv.querySelector('#currency').value}
    `;
    
    const articleIdInput = document.createElement('input');
    articleIdInput.hidden = true;
    articleIdInput.value = mainDiv.querySelector('#articleNumbers').value;
    articleIdInput.name = 'articleId';

    const unitPriceInput = document.createElement('input');
    unitPriceInput.name = 'unitPrice';
    unitPriceInput.hidden = true;
    unitPriceInput.value = mainDiv.querySelector('#unitPrice').value;

    const currencyInput = document.createElement('input');
    currencyInput.hidden = true;
    currencyInput.name = 'currency';
    currencyInput.value = mainDiv.querySelector('#currency').value;
   
    const orderIdInput = document.createElement('input');
    orderIdInput.hidden = true;
    orderIdInput.value = mainDiv.querySelector('#order-invoiceNumbers').value;
    orderIdInput.name = 'orderId';
   
    const cartons = document.createElement('input');
    cartons.hidden = true;
    cartons.value = mainDiv.querySelector('#cartonsValueInput').value;
    cartons.name = 'cartons';

    const cartonPacking = document.createElement('input');
    cartonPacking.hidden = true;
    cartonPacking.value = mainDiv.querySelector('#cartonPackingInput').value;
    cartonPacking.name = 'cartonPacking';

    const cartonPackingUnit = document.createElement('input');
    cartonPackingUnit.hidden = true;
    cartonPackingUnit.value = mainDiv.querySelector('#cartonPackingUnits').value;
    cartonPackingUnit.name = 'cartonPackingUnit';

    const cartonNetWeight = document.createElement('input');
    cartonNetWeight.hidden = true;
    cartonNetWeight.value = mainDiv.querySelector('#cartonNetWeight').value;
    cartonNetWeight.name = 'cartonNetWeight';

    const cartonGrossWeight = document.createElement('input');
    cartonGrossWeight.hidden = true;
    cartonGrossWeight.value = mainDiv.querySelector('#cartonGrossWeight').value;
    cartonGrossWeight.name = 'cartonGrossWeight';

    const removeButton = document.createElement('button');
    removeButton.id = 'removeProductButton';
    removeButton.innerText = 'Remove';
    removeButton.addEventListener('click',()=>{
        productDiv.remove();
    });

    productDiv.append(header, articleIdInput, orderIdInput, cartons, cartonPacking, cartonPackingUnit, cartonNetWeight, cartonGrossWeight, unitPriceInput, currencyInput, removeButton);
    
    subDiv.appendChild(productDiv);
});

document.querySelector('#form').addEventListener('submit',async function (event){
    event.preventDefault();
    const formData = {
      invoiceData:{
        invoiceDate: form.invoiceDate.value,
        customerID: form.customerID.value,
        fiNo: form.fiNo.value,
        blNo: form.blNo.value,
        fiNoDate: form.fiNoDate.value,
        blNoDate: form.blNoDate.value,
        shipmentTerms: form.shipmentTerms.value,
        loadingPort: form.loadingPort.value,
        shippingPort: form.shippingPort.value,
        shipmentDate: form.shipmentDate.value,
      },
      products: []
    };
    document.querySelector('#subDiv').querySelectorAll('.productDiv').forEach(row=>{
      
        const product = {
          productID: row.querySelector('[name="articleId"]').value,
          orderId: row.querySelector('[name="orderId"]').value,
          unitPrice: row.querySelector('[name="unitPrice"]').value,
          currency: row.querySelector('[name="currency"]').value,
          cartons: row.querySelector('[name="cartons"]').value,
          cartonPacking: row.querySelector('[name="cartonPacking"]').value,
          cartonPackingUnit: row.querySelector('[name="cartonPackingUnit"]').value,
          cartonNetWeight: row.querySelector('[name="cartonNetWeight"]').value,
          cartonGrossWeight: row.querySelector('[name="cartonGrossWeight"]').value,
        };
        formData.products.push(product);

    });
    console.log("Collected Order Data:", formData);
    try{
    const response = await fetch("http://localhost:3000/shippingInvoice",{
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
      if(result.message == 'successfully received data!')
      {
        alert('success!');
        window.location.href = "../Invoices/commercial.html";
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
});