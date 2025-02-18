let total;
let invoiceData;
fetch('http://localhost:3000/api/performa')
    .then(async response =>{
        if (!response.ok) {
            const errorData = await response.json(); // Ensure we read the JSON error
            throw new Error(errorData.error || "Unknown error");
        }
        return response.json();
    })
    .then(data=>{
        invoiceData = data;
        const form = data.performa;
        const customer = data.customer;
        const products = data.products;
        let articleData = [];
        form.orders.forEach(order=>{
            articleData.push(order.products);
        });
        articleData = articleData.flat();
        
        const articleNumberArray =[];
        const productAmountArray = [];
        const unitPriceArray = [];
        const currencyArray = [];
        articleData.forEach(order=>{
            articleNumberArray.push(order.productNumber);
            productAmountArray.push(order.productAmount);
            unitPriceArray.push(order.unitPrice);
            currencyArray.push(order.currency);
        });

        if(form.source == 'editInvoice')
        {
            document.getElementById('saveButton').hidden = true;
        }
        document.querySelector(".shipmentFrom").textContent = form.loadingPort; 
        document.querySelector(".shipmentDestination").textContent = form.shippingPort;
        document.querySelector(".date").textContent = form.orderDate;
        document.querySelector(".invoiceNumber").textContent = form.invoiceNum;
        document.querySelector("#shipmentDate").textContent =form.shipmentDate;
        document.querySelector("#customerAddress").textContent = customer.address;
        
        total = 0;
        products.forEach((product,index) => {
            const mainTable = document.querySelector(".dynamicTableBody");
            const articleNumber =  articleNumberArray[index];
            const productAmount = productAmountArray[index];
            const unitPrice =  unitPriceArray[index];
            const currency =  currencyArray[index];
            total += (unitPrice*productAmount);
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${articleNumber}</td>
                <td>${product.name}<br>${productAmount}<br>${product.description}</td>
                <td>${unitPrice}${currency}</td>
                <td>${unitPrice*productAmount}${currency}</td>
            `;   
            mainTable.appendChild(newRow);
        });
        document.getElementById('totalValue').innerHTML=`Total: <strong>${total} ${currencyArray[0]}<strong>`;      
    }).catch(error =>{
        console.log('error fetching data,', error);
        alert(error.message || "Failed to load invoice data!");
    });

    //sending data to backend to store it after user clicks save button
document.addEventListener("DOMContentLoaded",()=>{
    document.querySelector("#saveButton").addEventListener("click", async ()=>{
        if(!invoiceData){
            alert("Error! No invoice Data available!! Check article numbers and customer IDs in database!");
            return;
        }
        try{
            const response = await fetch('http://localhost:3000/api/saveInvoice',{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoiceData: invoiceData.performa,
                    productData: invoiceData.products,
                    total: total
                })
            });
            const result = await response.json();
            if (response.ok) {
            alert("Invoice saved successfully!");
            } else {
            alert("Error saving invoice: " + result.message);
            }
        }catch(error){  
            console.error("Error saving invoice:", error);
        }
    });
});
    

       
        







/*function exportToExcel() {
    // Get the header table and main table
    const headerTable = document.querySelector('.header-table');
    const mainTable = document.querySelector('.mainTable');

    // Convert tables to worksheets
    const headerSheet = XLSX.utils.table_to_sheet(headerTable);
    const mainSheet = XLSX.utils.table_to_sheet(mainTable);

    // Merge the two worksheets into one
    const combinedSheet = { ...headerSheet };
    let rowOffset = XLSX.utils.decode_range(headerSheet['!ref']).e.r + 1;

    Object.keys(mainSheet).forEach((key) => {
        if (key.startsWith('!')) {
            if (key === '!ref') {
                const mainRange = XLSX.utils.decode_range(mainSheet['!ref']);
                const combinedRange = {
                    s: { r: 0, c: 0 },
                    e: {
                        r: mainRange.e.r + rowOffset,
                        c: Math.max(mainRange.e.c, XLSX.utils.decode_range(headerSheet['!ref']).e.c),
                    },
                };
                combinedSheet['!ref'] = XLSX.utils.encode_range(combinedRange);
            }
        } else {
            const cell = XLSX.utils.decode_cell(key);
            cell.r += rowOffset;
            const newKey = XLSX.utils.encode_cell(cell);
            combinedSheet[newKey] = mainSheet[key];
        }
    });

    // Set column widths
    combinedSheet['!cols'] = [
        { wch: 20 }, // Set width for column 1
        { wch: 40 }, // Set width for column 2
        { wch: 15 }, // Set width for column 3
        { wch: 20 }  // Set width for column 4
    ];

    // Apply styles manually
    const range = XLSX.utils.decode_range(combinedSheet['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = combinedSheet[cellAddress];
            if (cell) {
                cell.s = {
                    font: {
                        name: 'Times New Roman', // Font name
                        sz: 12,        // Font size
                        bold: row === 0, // Bold header row
                    },
                    alignment: {
                        horizontal: 'center', // Center alignment
                        vertical: 'center',   // Vertical alignment
                    },
                    border: {
                        top: { style: 'thin', color: { rgb: '000000' } },
                        bottom: { style: 'thin', color: { rgb: '000000' } },
                        left: { style: 'thin', color: { rgb: '000000' } },
                        right: { style: 'thin', color: { rgb: '000000' } },
                    },
                };
            }
        }
    }

    // Create workbook and append combined sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, combinedSheet, 'Sheet1');

    // Export the workbook
    XLSX.writeFile(workbook, 'StyledTable.xlsx');
}


window.jsPDF = window.jspdf.jsPDF;

    function downloadPDF() {
        var elementHTML = document.querySelector("#contentToConvert");
        html2canvas(elementHTML).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF(); // Create a new jsPDF instance
            pdf.addImage(imgData, 'PNG', 10, 10, 190, 0); // Add the canvas as an image
            pdf.save('performa.pdf'); // Save the PDF
        });
    }       */
           
            

/*window.addEventListener("DOMContentLoaded", function () {
    const formData = JSON.parse(localStorage.getItem("formData"));
    const productData = JSON.parse(localStorage.getItem("productData"));
    var total = 0;
    if (formData) {
        document.querySelector(".customerName").textContent = formData.customerName;
        document.querySelector(".customerAddress").textContent = formData.customerAddress;
        document.querySelector(".shipmentFrom").textContent = "Karachi, Pakistan"; // Example fixed value
        document.querySelector(".shipmentDestination").textContent = formData.country;
        document.querySelector(".date").textContent = formData.orderDate;
        document.querySelector(".invoiceNumber").textContent = formData.invoiceNum;
        this.document.querySelector("#shipmentDate").textContent =formData.shipmentDate;
    }      

        // Populate product details
    if (productData) {
        const tableBody = document.querySelector(".mainTable tbody");
        
        productData.forEach(product => {
            const row = document.createElement("tr");
            const sumValue = (product.unitPrice)*(product.productAmount);
            total+= sumValue; 
            row.innerHTML = `
                <td><strong>${product.productNumber}</strong></td>
                <td style="text-transform: uppercase;font-weight: bold;"><u>${product.productName}</u> <br> ${product.productDescription}</td>
                <td>${product.unitPrice}</td>
                <td><strong>${sumValue}</strong></td>
              `;
              tableBody.appendChild(row);
            });
          }
          this.document.querySelector("#totalValue strong").textContent ="Total: " + total+ " $";
        
        const tableBody = document.querySelector(".mainTable tbody");
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="1"></td>
            <td colspan="1"">${formData.productNumber}</td>
            <td colspan="4" style="text-transform: uppercase;font-weight: bold;">${formData.productName} <br> ${formData.productDescription}</td>
            <td colspan="1">${formData.unitPrice}$</td>
            <td colspan="1">${(formData.productAmount)*(formData.unitPrice)}$</td>
        `;
        tableBody.appendChild(row);
});*/

