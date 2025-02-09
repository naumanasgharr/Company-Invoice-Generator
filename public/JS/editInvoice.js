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
            if(selectedInvoice != 'select'){
                fetch(`http://localhost:3000/api/invoiceDetails?invoice_number=${selectedInvoice}`)
                    .then(response=>response.json())
                    .then(data=>{
                        const invoiceData = data.invoiceData;
                        console.log(invoiceData);
                       // console.log(orderData);
                        const editForm = document.createElement('form');
                        editForm.name = 'editForm';
                        editForm.action = '/EditPerformaInvoice';
                        editForm.method = 'put';
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

                        // appending labels , inputs, and div
                        invoiceDiv.append(orderDateLabel,orderDateInput,invoiceNumberLabel,invoiceNumberInput,customerIDLabel,customerIDInput);
                        editForm.appendChild(invoiceDiv);
                        // document.body.appendChild(editForm);
                        
                        const mainDiv = document.querySelector('.form');
                        editForm.appendChild(productDiv); 
                        mainDiv.appendChild(editForm);

                }).catch(error => console.error('Error fetching customer data:', error));
            }
    });
}).catch(error => console.error('Error fetching customer data:', error));


