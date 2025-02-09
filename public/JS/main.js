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

// customer list page
document.getElementById('view-customers').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "../HTML/Reports/customerReport.html";
});

// article link to customer page
document.getElementById('customerLink').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "../HTML/Forms/customerLink.html"; 
});

// product list page
document.getElementById('view-products').addEventListener('click', function (event){
   event.preventDefault();
   window.location.href = "../HTML/Reports/productList.html"; 
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