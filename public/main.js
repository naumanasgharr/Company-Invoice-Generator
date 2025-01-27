document.getElementById("newOrder").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="newOrder.html";
});
document.querySelector("#newCustomer").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="customerForm.html";
});
document.querySelector("#addArticle").addEventListener("click",function (event){
    event.preventDefault();
    window.location.href="productForm.html";
});
document.getElementById('view-customers').addEventListener('click', function (event){
    event.preventDefault();
    window.location.href = "customer.html"; // Adjust path as needed
  });