//new order page
document.getElementById("newOrder").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="pages/newOrder.html";
});

//new customer page
document.querySelector("#newCustomer").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="pages/customerForm.html";
});

//new product to db page
document.querySelector("#addArticle").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="pages/productForm.html";
});

// customer list page
document.getElementById('view-customers').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "pages/customerReport.html";
});

// article link to customer page
document.getElementById('customerLink').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "pages/customerLink.html"; 
});

// product list page
document.getElementById('view-products').addEventListener('click', function (event){
   event.preventDefault();
   window.location.href = "pages/productList.html"; 
});