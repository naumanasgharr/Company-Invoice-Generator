fetch('http://localhost:3000/check-auth', { credentials: 'include' })
.then(response => response.json())
.then(data => {
    if (!data.isAuthenticated) {
        window.location.href = '/';  // Redirect to login if session is gone
    }
})
.catch(error => console.error('Error checking session:', error));


let total;
let invoiceData;
fetch('http://localhost:3000/api/performa',{
    method: 'GET',
    credentials: 'include'
})
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
        if(form.source){
            document.querySelector("#saveButton").hidden = true;
        }
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
        const productCategorySet = new Set();

        products.forEach(product => {
            productCategorySet.add(product.category);
        });

        const productCategoryArray = [...productCategorySet];
        console.log(productCategoryArray);

        if(form.source == 'editInvoice')
        {
            document.getElementById('saveButton').hidden = true;
        }
        document.querySelector(".shipmentFrom").textContent = form.loadingPort; 
        document.querySelector(".shipmentDestination").textContent = form.shippingPort;
        document.querySelector(".date").textContent = form.orderDate;
        document.querySelector(".invoiceNumber").textContent = data.invoiceNumber;
        //document.querySelector("#shipmentDate").textContent = form.shipmentDate;
        document.querySelector("#customerName").innerHTML = `To, <br> ${customer.name}`;
        document.querySelector('#customerAddress').innerHTML = `${customer.address}<br>${customer.country}`;
        
        total = 0;
        productCategoryArray.forEach(Maincategory=>{
            const mainTable = document.querySelector(".dynamicTableBody");
            const categoryRow = document.createElement('tr');
            categoryRow.className = 'categoryRow';
            categoryRow.innerHTML = `
                <td></td>
                <td><strong>${Maincategory}<strong></td>
                <td></td>
                <td></td>
            `;
            mainTable.appendChild(categoryRow);
            products.forEach((product,index) => {
                if(product.category == Maincategory){
                    const articleNumber =  articleNumberArray[index];
                    const productAmount = productAmountArray[index];
                    const unitPrice =  unitPriceArray[index];
                    const currency =  currencyArray[index];
                    const cartons = Math.ceil(productAmount / product.carton_packing);
                    total += (unitPrice*productAmount);
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>  <strong>${articleNumber}</strong><br>1 - ${cartons}<br>${product.carton_packing} ${product.carton_packing_type}</td>
                        <td><strong>${product.description}</strong><br>${cartons} CARTONS --- ${productAmount} ${product.carton_packing_type}</td>
                        <td>${unitPrice}${currency}</td>
                        <td>${(unitPrice*productAmount).toFixed(2)}${currency}</td>
                    `;   
                    mainTable.appendChild(newRow);
                }
            });
        });
        total = total.toFixed(2);
        const table = document.querySelector('#totalValuetBody');
        const shipmentRow = document.createElement('tr');
        shipmentRow.innerHTML = `
            <td></td>
            <td><strong>SHIPMENT DATE:</strong> ${form.shipmentDate}</td>
            <td></td>
            <td></td>
        `;  
        
        document.getElementById('totalValue').innerHTML=`Total: <strong>${total} ${currencyArray[0]}<strong>`;
        table.appendChild(shipmentRow);     
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
            const response = await fetch('http://localhost:3000/saveInvoice',{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoiceData: invoiceData.performa,
                    total: total
                }),
                credentials: 'include'
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
    

//excel file button

function exportToExcel() {
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

    // 📌 Insert 2 blank rows after row 12
    const insertAfterRow = 11;
    const numBlankRows = 2;
    const newSheet = {};

    Object.keys(combinedSheet).forEach((key) => {
        if (key.startsWith('!')) return;

        const cell = XLSX.utils.decode_cell(key);
        const newCell = { ...cell };

        if (cell.r > insertAfterRow) {
            newCell.r += numBlankRows;
        }

        const newKey = XLSX.utils.encode_cell(newCell);
        newSheet[newKey] = combinedSheet[key];
    });

    // Copy meta properties
    Object.keys(combinedSheet).forEach((key) => {
        if (key.startsWith('!')) {
            newSheet[key] = combinedSheet[key];
        }
    });

    // Update !ref range to reflect new rows
    const oldRange = XLSX.utils.decode_range(combinedSheet['!ref']);
    const newRange = {
        s: oldRange.s,
        e: {
            r: oldRange.e.r + numBlankRows,
            c: oldRange.e.c,
        },
    };
    newSheet['!ref'] = XLSX.utils.encode_range(newRange);

    // Set column widths
    newSheet['!cols'] = [
        { wch: 20 },
        { wch: 40 },
        { wch: 15 },
        { wch: 20 }
    ];

    newSheet['!rows'] = [];
    newSheet['!rows'][0] = { hpt: 40 };
    newSheet['!rows'][1] = { hpt: 40 };
    newSheet['!rows'][14] = { hpt: 30 };
    newSheet['!rows'][6] = { hpt: 30 }; 

    // Apply styles
    const range = XLSX.utils.decode_range(newSheet['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = newSheet[cellAddress];
            if (cell) {
                cell.s = {
                    font: {
                        name: 'Times New Roman',
                        sz: 12,
                        bold: row === 0,
                    },
                    alignment: {
                        horizontal: 'center',
                        vertical: 'center',
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

    // Create and export workbook
    const workbook = XLSX.utils.book_new();
    newSheet["B1"].s = {
        font: {
            name: "Times New Roman",
            sz: 25,
            bold: true,
            color: { rgb: "000000" } // Blue
        }
    };
    XLSX.utils.book_append_sheet(workbook, newSheet, 'Sheet1');
    XLSX.writeFile(workbook, 'performa.xlsx');
}


//pdf file button
const { jsPDF } = window.jspdf;

function downloadPDF() {
    var elementHTML = document.querySelector("#contentToConvert");
    html2canvas(elementHTML, { scale: 4 }).then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const pageHeight = Math.floor(canvasWidth * (pdfHeight / pdfWidth));
        
        let pdfY = 0;
        let pageNumber = 0;
        const minSegmentHeight = 100; // Minimum segment height to avoid too small segments being pushed

        while (pdfY < canvasHeight) {
            let segmentHeight = Math.min(pageHeight, canvasHeight - pdfY);

            // If it's the first page, don't detect rows - render header as-is
            if (pageNumber > 0) {
                const rowEnd = findRowEnd(canvas, pdfY, segmentHeight);
                
                if (rowEnd < canvasHeight) {
                    segmentHeight = rowEnd - pdfY;
                }
            }

            // If the segment is very small, include it in the previous page if possible
            if (segmentHeight < minSegmentHeight && pageNumber > 0) {
                pdfY += segmentHeight;
                continue; // Skip this segment as it will be merged with the previous one
            }

            // Create a temporary canvas for the current segment
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvasWidth;
            pageCanvas.height = segmentHeight;
            const context = pageCanvas.getContext('2d');

            // Fill the canvas with a white background to avoid black areas
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvasWidth, segmentHeight);

            // Draw the current segment of the original canvas
            context.drawImage(canvas, 0, pdfY, canvasWidth, segmentHeight, 0, 0, canvasWidth, segmentHeight);

            // Convert the segment to JPEG
            const imgData = pageCanvas.toDataURL('image/jpeg', 0.8);
            const imgHeight = (segmentHeight * pdfWidth) / canvasWidth;

            // Check if the segment is not blank before adding
            if (!isCanvasBlank(pageCanvas)) {
                if (pageNumber > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
                pageCanvas.remove();
                pageNumber++;
            }

            // Move to the next segment
            pdfY += segmentHeight;
        }

        pdf.save('commercial_invoice.pdf');
    }).catch(error => console.error("Error capturing HTML to canvas:", error));
}

// Function to find the end of a row to avoid splitting
function findRowEnd(canvas, startY, segmentHeight) {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, startY, canvas.width, segmentHeight).data;
    const rowHeightThreshold = 30; // Minimum height considered as a row
    const whiteThreshold = 250; // Pixel value threshold to detect white background
    let lastRowEnd = startY;
    let isRow = false;

    for (let y = 0; y < segmentHeight; y++) {
        let isLineEmpty = true;

        for (let x = 0; x < canvas.width; x++) {
            const pixelIndex = (y * canvas.width + x) * 4;
            const r = imageData[pixelIndex];
            const g = imageData[pixelIndex + 1];
            const b = imageData[pixelIndex + 2];

            if (r < whiteThreshold || g < whiteThreshold || b < whiteThreshold) {
                isLineEmpty = false;
                break;
            }
        }

        if (!isLineEmpty) {
            isRow = true;
            lastRowEnd = startY + y;
        } else if (isRow && y - (lastRowEnd - startY) >= rowHeightThreshold) {
            return lastRowEnd + 1;
        }
    }

    return lastRowEnd + 1;
}

// Improved function to check if a canvas is blank
function isCanvasBlank(canvas) {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const totalPixels = canvas.width * canvas.height;
    let whitePixels = 0;
    const whiteThreshold = 250;

    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
            whitePixels++;
        }
    }

    const blankRatio = whitePixels / totalPixels;
    return blankRatio > 0.99; // Consider the canvas blank if 99% of pixels are white
}