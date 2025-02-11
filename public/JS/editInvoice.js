let originalData = {};
fetch("http://localhost:3000/api/selectInvoice")
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
            const selectedInvoice = this.value;
            const mainDiv = document.querySelector('.form');
            mainDiv.innerHTML = '';
            if(selectedInvoice != 'select'){
                fetch(`http://localhost:3000/api/invoiceDetails?invoice_number=${selectedInvoice}`)
                    .then(response=>response.json())
                    .then(data=>{
                        originalData = JSON.parse(JSON.stringify(data));
                        const invoiceData = data.invoiceData;
                        const orderData = data.orders;
                        const editForm = document.createElement('form');
                        editForm.name = 'editForm';
                        editForm.id = 'editForm';
                        editForm.action = '#';
                        editForm.method = 'POST';
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

                        //generating customer ID input
                        const customerIDLabel = document.createElement('label');
                        customerIDLabel.htmlFor = 'customerID';
                        customerIDLabel.innerText = 'Customer ID: ';
                        const customerIDInput = document.createElement('input');
                        customerIDInput.name = 'customerID';
                        customerIDInput.id = 'customerID';
                        customerIDInput.type = 'text';
                        customerIDInput.value = `${invoiceData.customer_id}`;
                        invoiceDiv.append(orderDateLabel,orderDateInput,invoiceNumberLabel,invoiceNumberInput,customerIDLabel,customerIDInput);
                        
                        orderData.forEach((order,index)=>{
                            const orderDetails = order.orderDetails;
                            const productRow = document.createElement('div');
                            productRow.className = 'productRow';
                            orderDetails.forEach(orderDetail=>{
                                const productNumberLabel = document.createElement('label');
                                productNumberLabel.htmlFor = 'productNumber';
                                productNumberLabel.innerText = 'Article ID: ';
                                const productNumberInput = document.createElement('input');
                                productNumberInput.name = `productNumber[${index}]`;
                                productNumberInput.className = 'productNumber';
                                productNumberInput.type = 'text';
                                productNumberInput.value = `${orderDetail.article_number}`;

                                const productAmountLabel = document.createElement('label');
                                productAmountLabel.htmlFor = 'productAmount';
                                productAmountLabel.innerText = 'Article Amount: ';
                                const productAmountInput = document.createElement('input');
                                productAmountInput.name = `productAmount[${index}]`;
                                productAmountInput.className = 'productAmount';
                                productAmountInput.type = 'text';
                                productAmountInput.value = `${orderDetail.article_amount}`;

                                const unitPriceLabel = document.createElement('label');
                                unitPriceLabel.htmlFor = 'unitPrice';
                                unitPriceLabel.innerText = 'Unit Price : ';
                                const unitPriceInput = document.createElement('input');
                                unitPriceInput.name = `unitPrice[${index}]`;
                                unitPriceInput.className = 'unitPrice';
                                unitPriceInput.type = 'number';
                                unitPriceInput.min = '0';
                                unitPriceInput.step = '0.01';
                                unitPriceInput.value = `${orderDetail.unit_price}`;

                                const currencyLabel = document.createElement('label');
                                currencyLabel.htmlFor = 'currency';
                                currencyLabel.innerText = 'Currency: ';
                                const currencySelect = document.createElement('select');
                                currencySelect.name = `currency[${index}]`;
                                currencySelect.className = 'currency';
                                ['USD', 'PKR', 'SAUDI RIYAL', 'UAE DHIRAM'].forEach(currency => {
                                    const option = document.createElement('option');
                                    option.innerText = currency;
                                    currencySelect.appendChild(option);
                                });
                                currencySelect.value = `${orderDetail.currency}`;

                                const orderNumberLabel = document.createElement('label');
                                orderNumberLabel.htmlFor = 'orderNumber';
                                orderNumberLabel.innerText = 'PO Number: ';
                                const orderNumberInput = document.createElement('input');
                                orderNumberInput.name = `orderNumber[${index}]`;
                                orderNumberInput.className = 'orderNumber';
                                orderNumberInput.type = 'text';
                                orderNumberInput.value = `${orderDetail.order_number}`;

                                productRow.append(productNumberLabel,productNumberInput,productAmountLabel,productAmountInput,unitPriceLabel,unitPriceInput,currencyLabel,currencySelect,orderNumberLabel,orderNumberInput);
                                productDiv.appendChild(productRow);
                            });
                            
                        });

                        const shipmentDateLabel = document.createElement('label');
                        shipmentDateLabel.htmlFor = 'shippingDate';
                        shipmentDateLabel.innerText = 'shipping Date: ';
                        const shipmentDateInput = document.createElement('input');
                        shipmentDateInput.name = `shippingDate`;
                        shipmentDateInput.className = 'shippingDate';
                        shipmentDateInput.type = 'date';
                        shipmentDateInput.value = `${invoiceData.shipping_date}`;

                        const shipmentPortLabel = document.createElement('label');
                        shipmentPortLabel.htmlFor = 'shippingPort';
                        shipmentPortLabel.innerText = 'shipping Port: ';
                        const shipmentPortInput = document.createElement('input');
                        shipmentPortInput.name = `shippingPort`;
                        shipmentPortInput.className = 'shippingPort';
                        shipmentPortInput.type = 'text';
                        shipmentPortInput.value = `${invoiceData.shipping_port}`;

                        const loadingPortLabel = document.createElement('label');
                        loadingPortLabel.htmlFor = 'loadingPort';
                        loadingPortLabel.innerText = 'Loading Port: ';
                        const loadingPortInput = document.createElement('input');
                        loadingPortInput.name = `loadingPort`;
                        loadingPortInput.className = 'loadingPort';
                        loadingPortInput.type = 'text';
                        loadingPortInput.value = `${invoiceData.loading_port}`;



                        const buttonDiv = document.createElement('div');
                        buttonDiv.className = 'button';
                        buttonDiv.innerHTML =  `
                            <button id="save" type="submit">Save</button>
                        `;

                        editForm.appendChild(invoiceDiv);
                        editForm.appendChild(productDiv); 
                        editForm.append(shipmentDateLabel,shipmentDateInput,shipmentPortLabel,shipmentPortInput,loadingPortLabel,loadingPortInput);
                        editForm.appendChild(buttonDiv);
                        
                        mainDiv.appendChild(editForm);

                        editForm.addEventListener("submit", handleSubmit);
                    })
                .catch(error => console.error('Error fetching customer data:', error));
            }
        });
    })
.catch(error => console.error('Error fetching customer data:', error));



async function handleSubmit(event) {
    event.preventDefault(); // Prevents page reload

    const formData = new FormData(event.target);
    let newData = {};

    formData.forEach((value, key) => {
        if (key.includes("[")) {
            let baseKey = key.split("[")[0]; // Extract field name (e.g., "productNumber")
            if (!newData[baseKey]) newData[baseKey] = []; // Initialize as array if not already
            newData[baseKey].push(value);
        } else {
            newData[key] = value;
        }
    });

    const payload = {
        old: originalData,
        new: newData
    };

    // Send data to the server
    try {
        const response = await fetch("/editPerformaInvoice", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) {
            alert("Error: " + result.error);
        } else {
            alert(result.message);
        }
        console.log("Server Response:", result);
    } catch (error) {
        console.error("Error submitting form:", error);
    }
}




/*document.getElementById("editForm").addEventListener("submit",async function(event) {
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    const response = await fetch("/editPerformaInvoice",{
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    
    const result = await response.text();
    console.log(result);
});*/

