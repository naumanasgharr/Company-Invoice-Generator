//new order page
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