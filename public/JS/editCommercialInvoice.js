fetch('http://localhost:3000/api/commercialInvoiceNumbers')
.then(response=>response.json())
.then(data=>{
    console.log(data);
    const select = document.querySelector('#invoiceNumber');
    data.forEach(object=>{
        const option = document.createElement('option');
        option.value = object.invoice_number;
        option.textContent = `${object.invoice_number}-${object.name}`;
        select.appendChild(option);
    });
})
.catch(error=>console.log(error));