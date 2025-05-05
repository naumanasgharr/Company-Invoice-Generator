fetch('http://localhost:3000/check-auth', { credentials: 'include' })
    .then(response => response.json())
    .then(data => {
        if (!data.isAuthenticated) {
            window.location.href = '/';  // Redirect to login if session is gone
        }
    })
    .catch(error => console.error('Error checking session:', error));

fetch('http://localhost:3000/api/commercialInvoice',{
    method: 'GET',
    credentials: 'include'
})
.then(response=>response.json())
.then(data=>{
    if(data.invoiceData.src)
    {
        document.querySelector('#saveButton').hidden = true;
    }
    else{
        document.querySelector('#saveButton').hidden = false;
    }

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
        `;
        table.appendChild(categoryRow);

        data.products.forEach(product=>{
            if(product.category == category){
                const row1 = document.createElement('tr');
                const row2 = document.createElement('tr');
                const amount = product.cartons*product.cartonPacking;
                const price = (amount*product.unitPrice).toFixed(2);
                row1.innerHTML = `
                    <td><strong>${product.article_number}</strong></td>
                    <td>${product.cartons} CTN ${amount} ${product.cartonPackingUnit}</td>
                    <td>${product.unitPrice} ${product.currency}</td>
                    <td>${price} ${product.currency}</td>
                `;
                row2.innerHTML = `
                    <td>${cartonNumber} - ${(Number(product.cartons) + (cartonNumber - 1))}<br>${product.cartonPacking}${product.cartonPackingUnit}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                `;

                cartonNumber += Number(product.cartons) ;
                //console.log(cartonNumber);
                total += (amount*product.unitPrice);
                table.append(row1,row2);
            } 
        });

    });
    total = total.toFixed(2);
    document.querySelector('#totalValue').innerHTML = `<strong>TOTAL:</strong> ${total} ${data.products[0].currency}`;





    // PACKING LIST AND WEIGHT INVOICE
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

    //WEIGHT INVOICE DETAILS
    document.querySelector('#invoiceNumberPI').textContent = data.invoiceData.invoiceNumber;
    document.querySelector('#datePI').textContent = data.invoiceData.invoiceDate;
    document.querySelector('#customerNamePI').textContent = data.customer.name;
    document.querySelector('#customerAddressPI').textContent = `${data.customer.address},PO- ${data.customer.address},${data.customer.country} `;
    document.querySelector('#fiNoPI').innerHTML =`<strong>FI NO:</strong> ${data.invoiceData.fiNo}`;
    document.querySelector('#shipmentTermsPI').innerHTML = `<strong>Shipment Terms: ${data.invoiceData.shipmentTerms}</strong>`;
    document.querySelector('#fiNoDatePI').textContent = data.invoiceData.fiNoDate;
    document.querySelector('#blNoPI').innerHTML = `<strong>BL NO:</strong> ${data.invoiceData.blNo}`;
    document.querySelector('#blNoDatePI').textContent = data.invoiceData.blNoDate;
    document.querySelector('#shipmentFromPI').textContent = data.invoiceData.loadingPort;
    document.querySelector('#shipmentDestinationPI').textContent = data.invoiceData.shippingPort;

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
                const row1 = document.createElement('tr');
                const row2 = document.createElement('tr');
                const amount = product.cartons*product.cartonPacking;
                row1.innerHTML = `
                    <td><strong>${product.article_number}</strong></td>
                    <td>${product.cartons} CTN ${amount} ${product.cartonPackingUnit}</td>
                    <td>${product.cartonPackingUnit}</td>
                    <td>${amount}</td>
                `;
                row2.innerHTML = `
                    <td>${cartonNumber2} - ${(Number(product.cartons) + (cartonNumber2 - 1))}<br>${product.cartonPacking}${product.cartonPackingUnit}</td>
                    <td>NET WT: ${product.cartonNetWeight*product.cartons} - GROSS WT: ${product.cartonGrossWeight*product.cartons}</td>
                    <td></td>
                    <td></td>
                `;
                cartonNumber2 += Number(product.cartons);
                //console.log(cartonNumber2);
                totalNetWeight += product.cartons * product.cartonNetWeight;
                totalGrossWeight += product.cartons * product.cartonGrossWeight; 
                table.append(row1,row2);
            } 
        });

    });
    const row3 = document.createElement('tr');
    row3.innerHTML = `
        <td></td>
        <td><strong>TOTAL NET WT: ${totalNetWeight} - TOTAL GROSS WT: ${totalGrossWeight}</strong></td>
        <td></td>
        <td></td>
    `;
    document.querySelector('.dynamicTableBody2').appendChild(row3);

    let totalCartons = 0;
    data.products.forEach(product=>{
        const table = document.querySelector('.dynamicTableBody3');  //weight invoice table
        totalCartons += Number(product.cartons);
        const row = document.createElement('tr');  //weight invoice row
        row.innerHTML =    `
            <td colspan="1"><strong>${product.article_number}</strong></td>
            <td colspan="1">${product.carton_length}</td>
            <td colspan="1">${product.carton_width}</td>
            <td colspan="1">${product.carton_height}</td>
            <td colspan="1">${product.cartons}</td>
            <td colspan="1">${product.cartonPacking}${product.cartonPackingUnit}</td>
            <td colspan="1">${product.cartonGrossWeight}</td>
            <td colspan="1">${(product.cartonGrossWeight*product.cartons)}</td>
        `;
        table.appendChild(row);
    });
    const footerWeightTable = document.createElement('tr');
    footerWeightTable.innerHTML = `
        <td colspan ="1"></td>
        <td colspan ="4" style="text-align:center;"><strong>FOR F.M TEXTILE(PVT) LTD</strong></td>
        <td colspan ="1"></td>
        <td colspan ="1"></td>
        <td colspan ="1"><strong>${totalGrossWeight}<strong></td>
    `;
    document.querySelector('.dynamicTableBody3').append(footerWeightTable);

    //BL PRINTING
    productCategory.forEach(category=>{
        let categoryCartons = 0;
        let hs_code = '';
        let grossWeight = 0;
        data.products.forEach(product=>{
            if(product.category == category){
                hs_code = product.hs_code;
                categoryCartons += Number(product.cartons);
                grossWeight += Number((product.cartonGrossWeight*product.cartons)); 
            }
        });
        const row1 = document.createElement('tr');
        row1.innerHTML = `
            <td colspan ="2">${category}</td>
            <td colspan ="1">${hs_code}</td>
            <td colspan ="1">${categoryCartons}</td>
            <td colspan ="1">${grossWeight}</td>
        `;
        
        document.querySelector('.dynamicTableBody4').append(row1);

    });
    const row2 = document.createElement('tr');
    row2.innerHTML = `
        <td colspan='2'></td>
        <td colspan='1'></td>
        <td colspan='1'><strong>TOTAL: ${totalCartons}</strong></td>
        <td colspan='1'>${totalGrossWeight}</td>
    `;
    document.querySelector('.dynamicTableBody4').append(row2);

})
.catch(error=>console.log(error));



//SAVE BUTTON 
document.querySelector('#saveButton').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/SaveCommercialInvoice',{
            method: 'GET',
            credentials: 'include'
        });
        
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


//UPDATE BALANCES
document.querySelector('#updateBalance').addEventListener('click',async function(){
    try {
        const response = await fetch('http://localhost:3000/updateBalances',{
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) { 
            throw new Error(data.error || 'An error occurred while saving the invoice.');
        }
        
        alert(data.message); 
    }
    catch(error) {
        console.error('Error:', error.message);
        alert(error.message);
    }
});

//pdf button function
const { jsPDF } = window.jspdf;

function downloadPDF(contentid,filename) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const minSegmentHeight = 100;

    // Function to render a section to the PDF
    function renderSection(element, pageNumber = 0) {
        return html2canvas(element, { scale: 3 }).then(canvas => {
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

    const contentToConvert = document.querySelector(contentid);
    

    renderSection(contentToConvert)
    .then(() => pdf.save(filename))
    .catch(error => console.error("Error capturing HTML to canvas:", error));
}


document.querySelector('#PDFButton').addEventListener('click',()=>{
    downloadPDF('#contentToConvert1','commercial_invoice.pdf');
    downloadPDF('#contentToConvert2','packing_list.pdf');
    downloadPDF('#contentToConvert3','weight_list.pdf');
    downloadPDF('#contentToConvert4','BLA_printing.pdf');
});

// Function to find the end of a row to avoid splitting
function findRowEnd(canvas, startY, segmentHeight) {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, startY, canvas.width, segmentHeight).data;
    const rowHeightThreshold = 150; // Minimum height considered as a row
    const whiteThreshold = 245; // Pixel value threshold to detect white background
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

//function to check if a canvas is blank
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
    const headerTable1 = document.querySelector('.header-table1');
    const mainTable1 = document.querySelector('.mainTable1');
    const headerTable2 = document.querySelector('.header-table2');
    const mainTable2 = document.querySelector('.mainTable2');

    // Convert each table to sheet
    const sheet1_header = XLSX.utils.table_to_sheet(headerTable1);
    const sheet1_main = XLSX.utils.table_to_sheet(mainTable1);
    const sheet2_header = XLSX.utils.table_to_sheet(headerTable2);
    const sheet2_main = XLSX.utils.table_to_sheet(mainTable2);

    // Helper function to merge two tables into one sheet
    function mergeSheets(sheetA, sheetB) {
        const mergedSheet = { ...sheetA };
        mergedSheet['!ref'] = sheetA['!ref'];

        const offset = XLSX.utils.decode_range(sheetA['!ref']).e.r + 2;
        const rangeB = XLSX.utils.decode_range(sheetB['!ref']);

        Object.keys(sheetB).forEach(key => {
            if (!key.startsWith('!')) {
                const cell = XLSX.utils.decode_cell(key);
                const newAddress = XLSX.utils.encode_cell({ r: cell.r + offset, c: cell.c });
                mergedSheet[newAddress] = sheetB[key];
            }
        });

        const rangeA = XLSX.utils.decode_range(sheetA['!ref']);
        mergedSheet['!ref'] = XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: {
                r: offset + rangeB.e.r,
                c: Math.max(rangeA.e.c, rangeB.e.c)
            }
        });

        return mergedSheet;
    }

    // Merge for each sheet
    const commercialSheet = mergeSheets(sheet1_header, sheet1_main);
    const packingSheet = mergeSheets(sheet2_header, sheet2_main);

    // Optionally define column widths
    commercialSheet['!cols'] = [
        { wch: 20 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 20 }
    ];
    packingSheet['!cols'] = [
        { wch: 20 }, { wch: 40 }, { wch: 15 }, { wch: 15 }
    ];

    // Create workbook and append both sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, commercialSheet, 'Commercial Invoice');
    XLSX.utils.book_append_sheet(workbook, packingSheet, 'Packing List');

    XLSX.writeFile(workbook, 'Commercial_and_Packing_List.xlsx');
}
