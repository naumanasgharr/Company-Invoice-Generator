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
        const cartonPackingInput = document.querySelector('#cartonPackingInput');
        const cartonPackingUnit = document.querySelector('#cartonPackingUnits');
        const addButton = document.querySelector('#addButton');
        const cartonsValueLabel = document.querySelector('#cartonsValueLabel');
        const cartonsValueInput = document.querySelector('#cartonsValueInput');
        //orderNumberSelect.innerHTML = '';
        orderNumberSelect.hidden = true;
        cartonsValueLabel.hidden = true;
        cartonsValueInput.hidden = true;
        addButton.hidden = true;
        cartonPackingUnit.hidden = true;
        cartonPackingInput.hidden = true;
        cartonPackingLabel.hidden = true;
        const articleNumberSelect = document.querySelector('#articleNumbers');
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
                    const cartonPackingInput = document.querySelector('#cartonPackingInput');
                    const cartonPackingUnit = document.querySelector('#cartonPackingUnits');
                    const addButton = document.querySelector('#addButton');
                    const cartonsValueLabel = document.querySelector('#cartonsValueLabel');
                    const cartonsValueInput = document.querySelector('#cartonsValueInput');
                    cartonsValueLabel.hidden = true;
                    cartonsValueInput.hidden = true;
                    addButton.hidden = true;
                    cartonPackingUnit.hidden = true;
                    cartonPackingInput.hidden = true;
                    cartonPackingLabel.hidden = true;
                    const orderNumberSelect = document.querySelector('#order-invoiceNumbers');
                    orderNumberSelect.hidden = true;
                    const displayDiv = document.querySelector('#display');
                    displayDiv.innerHTML = '';
                    orderNumberSelect.innerHTML = '';
                    //const selectOption = document.createElement('option');
                    //selectOption.innerText = '--SELECT--';
                    //orderNumberSelect.appendChild(selectOption);
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

function handleOrderNumberChange() {
    const orderNumberSelect = document.querySelector('#order-invoiceNumbers');
    const articleNumberSelect = document.querySelector('#articleNumbers');
    const displayDiv = document.querySelector('#display');
    const cartonPackingLabel = document.querySelector('#cartonPackingLabel');
    const cartonPackingInput = document.querySelector('#cartonPackingInput');
    const cartonPackingUnit = document.querySelector('#cartonPackingUnits');
    const cartonsValueLabel = document.querySelector('#cartonsValueLabel');
    const cartonsValueInput = document.querySelector('#cartonsValueInput');
    const addButton = document.querySelector('#addButton');
    cartonPackingLabel.hidden = true;
    cartonsValueInput.hidden = true;
    addButton.hidden = true;
    cartonPackingInput.hidden = true;
    cartonPackingLabel.hidden = true;
    cartonPackingUnit.hidden = true;

    displayDiv.innerHTML = ''; 

    if (orderNumberSelect.value != '--SELECT--') {
        fetch(`http://localhost:3000/api/orderDetailsShippingInvoiceDisplay?order_id=${orderNumberSelect.value}&article_id=${articleNumberSelect.value}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const articleAmountLabel = document.createElement('label');
                articleAmountLabel.htmlFor = 'articleAmount';
                articleAmountLabel.innerText = `ARTICLE AMOUNT FOR ${data[0].article_number}:`;
                const articleAmountinput = document.createElement('input');
                articleAmountinput.name = 'articleAmount';
                articleAmountinput.disabled = true;
                articleAmountinput.value = `${data[0].article_amount}-${data[0].carton_packing_type}`;

                const balanceLabel = document.createElement('label');
                balanceLabel.htmlFor = 'balance';
                balanceLabel.innerText = `BALANCE AMOUNT:`;
                const balanceInput = document.createElement('input');
                balanceInput.name = 'balance';
                balanceInput.disabled = true;
                balanceInput.value = `${data[0].balance}-${data[0].carton_packing_type}`;
                cartonPackingInput.value = `${data[0].carton_packing}`;

                switch(data[0].carton_packing_type){
                    case 'pcs':
                        cartonPackingUnit.innerHTML =`<option>${data[0].carton_packing_type}</option><option>prs</option><option>dzn</option>`;
                        break;
                    case 'prs':
                        cartonPackingUnit.innerHTML =`<option>${data[0].carton_packing_type}</option><option>pcs</option><option>dzn</option>`;
                        break;
                    case 'dzn':
                        cartonPackingUnit.innerHTML =`<option>${data[0].carton_packing_type}</option><option>pcs</option><option>prs</option>`;        
                        break;
                    default:
                        cartonPackingUnit.innerHTML =`<option>pcs</option><option>prs</option><option>dzn</option>`;
                        break;
                }

                cartonPackingInput.hidden = false;
                cartonPackingLabel.hidden = false;
                cartonPackingUnit.hidden = false;
                cartonsValueLabel.hidden = false;
                cartonsValueInput.hidden = false;
                addButton.hidden = false;



                displayDiv.append(articleAmountLabel, articleAmountinput, balanceLabel, balanceInput);
            })
            .catch(error => console.log(error));
    }
}

document.querySelector('#addButton').addEventListener('click',()=>{
    const subDiv = document.querySelector('#subDiv');
    const productDiv = document.createElement('div');
    productDiv.id = 'productDiv';
    const mainDiv = document.querySelector('#mainDiv');
    
    const header = document.createElement('h5');
    const selectedOptionText = mainDiv.querySelector('#articleNumbers').options[mainDiv.querySelector('#articleNumbers').selectedIndex].innerText;
    header.innerHTML = `<br>${selectedOptionText}`;
    
    const articleIdInput = document.createElement('input');
    articleIdInput.disabled = true;
    articleIdInput.hidden = true;
    articleIdInput.value = mainDiv.querySelector('#articleNumbers').value;
    articleIdInput.name = 'articleId';

    const orderIdInput = document.createElement('input');
    orderIdInput.disabled = true;
    orderIdInput.hidden = true;
    orderIdInput.value = mainDiv.querySelector('#order-invoiceNumbers').value;
    orderIdInput.name = 'orderId';

    const cartons = document.createElement('input');
    cartons.disabled = true;
    cartons.value = mainDiv.querySelector('#cartonsValueInput').value;
    cartons.name = 'cartons';

    const cartonPacking = document.createElement('input');
    cartonPacking.disabled = true;
    cartonPacking.value = mainDiv.querySelector('#cartonPackingInput').value;
    cartonPacking.name = 'cartonPacking';

    const cartonPackingUnit = document.createElement('input');
    cartonPackingUnit.disabled = true;
    cartonPackingUnit.value = mainDiv.querySelector('#cartonPackingUnits').value;
    cartonPackingUnit.name = 'cartonPackingUnit';

    const removeButton = document.createElement('button');
    removeButton.id = 'removeProductButton';
    removeButton.innerText = 'Remove';
    removeButton.addEventListener('click',()=>{
        productDiv.remove();
    });

    productDiv.append(header, articleIdInput, orderIdInput, cartons, cartonPacking, cartonPackingUnit, removeButton);
    
    subDiv.appendChild(productDiv);
});
