const tbody = document.getElementById('productTableBody');
fetch("http://localhost:3000/api/productList")
    .then(response=>response.json())
    .then(data=>{
        data.forEach(product => {
            const row = document.createElement('tr');
            ['article_number','name','description','hs_code','size','carton_length','carton_width','carton_height', 'weight'].forEach(key=>{
                const td = document.createElement('td');
                td.innerText = product[key];
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
    })
    .catch(error => console.log('error fetching data,', error));