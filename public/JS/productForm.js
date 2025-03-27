fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));


const tbody = document.getElementById('productTableBody');
fetch("http://localhost:3000/api/productCategoryGet",{
    method: 'GET',
    credentials: 'include'
})
    .then(response=>response.json())
    .then(data=>{
        data.forEach(category=>{
            console.log();
            const select = document.getElementById('productName');
            const option = document.createElement('option');
            option.innerText = category.product_category;
            select.appendChild(option);
        });
        fetch("http://localhost:3000/api/productList",{
            method: 'GET',
            credentials: 'include'
        })
        .then(response=>response.json())
        .then(data=>{
            data.forEach(product => {
                const row = document.createElement('tr');
                ['id','category','description','material_composition','hs_code','size','unit_packing','unit_packing_type','carton_packing','carton_packing_type','carton_length','carton_width','carton_height', 'weight','weight_units','weight_packing_type',].forEach(key=>{
                    const td = document.createElement('td');
                    td.innerText = product[key];
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
        })
        .catch(error => console.log('error fetching data,', error));
    })
.catch(error => console.log('error fetching data,', error))
    