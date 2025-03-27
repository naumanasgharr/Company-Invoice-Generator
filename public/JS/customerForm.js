fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));



const tBody = document.querySelector("#customerTableBody");
fetch('http://localhost:3000/api/customerReport',{
    method: 'GET',
    credentials: 'include'
})
    .then(response => response.json())
    .then(data=>{
        data.forEach(customer => {
            console.log(customer);
            const row = document.createElement('tr');
            ['id','name','phone_number','email','address','country','VAT_number','office_number','website','PO_box','shipping_port'].forEach(key=>{
                const td = document.createElement('td');
                td.textContent = customer[key];
                row.appendChild(td);
            });
            tBody.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching customer data:', error));
    
