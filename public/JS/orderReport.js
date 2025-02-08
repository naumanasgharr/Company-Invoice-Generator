fetch("http://localhost:3000/api/orderList")
    .then(response=>response.json())
    .then(data=>{
        console.log(data);
        data.forEach(invoice => {
            const orders = invoice.orders;
           // const products = articles.product;
            const div = document.getElementById('mainDiv');
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
                        <td colspan="1" id="customerID">${invoice.customer.id}</td>
                        <td colspan="1" id="customerName">${invoice.customer.name}</td>
                        <td colspan="1" id="invoiceNumber">${invoice.invoice_number}</td>
                        <td colspan="1" id="invoiceDate">${invoice.order_date}</td>
                        <td colspan="1" id="shippingDate">${invoice.shipping_date}</td>
                        <td colspan="1" id="loadingPort">${invoice.loading_port}</td>
                        <td colspan="1" id="shippingPort">${invoice.shipping_port}</td>
                        <td colspan="1" id="invoiceTotal">${invoice.total}$</td>
                    </tr>
                </tbody>
            </table>    
            `;

            const mainDiv = document.createElement('div');
            mainDiv.className = 'main';
            orders.forEach(order=>{
                const articles = order.articles;
                const orderDisplayTable = document.createElement('table');
                orderDisplayTable.className = 'orderDisplay';
                orderDisplayTable.innerHTML=`
                    <tr>
                        <th style="padding: 2px; height: 10px; text-align: center; background-color: #070F2B; color: white; font-size: 10px;">ORDER NO</th>
                        <td id="orderNumber">${order.order_number}</td>
                    </tr>
                `;
                mainDiv.appendChild(orderDisplayTable);
                const orderTable = document.createElement('table');
                orderTable.className = 'ordersTable';
                orderTable.innerHTML = `
                    <thead id="orderHead">
                        <th>ARTICLE NO</th>
                        <th>ARTICLE NAME</th>
                        <th>ARTICLE SIZE</th>
                        <th>AMOUNT</th>
                        <th>UNIT PRICE</th>
                        <th>CURRENCY</th>
                        <th>TOTAL</th>
                    </thead>
                `;
                const orderTableBody = document.createElement('tbody');
                articles.forEach(article=>{
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td id = "articleNo">${article.article_number}</td>
                        <td id = "articleName">${article.product.name}</td>
                        <td id = "articleSize">${article.product.size}</td>
                        <td id = "articleAmount">${article.article_amount}</td>
                        <td id = "articleUnitPrice">${article.unit_price}</td>
                        <td id = "articleCurrency">${article.currency}</td>
                        <td id = "articleTotal">${(article.article_amount)*(article.unit_price)} ${article.currency}</td>
                    `;
                    orderTableBody.appendChild(row);
                });
                orderTable.appendChild(orderTableBody);
                mainDiv.appendChild(orderTable);
            });
            
            div.appendChild(headDiv);
            div.appendChild(mainDiv);
        });
    }).catch(error => console.log('error fetching data,', error));