document.getElementById("newOrder").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="pages/newOrder.html";
});
document.querySelector("#newCustomer").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="pages/customerForm.html";
});
document.querySelector("#addArticle").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="pages/productForm.html";
});
document.getElementById('view-customers').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "pages/customerReport.html"; // Adjust path as needed
  });
  document.getElementById('customerLink').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "pages/customerLink.html"; // Adjust path as needed
  });