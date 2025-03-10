fetch('http://localhost:3000/api/commercialInvoice')
.then(response=>response.json())
.then(data=>{
    console.log(data);

    //invoice Details
    document.querySelector('#invoiceNumber').textContent = data.invoiceData.invoiceNumber;
    document.querySelector('#date').textContent = data.invoiceData.invoiceDate;
    document.querySelector('#customerName').textContent = data.customer.name;
    document.querySelector('#customerAddress').textContent = `${data.customer.address},PO- ${data.customer.address},${data.customer.country} `;
    document.querySelector('#fiNo').innerHTML =`<strong>FI NO:</strong> ${data.invoiceData.fiNo}`;
    document.querySelector('#shipmentTerms').innerHTML = `<strong>Shipment Terms: ${data.invoiceData.shipmentTerms}`;
    document.querySelector('#fiNoDate').textContent = data.invoiceData.fiNoDate;
    document.querySelector('#blNo').innerHTML = `<strong>BL NO:</strong> ${data.invoiceData.blNo}`;
    document.querySelector('#blNoDate').textContent = data.invoiceData.blNoDate;
    document.querySelector('#shipmentFrom').textContent = data.invoiceData.loadingPort;
    document.querySelector('#shipmentDestination').textContent = data.invoiceData.shippingPort;
    document.querySelector('#shipmentDate').textContent = data.invoiceData.shipmentDate;

    //product details
    const productCategory = [];
    data.products.forEach(product=>{
        if(!productCategory.includes(product.category)){
            productCategory.push(product.category);
        }
    });
    let cartonNumber = 1;
    let total = 0;
    productCategory.forEach(category=>{
        const table = document.querySelector('.dynamicTableBody');
        const categoryRow = document.createElement('tr');
        categoryRow.innerHTML = `
            <td></td>
            <td style='text-align:center; text-decoration: underline;'><strong>${category}</strong></td>
            <td></td>
            <td></td>
            <td></td>
        `;
        table.appendChild(categoryRow);

        data.products.forEach(product=>{
            if(product.category == category){
                const row = document.createElement('tr');
                const amount = product.cartons*product.cartonPacking;
                row.innerHTML = `
                    <td>${cartonNumber} - ${product.cartons}</td>
                    <td>${product.cartons} CTN ${amount} ${product.cartonPackingUnit} ${product.description}</td>
                    <td>${amount}</td>
                    <td>${product.unitPrice} ${product.currency}</td>
                    <td>${amount*product.unitPrice} ${product.currency}</td>
                `;
                cartonNumber = Number(product.cartons) + 1;
                total += (amount*product.unitPrice);
                table.appendChild(row);
            } 
        });

    });  
    document.querySelector('#totalValue').innerHTML = `<strong>TOTAL:</strong> ${total} ${data.products[0].currency}`;


})
.catch(error=>console.log(error));


document.querySelector('#saveButton').addEventListener('click',()=>{
    fetch('http://localhost:3000/SaveCommercialInvoice')
    .then(response=>response.json())
    .then(data=>{
        alert(data.message);
    })
    .catch(error=>console.log(error));
});