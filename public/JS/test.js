fetch('http://localhost:3000/api/customerNames')
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
            fetch(`http://localhost:3000/api/articleNumbersAndNamesForShipmentInvoice?customerId=${customerNameSelect.value}`)
            .then(response=>response.json())
            .then(data=>{
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
                        fetch(`http://localhost:3000/api/invoiceAndOrderNumbers?articleNumber=${articleNumberSelect.value}`)
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

