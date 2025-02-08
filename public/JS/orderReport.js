fetch("http://localhost:3000/api/orderList")
    .then(response=>response.json())
    .then(data=>{
        data.forEach(element => {
            const div = document.getElementById('headDiv');
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
                        <td colspan="1" id="customerID">${element.customer_id}</td>
                        <td colspan="1" id="customerName">JOHN DOE</td>
                        <td colspan="1" id="invoiceNumber">${element.invoice_number}</td>
                        <td colspan="1" id="invoiceDate">${element.order_date}</td>
                        <td colspan="1" id="shippingDate">${element.shipping_date}</td>
                        <td colspan="1" id="loadingPort">${element.loading_port}</td>
                        <td colspan="1" id="shippingPort">${element.shipping_port}</td>
                        <td colspan="1" id="invoiceTotal">${element.total}$</td>
                    </tr>
                </tbody>
            </table>    
            `;
            div.appendChild(headDiv);
        });
    })
    .catch(error => console.log('error fetching data,', error));