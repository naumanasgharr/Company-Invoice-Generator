fetch('http://localhost:3000/api/commercialInvoice')
.then(response=>response.json())
.then(data=>{
    console.log(data);

    //invoice Details
    document.querySelector('#invoiceNumber').textContent = data.invoiceData.invoiceNumber;
    document.querySelector('#date').textContent = data.invoiceData.invoiceDate;
    document.querySelector('#customerName').textContent = data.customer.name;
    document.querySelector('#customerAddress').textContent = `${data.customer.address},PO- ${data.customer.address},${data.customer.country} `;
    document.querySelector('#fiNo').innerHTML =`<strong>FI NO:</strong> ${data.invoiceData.fiNo}`;
    document.querySelector('#shipmentTerms').innerHTML = `<strong>Shipment Terms: ${data.invoiceData.shipmentTerms}</strong>`;
    document.querySelector('#fiNoDate').textContent = data.invoiceData.fiNoDate;
    document.querySelector('#blNo').innerHTML = `<strong>BL NO:</strong> ${data.invoiceData.blNo}`;
    document.querySelector('#blNoDate').textContent = data.invoiceData.blNoDate;
    document.querySelector('#shipmentFrom').textContent = data.invoiceData.loadingPort;
    document.querySelector('#shipmentDestination').textContent = data.invoiceData.shippingPort;
    //document.querySelector('#shipmentDate').textContent = data.invoiceData.shipmentDate;

    //product details
    const productCategory = [];
    data.products.forEach(product=>{
        if(!productCategory.includes(product.category)){
            productCategory.push(product.category);
        }
    });
    let cartonNumber = 1;
    let total = 0;
    productCategory.forEach(category=>{
        const table = document.querySelector('.dynamicTableBody1');
        const categoryRow = document.createElement('tr');
        categoryRow.innerHTML = `
            <td></td>
            <td style='text-align:center; text-decoration: underline;'><strong>${category}</strong></td>
            <td></td>
            <td></td>
            <td></td>
        `;
        table.appendChild(categoryRow);

        data.products.forEach(product=>{
            if(product.category == category){
                const row = document.createElement('tr');
                const amount = product.cartons*product.cartonPacking;
                const price = (amount*product.unitPrice).toFixed(2);
                row.innerHTML = `
                    <td>${cartonNumber} - ${(Number(product.cartons) + (cartonNumber - 1))}</td>
                    <td>${product.cartons} CTN ${amount} ${product.cartonPackingUnit} ${product.description} --<strong>${product.article_number}</strong></td>
                    <td>${amount}</td>
                    <td>${product.unitPrice} ${product.currency}</td>
                    <td>${price} ${product.currency}</td>
                `;
                cartonNumber += Number(product.cartons) ;
                console.log(cartonNumber);
                total += (amount*product.unitPrice);
                table.appendChild(row);
            } 
        });

    });
    total = total.toFixed(2);
    const table = document.querySelector('#totalValuetBody');
    const shipmentRow = document.createElement('tr');
    shipmentRow.innerHTML = `
        <td></td>
        <td><strong>SHIPMENT DATE:</strong> ${data.invoiceData.shipmentDate}</td>
        <td></td>
        <td></td>
        <td></td>
    `;  
    document.querySelector('#totalValue').innerHTML = `<strong>TOTAL:</strong> ${total} ${data.products[0].currency}`;
    table.appendChild(shipmentRow);





    // PACKING LIST
    document.querySelector('#invoiceNumberP').textContent = data.invoiceData.invoiceNumber;
    document.querySelector('#dateP').textContent = data.invoiceData.invoiceDate;
    document.querySelector('#customerNameP').textContent = data.customer.name;
    document.querySelector('#customerAddressP').textContent = `${data.customer.address},PO- ${data.customer.address},${data.customer.country} `;
    document.querySelector('#fiNoP').innerHTML =`<strong>FI NO:</strong> ${data.invoiceData.fiNo}`;
    document.querySelector('#shipmentTermsP').innerHTML = `<strong>Shipment Terms: ${data.invoiceData.shipmentTerms}</strong>`;
    document.querySelector('#fiNoDateP').textContent = data.invoiceData.fiNoDate;
    document.querySelector('#blNoP').innerHTML = `<strong>BL NO:</strong> ${data.invoiceData.blNo}`;
    document.querySelector('#blNoDateP').textContent = data.invoiceData.blNoDate;
    document.querySelector('#shipmentFromP').textContent = data.invoiceData.loadingPort;
    document.querySelector('#shipmentDestinationP').textContent = data.invoiceData.shippingPort;

    let cartonNumber2 = 1;
    let totalNetWeight = 0;
    let totalGrossWeight = 0;
    productCategory.forEach(category=>{
        const table = document.querySelector('.dynamicTableBody2');
        const categoryRow = document.createElement('tr');
        categoryRow.innerHTML = `
            <td></td>
            <td style='text-align:center; text-decoration: underline;'><strong>${category}</strong></td>
            <td></td>
            <td></td>
        `;
        table.appendChild(categoryRow);

        data.products.forEach(product=>{
            if(product.category == category){
                const row = document.createElement('tr');
                const amount = product.cartons*product.cartonPacking;
                row.innerHTML = `
                    <td>${cartonNumber2} - ${(Number(product.cartons) + (cartonNumber2 - 1))}</td>
                    <td>${product.cartons} CTN ${amount} ${product.cartonPackingUnit} ${product.description} --<strong>${product.article_number}</strong></td>
                    <td>${product.cartonNetWeight*product.cartons}</td>
                    <td>${product.cartonGrossWeight*product.cartons}</td>
                `;
                cartonNumber2 += Number(product.cartons);
                console.log(cartonNumber2);
                totalNetWeight += product.cartons * product.cartonNetWeight;
                totalGrossWeight += product.cartons * product.cartonGrossWeight; 
                table.appendChild(row);
            } 
        });

    });
    const table2 = document.querySelector('#totalWeighttBody');
    const shipmentRow2 = document.createElement('tr');
    shipmentRow2.innerHTML = `
        <td></td>
        <td><strong>SHIPMENT DATE:</strong> ${data.invoiceData.shipmentDate}</td>
        <td></td>
        <td></td>
    `;  
    document.querySelector('#totalGrossWeight').innerHTML = `<strong>TOTAL:</strong>${totalGrossWeight} `;
    document.querySelector('#totalNetWeight').innerHTML = `<strong>TOTAL:</strong>${totalNetWeight} `;
    table2.appendChild(shipmentRow2);


})
.catch(error=>console.log(error));


document.querySelector('#saveButton').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/SaveCommercialInvoice');
        
        if (!response.ok) { 
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occurred while saving the invoice.');
        }
        
        const data = await response.json();
        alert(data.message); // Show success message
    } catch (error) {
        console.error('Error:', error.message);
        alert(error.message); // Show error message
    }
});

document.querySelector('#updateBalance').addEventListener('click',async function(){
    try {
        const response = await fetch('http://localhost:3000/updateBalances');
        
        if (!response.ok) { 
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occurred while saving the invoice.');
        }
        
        const data = await response.json();
        alert(data.message); 
    }
    catch(error) {
        console.error('Error:', error.message);
        alert(error.error);
    }
});

//pdf button function
const { jsPDF } = window.jspdf;

function downloadPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const minSegmentHeight = 100;

    // Function to render a section to the PDF
    function renderSection(element, pageNumber = 0) {
        return html2canvas(element, { scale: 4 }).then(canvas => {
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const pageHeight = Math.floor(canvasWidth * (pdfHeight / pdfWidth));
            let pdfY = 0;

            while (pdfY < canvasHeight) {
                let segmentHeight = Math.min(pageHeight, canvasHeight - pdfY);
                if (pageNumber > 0) pdf.addPage();

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvasWidth;
                pageCanvas.height = segmentHeight;
                const context = pageCanvas.getContext('2d');
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvasWidth, segmentHeight);
                context.drawImage(canvas, 0, pdfY, canvasWidth, segmentHeight, 0, 0, canvasWidth, segmentHeight);

                const imgData = pageCanvas.toDataURL('image/jpeg', 0.8);
                const imgHeight = (segmentHeight * pdfWidth) / canvasWidth;

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
                pageCanvas.remove();
                pdfY += segmentHeight;
                pageNumber++;
            }
        });
    }

    const contentToConvert1 = document.querySelector("#contentToConvert1");
    const contentToConvert2 = document.querySelector("#contentToConvert2");

    renderSection(contentToConvert1)
        .then(() => renderSection(contentToConvert2, 1))
        .then(() => pdf.save('commercial_invoice_and_packing_list.pdf'))
        .catch(error => console.error("Error capturing HTML to canvas:", error));
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

//excel button
function exportToExcel() {
    // Get the header table and main table
    const headerTable = document.querySelector('.header-table1');
    const mainTable = document.querySelector('.mainTable1');

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



