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
                        const invoiceData = data.invoiceData;
                        const orderData = data.orders;
                       // console.log(orderData);
                      //  console.log(invoiceData);
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
                        invoiceDiv.append(orderDateLabel,orderDateInput,invoiceNumberLabel,invoiceNumberInput,customerIDLabel,customerIDInput);
                        
                         orderData.forEach(order=>{
                            const orderDetails = order.orderDetails;
                            const productRow = document.createElement('div');
                            productRow.className = 'productRow';
                            orderDetails.forEach(orderDetail=>{
                                const productNumberLabel = document.createElement('label');
                                productNumberLabel.htmlFor = 'productNumber';
                                productNumberLabel.innerText = 'Article ID: ';
                                const productNumberInput = document.createElement('input');
                                productNumberInput.name = 'productNumber';
                                productNumberInput.id = 'productNumber';
                                productNumberInput.type = 'text';
                                productNumberInput.value = `${orderDetail.article_number}`;

                                const productAmountLabel = document.createElement('label');
                                productAmountLabel.htmlFor = 'productAmount';
                                productAmountLabel.innerText = 'Article Amount: ';
                                const productAmountInput = document.createElement('input');
                                productAmountInput.name = 'productAmount';
                                productAmountInput.id = 'productAmount';
                                productAmountInput.type = 'text';
                                productAmountInput.value = `${orderDetail.article_amount}`;

                                const unitPriceLabel = document.createElement('label');
                                unitPriceLabel.htmlFor = 'unitPrice';
                                unitPriceLabel.innerText = 'Unit Price : ';
                                const unitPriceInput = document.createElement('input');
                                unitPriceInput.name = 'unitPrice';
                                unitPriceInput.id = 'unitPrice';
                                unitPriceInput.type = 'number';
                                unitPriceInput.min = '0';
                                unitPriceInput.step = '0.01';
                                unitPriceInput.value = `${orderDetail.unit_price}`;

                                const currencyLabel = document.createElement('label');
                                currencyLabel.htmlFor = 'currency';
                                currencyLabel.innerText = 'Currency: ';
                                const currencySelect = document.createElement('select');
                                currencySelect.name = 'currency';
                                currencySelect.className = 'currency';
                                ['USD', 'PKR', 'SAUDI RIYAL', 'UAE DHIRAM'].forEach(currency => {
                                    const option = document.createElement('option');
                                    option.innerText = currency;
                                    currencySelect.appendChild(option);
                                });

                                const orderNumberLabel = document.createElement('label');
                                orderNumberLabel.htmlFor = 'orderNumber';
                                orderNumberLabel.innerText = 'PO Number: ';
                                const orderNumberInput = document.createElement('input');
                                orderNumberInput.name = 'orderNumber';
                                orderNumberInput.id = 'orderNumber';
                                orderNumberInput.type = 'text';
                                orderNumberInput.value = `${orderDetail.order_number}`;

                                productRow.append(productNumberLabel,productNumberInput,productAmountLabel,productAmountInput,unitPriceLabel,unitPriceInput,currencyLabel,currencySelect,orderNumberLabel,orderNumberInput);
                                productDiv.appendChild(productRow);
                            });
                            
                         });



                        editForm.appendChild(invoiceDiv);
                        editForm.appendChild(productDiv); 
                        mainDiv.appendChild(editForm);

                }).catch(error => console.error('Error fetching customer data:', error));
            }
    });
}).catch(error => console.error('Error fetching customer data:', error));


