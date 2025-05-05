fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));


fetch('http://localhost:3000/api/productIds',{
    method: 'GET',
    credentials: 'include'
})
.then(response=>response.json())
.then(data=>{
    console.log(data);
    const select = document.querySelector('#productID');
    data.forEach(obj=>{
        const option = document.createElement('option');
        option.textContent = `${obj.id} - ${obj.description}`;
        option.value = obj.id;
        select.append(option);
    });
    select.addEventListener('change',()=>{
        if(select.value != '--SELECT--'){
            fetch(`http://localhost:3000/api/productDetails?id=${select.value}`,{
                method: 'GET',
                credentials: 'include'
            })
            .then(response=>response.json())
            .then(data=>{
                console.log(data);
                document.querySelector('#productName').value = data[0].category;
                document.querySelector('#prodDesc').value = data[0].description;
                document.querySelector('#materialComposition').value = data[0].material_composition;
                document.querySelector('#productWeight').value = data[0].weight;
                document.querySelector('#productSize').value = data[0].size;
                document.querySelector('#unitPacking').value = data[0].unit_packing;
                document.querySelector('#cartonPacking').value = data[0].carton_packing;
                document.querySelector('#cartonLength').value = data[0].carton_length;
                document.querySelector('#cartonWidth').value = data[0].carton_width;
                document.querySelector('#cartonHeight').value = data[0].carton_height;
                document.querySelector('#productCode').value = data[0].hs_code;



                switch(data[0].carton_packing_type){
                    case 'Dzn':    
                        document.querySelector('#cartonPackingType').innerHTML = `
                        <option>Dzn</option><option>Prs</option><option>Pcs</option>
                        `;
                        break;
                    case 'Prs':
                        document.querySelector('#cartonPackingType').innerHTML = `
                        <option>Prs</option><option>Dzn</option><option>Pcs</option>
                        `;
                        break;
                    case 'Pcs':
                        document.querySelector('#cartonPackingType').innerHTML = `
                        <option>Pcs</option><option>Dzn</option><option>Prs</option>
                        `;
                        break;
                    default:
                        document.querySelector('#cartonPackingType').innerHTML = `
                        <option>Dzn</option><option>Prs</option><option>Pcs</option>
                        `;
                        break;
                }
                switch(data[0].unit_packing_type){
                    case 'Dzn':    
                        document.querySelector('#unitPackingType').innerHTML = `
                        <option>Dzn</option><option>Prs</option><option>Pcs</option>
                        `;
                        break;
                    case 'Prs':
                        document.querySelector('#unitPackingType').innerHTML = `
                        <option>Prs</option><option>Dzn</option><option>Pcs</option>
                        `;
                        break;
                    case 'Pcs':
                        document.querySelector('#unitPackingType').innerHTML = `
                        <option>Pcs</option><option>Dzn</option><option>Prs</option>
                        `;
                        break;
                    default:
                        document.querySelector('#unitPackingType').innerHTML = `
                        <option>Dzn</option><option>Prs</option><option>Pcs</option>
                        `;
                        break;
                }    
                switch(data[0].weight_packing_type){
                    case 'Dzn':    
                        document.querySelector('#weightPackingType').innerHTML = `
                        <option>Dzn</option><option>Prs</option><option>Pcs</option>
                        `;
                        break;
                    case 'Prs':
                        document.querySelector('#weightPackingType').innerHTML = `
                        <option>Prs</option><option>Dzn</option><option>Pcs</option>
                        `;
                        break;
                    case 'Pcs':
                        document.querySelector('#weightPackingType').innerHTML = `
                        <option>Pcs</option><option>Dzn</option><option>Prs</option>
                        `;
                        break;
                    default:
                        document.querySelector('#weightPackingType').innerHTML = `
                        <option>Dzn</option><option>Prs</option><option>Pcs</option>
                        `;
                        break;
                }
                switch(data[0].weight_units){
                    case 'gram':    
                        document.querySelector('#weightUnit').innerHTML = `
                        <option>gram</option><option>kilogram</option>
                        `;
                        break;
                    case 'kilogram':
                        document.querySelector('#weightUnit').innerHTML = `
                        <option>kilogram</option><option>gram</option>
                        `;
                        break;
                    default:
                        document.querySelector('#weightUnit').innerHTML = `
                        <option>gram</option><option>kilogram</option>
                        `;
                        break;
                }
                
            })
            .catch(error=>console.log(error));
        }
    });
})
.catch(error=>console.log(error));

document.querySelector('#form').addEventListener('submit', async function (event){
    event.preventDefault();
    const formData = {
        productID: document.querySelector('#productID').value,
        category: document.querySelector('#productName').value,
        desc: document.querySelector('#prodDesc').value,
        materialComp: document.querySelector('#materialComposition').value,
        weight: document.querySelector('#productWeight').value,
        weightUnit: document.querySelector('#weightUnit').value,
        weightPackingType: document.querySelector('#weightPackingType').value,
        size: document.querySelector('#productSize').value,
        unitPacking: document.querySelector('#unitPacking').value,
        unitPackingType: document.querySelector('#unitPackingType').value,
        cartonPacking: document.querySelector('#cartonPacking').value,
        cartonPackingType: document.querySelector('#cartonPackingType').value,
        code: document.querySelector('#productCode').value,
        cartonLength: document.querySelector('#cartonLength').value,
        cartonWidth: document.querySelector('#cartonWidth').value,
        cartonHeight: document.querySelector('#cartonHeight').value
    }
    try{
        const response = await fetch('http://localhost:3000/saveEditProduct',{
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        if(response.ok){
            const result = await response.json();
            if(result.message){
                alert(result.message);
            }else{
                alert('failure');
            }
        }
    }
    catch(error){
        console.log(error);
        alert(error.message);
    }
});
