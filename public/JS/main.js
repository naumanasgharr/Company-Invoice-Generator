//new order page
fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));


document.getElementById("newOrder").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="../HTML/Forms/newOrder.html";
});

//new customer page
document.querySelector("#newCustomer").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="../HTML/Forms/customerForm.html";
});

//new product to db page
document.querySelector("#addArticle").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="../HTML/Forms/productForm.html";
});

// article link to customer page
document.getElementById('customerLink').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "../HTML/Forms/customerLink.html"; 
});

//order list page
document.getElementById('view-orders').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "../HTML/Reports/orderReport.html"; 
});

//edit invoice page
document.getElementById('edit-invoice').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "../HTML/Forms/editInvoice.html"; 
});

//shipment invoice
document.getElementById('shippingInvoice').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "../HTML/Forms/shippingInvoice.html"; 
});

document.querySelector('#logout').addEventListener('click',async function(){

    try {
        const response = await fetch('http://localhost:3000/logout',{
            method: 'GET',
            credentials: 'include'
        });
        if(!response.ok){
            alert('LOGOUT FAILED');
        }
        alert('LOGOUT SUCCESSFUL');
        window.location.href = "/";
    }
    catch(error) {
        console.log(error);
        alert(error);
    }
});