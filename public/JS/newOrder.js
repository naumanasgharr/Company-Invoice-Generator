document.getElementById("addProductButton").addEventListener("click", addRow);
function addRow(){
  // Select the container for product rows
  const productContainer = document.getElementById("productContainer");
   
  const firstRow = document.querySelector(".productRow");  //clone first row
  var newRow = firstRow.cloneNode(true);
  const removeButton = document.createElement("button"); //remove button
  removeButton.textContent = "Remove";
  removeButton.id = 'removeButton';
  removeButton.type = "button";
  removeButton.addEventListener("click", function () {
    productContainer.removeChild(newRow);
  });
  newRow.appendChild(removeButton);
  
  // Append the new row to the container
  productContainer.appendChild(newRow);
  i++;
}
  
/*document.getElementById("save").addEventListener("click",function(event){

    //event.preventDefault();
    const customerName = document.getElementById("customerName").value;
    const customerAddress = document.getElementById("customerAddress").value;
    const country = document.getElementById("country").value;
    const orderDate = document.getElementById("orderDate").value;
    const invoiceNum = document.getElementById("invoiceNum").value;
    const shipmentDate = document.getElementById("shipmentDate").value;
    const productData = [];
    const productRows = document.querySelectorAll(".productRow");
  
    productRows.forEach(row => {
      const productNumber = row.querySelector("input[name='productNumberr']").value;
      const productName = row.querySelector("input[name='productNamee']").value;
      const productDescription = row.querySelector("input[name='productDesc']").value;
      const unitPrice = row.querySelector("input[name='unitInput']").value;
      const productAmount = row.querySelector("input[name='productAmountt']").value;
  
      productData.push({ productNumber, productName, productDescription, unitPrice, productAmount });
    });

    localStorage.setItem("formData", JSON.stringify({
        customerName,
        customerAddress,
        country,
        orderDate,
        invoiceNum,
        shipmentDate,
    }));
    localStorage.setItem("productData", JSON.stringify(productData));
    window.location.href = "document1.html";
});*/