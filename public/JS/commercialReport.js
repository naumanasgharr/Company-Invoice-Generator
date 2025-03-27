fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));

fetch('http://localhost:3000/api/commercialInvoiceNumbers',{
    method: 'GET',
    credentials: 'include'
})
.then(response=>response.json())
.then(data=>{
    const select = document.querySelector('#invoiceNum');
    data.forEach(element => {
        const option = document.createElement('option');
        option.innerText = `${element.invoice_number}`;
        option.value = `${element.invoice_number}`;
        select.appendChild(option);
    });

    select.addEventListener('change',()=>{
        const mainDiv = document.querySelector('#mainDiv');
        mainDiv.innerHTML = '';
        if(select.value != '--SELECT--'){
            fetch(`http://localhost:3000/api/commercialOrderBank?invoice_number=${select.value}`,{
                method: 'GET',
                credentials: 'include'
            })
            .then(response=>response.json())
            .then(data=>{
                const invoiceDetails = data.invoiceDetails;
                const articles = data.articles;
                const customerName = data.name;
                const subDiv = document.createElement('div');
                subDiv.className = 'subDiv';
                mainDiv.append(subDiv);
                const headDiv = document.createElement('div');
                headDiv.className = 'head';
                headDiv.innerHTML = `
                    <table id="headTable">
                    <thead id="customerHead">
                        <th colspan="1">NAME</th>
                        <th colspan="1">INVOICE NO</th>
                        <th colspan="1">DATE</th>
                        <th colspan ="1">SHIP DATE</th>
                        <th colspan="1">LOADING PORT</th>
                        <th colspan="1">SHIPPING PORT</th>
                        <th colspan = "1">FI NO</th>
                        <th colspan = "1">FI DATE</th>
                        <th colspan = "1">BL NO</th>
                        <th colspan = "1">BL DATE</th>
                        <th colspan = "1">SHIP TERMS</th>
                        <th colspan = "1">NET WG</th>
                        <th colspan = "1">GROSS WG</th>
                        <th colspan="1">TOTAL</th>    
                    </thead>    
                    <tbody>
                        <tr>
                            <td colspan="1" id="customerName">${customerName.name}</td>
                            <td colspan="1" id="invoiceNumber">${invoiceDetails.invoice_number}</td>
                            <td colspan="1" id="invoiceDate">${invoiceDetails.date}</td>
                            <td colspan="1" id="shippingDate">${invoiceDetails.shipment_date}</td>
                            <td colspan="1" id="loadingPort">${invoiceDetails.loadingPort}</td>
                            <td colspan="1" id="shippingPort">${invoiceDetails.shippingPort}</td>
                            <td colspan = "1">${invoiceDetails.fiNo}</td>
                            <td colspan = "1">${invoiceDetails.fiNoDate}</td>
                            <td colspan = "1">${invoiceDetails.blNo}</td>
                            <td colspan = "1">${invoiceDetails.blNoDate}</td>
                            <td colspan = "1">${invoiceDetails.shipment_terms}</td>
                            <td colspan = "1">${invoiceDetails.total_net_weight}</td>
                            <td colspan = "1">${invoiceDetails.total_gross_weight}</td>
                            <td colspan = "1">${invoiceDetails.total}</td>
                        </tr>
                    </tbody>
                </table>    
                `;
                subDiv.append(headDiv);


                const body = document.createElement('div');
                body.className = 'body';
                const orderTable = document.createElement('table');
                orderTable.className = 'ordersTable';
                orderTable.innerHTML = `
                    <thead id="orderHead">
                        <th>ARTICLE NO</th>
                        <th>DESCRIPTION</th>
                        <th>SIZE</th>
                        <th>AMOUNT</th>
                        <th>UNIT PRICE</th>
                        <th>CARTONS</th>
                        <th>CARTON PACKING</th>
                        <th>CART NET WG</th>
                        <th>CART GROSS WG</th>
                        <th>TOTAL NET WG</th>
                        <th>TOTAL GROSS WG</th>
                        <th>TOTAL</th>
                    </thead>
                `;
                const orderTableBody = document.createElement('tbody');
                articles.forEach(article=>{
                    const row = document.createElement('tr');
                    const total = article.unit_price * (article.carton_packing*article.cartons);
                    const totalNet = article.carton_net_weight * article.cartons;
                    const totalGross = article.carton_gross_weight * article.cartons;
                    row.innerHTML = `
                        <td>${article.article_number}</td>
                        <td>${article.description}</td>
                        <td>${article.size}</td>
                        <td>${article.article_amount}</td>
                        <td>${article.unit_price} ${article.currency}</td>
                        <td>${article.cartons}</td>
                        <td>${article.carton_packing} ${article.carton_packing_unit}</td>
                        <td>${article.carton_net_weight}</td>
                        <td>${article.carton_gross_weight}</td>
                        <td>${totalNet}</td>
                        <td>${totalGross}</td>
                        <td>${total} ${article.currency}</td>
                    `;
                    orderTableBody.appendChild(row);
                });
                orderTable.append(orderTableBody);
                body.append(orderTable);
                subDiv.append(body);



            })
            .catch(error=>console.log(error));


        }
    });
})
.catch(error=>console.log(error));