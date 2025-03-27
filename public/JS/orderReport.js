fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));


fetch('http://localhost:3000/api/selectInvoice',{
    method: 'GET',
    credentials: 'include'
})
.then(response=>response.json())
.then(data=>{
    const invoiceNumberSelect = document.querySelector('#invoiceNumberSelect');
    console.log(data);
    data.forEach(obj=>{
        const option = document.createElement('option');
        option.textContent = `${obj.invoice_number} - ${obj.name}`;
        option.value = `${obj.invoice_number}`;
        invoiceNumberSelect.append(option);
    });
    invoiceNumberSelect.addEventListener('change',()=>{
        document.querySelector('#mainDiv').innerHTML = ``;
        if(invoiceNumberSelect.value != '--SELECT--') {
            fetch(`http://localhost:3000/api/orderList?invoice_number=${invoiceNumberSelect.value}`,{
                method: 'GET',
                credentials: 'include'
            })
            .then(response=>response.json())
            .then(data=>{
                console.log(data);
                const invoice = data.invoice;
                const orders = data.orders;
                const div = document.getElementById('mainDiv');
                const subDiv = document.createElement('div');
                subDiv.className = 'subDiv';
                const headDiv = document.createElement('div');
                headDiv.className = 'head';
                headDiv.innerHTML = `
                    <table id="headTable">
                    <thead id="customerHead">
                        <th colspan="1">ID</th>
                        <th colspan="1">NAME</th>
                        <th colspan="1">INVOICE NO</th>
                        <th colspan="1">INVOICE DATE</th>
                        <th colspan ="1">SHIP DATE</th>
                        <th colspan="1">LOADING PORT</th>
                        <th colspan="1">SHIPPING PORT</th>
                        <th colspan="1">INVOICE TOTAL</th>    
                    </thead>    
                    <tbody>
                        <tr>
                            <td colspan="1" id="customerID">${invoice.customer_id}</td>
                            <td colspan="1" id="customerName">${invoice.customer_name}</td>
                            <td colspan="1" id="invoiceNumber">${invoiceNumberSelect.value}</td>
                            <td colspan="1" id="invoiceDate">${invoice.order_date}</td>
                            <td colspan="1" id="shippingDate">${invoice.shipping_date}</td>
                            <td colspan="1" id="loadingPort">${invoice.loading_port}</td>
                            <td colspan="1" id="shippingPort">${invoice.shipping_port}</td>
                            <td colspan="1" id="invoiceTotal">${invoice.total} ${orders[0].details[0].currency}</td>
                        </tr>
                    </tbody>
                </table>    
                `;

                const mainDiv = document.createElement('div');
                mainDiv.className = 'main';
                orders.forEach(order=>{
                    const details = order.details;
                    const orderDisplayTable = document.createElement('table');
                    orderDisplayTable.className = 'orderDisplay';
                    orderDisplayTable.innerHTML=`
                        <tr>
                            <th>ORDER NO</th>
                            <td id="orderNumber">${order.order_number}</td>
                        </tr>
                    `;
                    mainDiv.appendChild(orderDisplayTable);
                    const orderTable = document.createElement('table');
                    orderTable.className = 'ordersTable';
                    orderTable.innerHTML = `
                        <thead id="orderHead">
                            <th>ARTICLE NO</th>
                            <th>ARTICLE CATEGORY</th>
                            <th>ARTICLE SIZE</th>
                            <th>AMOUNT</th>
                            <th>UNIT PRICE</th>
                            <th>CURRENCY</th>
                            <th>TOTAL</th>
                            <th>STATUS</th>
                        </thead>
                    `;
                    const orderTableBody = document.createElement('tbody');
                    details.forEach(detail=>{
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td id = "articleNo">${detail.article_number}</td>
                            <td id = "articleName">${detail.category}</td>
                            <td id = "articleSize">${detail.size}</td>
                            <td id = "articleAmount">${detail.article_amount}</td>
                            <td id = "articleUnitPrice">${detail.unit_price}</td>
                            <td id = "articleCurrency">${detail.currency}</td>
                            <td id = "articleTotal">${((detail.article_amount)*(detail.unit_price)).toFixed(2)} ${detail.currency}</td>
                            <td id="status" style=" background-color: #DCD7C9;color: ${detail.status === 'COMPLETED' ? '#1F7D53' : '#D84040'};font-weight: bold;">${detail.status}</td>
                        `;
                        orderTableBody.appendChild(row);
                    });
                    orderTable.appendChild(orderTableBody);
                    mainDiv.appendChild(orderTable);
                });
                subDiv.appendChild(headDiv);
                subDiv.appendChild(mainDiv);
                div.appendChild(subDiv);
            })
            .catch(error=>console.log(error));
        }
    });
})
.catch(error=>console.log(error));