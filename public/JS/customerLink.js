fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));

const product_select = document.querySelector('#productNumber');
product_select.addEventListener('change',()=>{
    document.querySelector('#details').hidden = true;

    if(product_select.value != '--SELECT--'){
        document.querySelector('#details').hidden = false;
        fetch(`http://localhost:3000/customerArticleProductDetails?product_id=${product_select.value}`,{
            method: 'GET',
            credentials: 'include'
        })
        .then(response=>response.json())
        .then(data=>{
            console.log(data);
            const details = data[0];
            document.querySelector('#hs_code').value = details.hs_code;
            document.querySelector('#unit_packing').value = details.unit_packing;
            document.querySelector('#carton_packing').value = details.carton_packing;
            document.querySelector('#carton_length').value = details.carton_length;
            document.querySelector('#carton_width').value = details.carton_width;
            document.querySelector('#carton_height').value = details.carton_height;
            document.querySelector('#description').value = details.description;

            switch(details.carton_packing_type){
                case 'Pcs':
                    document.querySelector('#carton_packing_type').innerHTML = `
                        <option>Pcs</option><option>Dzn</option><option>Prs</option>
                    `;
                    break;
                case 'Prs':
                    document.querySelector('#carton_packing_type').innerHTML = `
                        <option>Prs</option><option>Dzn</option><option>Pcs</option>
                    `;
                    break;
                case 'Dzn':
                    document.querySelector('#carton_packing_type').innerHTML = `
                        <option>Dzn</option><option>Pcs</option><option>Prs</option>
                    `;
                    break;
                default:
                    document.querySelector('#carton_packing_type').innerHTML = `
                        <option>Dzn</option><option>Pcs</option><option>Prs</option>
                    `;
                    break;
            }
            switch(details.unit_packing_type){
                case 'Pcs':
                    document.querySelector('#unit_packing_type').innerHTML = `
                        <option>Pcs</option><option>Dzn</option><option>Prs</option>
                    `;
                    break;
                case 'Prs':
                    document.querySelector('#unit_packing_type').innerHTML = `
                        <option>Prs</option><option>Dzn</option><option>Pcs</option>
                    `;
                    break;
                case 'Dzn':
                    document.querySelector('#unit_packing_type').innerHTML = `
                        <option>Dzn</option><option>Pcs</option><option>Prs</option>
                    `;
                    break;
                default:
                    document.querySelector('#unit_packing_type').innerHTML = `
                        <option>Dzn</option><option>Pcs</option><option>Prs</option>
                    `;
                    break;
            }
        })
        .catch(error=>console.log(error));
    }
    
});