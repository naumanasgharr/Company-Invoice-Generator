const tBody = document.querySelector("#customerTableBody");
fetch('http://localhost:3000/api/customerReport')
    .then(response => response.json())
    .then(data=>{
        data.forEach(customer => {
            const row = document.createElement('tr');
            ['id','name','phone_number','email','address','country','VAT_number','office_number','website','PO_box'].forEach(key=>{
                const td = document.createElement('td');
                td.textContent = customer[key];
                row.appendChild(td);
            });
            tBody.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching customer data:', error));
    
