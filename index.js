import express from "express";
import bodyParser from "body-parser";
import mysql2 from "mysql2";
import {dirname} from "path";
import { fileURLToPath, pathToFileURL } from "url";
import methodOverride from "method-override";

const db = mysql2.createPool({
    host: "127.0.0.1",     
    user: "root",           // Replace with your MySQL username
    password: "Pak275jb-",   // Enter your MySQL password
    database: "database1" // Name of database
});
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to the MySQL database!");
        connection.release();
    }
});

const app = express();
const port = 3000;
//app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
const __dir = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dir + "/public"));

// MAIN PAGE

app.get("/",(req,res)=>{
    res.sendFile(__dir + "/public/HTML/main.html");
    console.log("sent");
});

// GENERATING PERFORMA INVOICE
var performaData = null;
app.post("/performaInvoice",(req,res)=>{
    console.log("Request received at performaInvoice");
    console.log(req.body);
    performaData = req.body;
    res.sendFile(__dir+"/public/HTML/Invoices/document1.html");
});

// saving invoice to db
app.post("/api/saveInvoice",async (req,res)=>{
    console.log("Received request body:", req.body);
    if (!req.body.invoiceData || !req.body.invoiceData.performa.orderNumber) {
        return res.status(400).send({ error: "Invalid invoice data" });
    }

    const {invoiceData, total} = req.body;
    const invoiceNumber = invoiceData.performa.invoiceNum;
    const customerID = invoiceData.performa.customerID;
    const orderDate = invoiceData.performa.orderDate;
    const loadingPort = invoiceData.performa.loadingPort;
    const shippingPort = invoiceData.performa.shippingPort;
    const shipmentDate = invoiceData.performa.shipmentDate;
    const articleNumbersArray = Array.isArray(invoiceData.performa.productNumber) ? invoiceData.performa.productNumber : [invoiceData.performa.productNumber]; 
    const articleAmountArray = Array.isArray(invoiceData.performa.productAmount) ? invoiceData.performa.productAmount : [invoiceData.performa.productAmount];
    const unitPriceArray = Array.isArray(invoiceData.performa.unitPrice) ? invoiceData.performa.unitPrice : [invoiceData.performa.unitPrice];
    const orderNumberArray = Array.isArray(invoiceData.performa.orderNumber) ? invoiceData.performa.orderNumber : [invoiceData.performa.orderNumber];
    const currencyArray = Array.isArray(invoiceData.performa.currency) ? invoiceData.performa.currency : [invoiceData.performa.currency];

    if (orderNumberArray.length !== articleNumbersArray.length ||orderNumberArray.length !== articleAmountArray.length || orderNumberArray.length !== unitPriceArray.length || orderNumberArray.length !== currencyArray.length){
        return res.status(400).send({ error: "Mismatch in order and article data" });
    }

    const connection = await db.promise().getConnection();

    try{
        await connection.beginTransaction();

        const query1 = 'INSERT INTO invoice_table(invoice_number,customer_id,order_date,shipping_date,loading_port,shipping_port,total) VALUES (?,?,?,?,?,?,?)'
        const query2 = 'INSERT INTO order_table(invoice_number,order_number) VALUES (?,?)';
        const query3 = 'INSERT INTO orderDetail_table(order_number,article_number,article_amount,unit_price,currency) VALUES (?,?,?,?,?)';
    
        await connection.query(query1,[invoiceNumber,customerID, orderDate, shipmentDate, loadingPort,shippingPort, total]);
    
        for(var i = 0; i<articleNumbersArray.length;i++){
            await connection.query(query2,[invoiceNumber,orderNumberArray[i]]);
            await connection.query(query3,[orderNumberArray[i],articleNumbersArray[i],articleAmountArray[i],unitPriceArray[i],currencyArray[i]]);
        }; 

        await connection.commit();
        res.status(200).json({message:"invoice saved successfully!"});
    } catch(error){
        await connection.rollback();
        console.error("Error inserting data, rolling back:", error.message);
        res.status(500).json({ error: error.message});
    } finally {
        connection.release(); // Release connection back to pool
    }
});

// ADDING CUSTOMER TO DB

app.post("/customerForm",(req,res)=>{
    console.log(req.body);
    const {customerName, customerAddress, country, phoneNumber, officeNumber, email, VATnumber, PObox, website} = req.body;   
    const query = 'INSERT INTO customer_table (name, phone_number, email, address, country, VAT_number, office_number, website, PO_box) VALUES (?,?,?,?,?,?,?,?,?)';
    db.query(query, [customerName, phoneNumber, email, customerAddress, country, VATnumber, officeNumber, website, PObox], (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).send('Failed to insert data');
          return;
        }
        console.log('customer added!');
      //res.status(200).send('Customer added successfully!');
        res.send(`
            <html>
                <head><title>Form Submitted</title></head>
                <body>
                    <script>
                        alert("Customer Added to Database");
                        window.location.href = "/"; // Redirect after the alert
                    </script>
                </body>
            </html>
        `);
    });      
});

// GENERATING CUSTOMER LIST

app.get("/api/customerReport",(req,res)=>{
    db.query('SELECT * FROM customer_table',(err,results)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.json(results);
        }
    });
});

 // INSERTING PRODUCT DATA INTO DB

app.post("/productForm",(req,res)=>{
    console.log(req.body);
    const {productName, articleNumber, productCode, productDesc, productWeight, productSize, cartonLength, cartonHeight, cartonWidth} = req.body;
    const query = 'INSERT INTO product_table (article_number, name, description, hs_code, size, carton_length, carton_width, carton_height, weight) VALUES (?,?,?,?,?,?,?,?,?)';
    db.query(query, [articleNumber,productName,productDesc,productCode,productSize,cartonLength,cartonWidth,cartonHeight,productWeight], (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).send('Failed to insert data');
          return;
        }
        if(req){
            res.send(`
                <html>
                    <head><title>Form Submitted</title></head>
                    <body>
                        <script>
                            alert("Article Added to Database");
                            window.location.href = "/"; // Redirect after the alert
                        </script>
                    </body>
                </html>
            `);
        }
    });      
});

// ADDING CUSTOMER ARTICLE NUMBERS INTO DB (customer_article TABLE)

app.post("/articleLink",(req,res)=>{
    console.log(req.body);
    const {customerId, articleNumber, productNumber} = req.body;
    const query = 'INSERT INTO customer_article(customer_id,product_id,article_number) VALUES (?,?,?)';
    db.query(query, [customerId,productNumber,articleNumber], (err,result)=>{
        if(err){
            console.error('Error inserting data:', err);
            res.status(500).send('Failed to insert data');
            return;
        }
        if(req){
            res.send(`
                <html>
                    <head><title>Form Submitted</title></head>
                    <body>
                        <script>
                            alert("Article linked to Customer");
                            window.location.href = "/"; // Redirect after the alert
                        </script>
                    </body>
                </html>
            `);
        }    
    });
});

// SENDING DATA TO DOCUMENT1.HTML

app.get("/api/performa",(req,res)=>{
    // form data error check
    if(!performaData){
        res.status(404).json({error: 'no data available!'});
    }

    // extracting customer_id and article_number from form data
    const{customerID,productNumber} = performaData;
    
    // checking converting articlenumbers into an array
    const articleNumbersArray = Array.isArray(productNumber) ? productNumber : [productNumber]; 
    
    // logging to see if we are getting the correct data
   // console.log(customerID,productNumber); 

    // SQL query for retrieving customer data related to customerid recieved from form data/ used nested queries (3)
    const query1 = 'SELECT * FROM customer_table WHERE id = ?'; 
    db.query(query1,[customerID],(err1,customerResult)=>{
        if(err1){
            console.log('error fetching data');
            res.status(500).json({error: 'error fetching data'});
        }

        //logging customer data to check if the result is correct
      //  console.log(customerResult);
        
        //created an empty products array for storing product_ids and a global parameter
        const products = [];
        let completedQuerries = 0;
        
        //forEach loop on article_numbers array to get related product_ids one by one, and pushing them into products array
        articleNumbersArray.forEach(productNumber => {
            
            //second query for getting product ids
            const query2 = 'SELECT product_id FROM customer_article WHERE customer_id = ? AND article_number = ?';
            db.query(query2,[customerID,productNumber],(err2,articleResult)=>{
                if (err2) {
                    console.error("Error fetching product data:", err2);
                    return res.status(500).json({ error: "Database error (products)" });
                }
                if (articleResult.length === 0) {
                    console.log(`No product found for article number ${productNumber}`);
                    return res.status(404).json({ error: "No articles found for this customer." }); // Skip if no product is found for this article number
                }
                const product_number = articleResult[0].product_id;
                // last query for retrieving product data for each product id
                const query3 = 'SELECT * FROM product_table WHERE article_number = ?';
                db.query(query3, [product_number], (err3, productResult) => {
                    if (err3) {
                        console.error(`Error fetching product data for product number ${product_number}:`, err3);
                        return res.status(500).json({ error: "Error fetching product data" });
                    }

                    if (productResult.length === 0) {
                        console.log(`No product found for product number ${product_number}`);
                        return; // Skip if no product is found
                    }

                    // Add the product data to the products array
                    products.push(productResult[0]);

                    completedQuerries++;
                 //   console.log(products);
                    // Once all queries are completed, send the response
                    if (completedQuerries === articleNumbersArray.length) {
                        res.json({
                            performa: performaData,
                            customer: customerResult[0],
                            products: products
                        });
                    }
                });
            });
        });
    });

});

// sending data to productList
app.get('/api/productList',(req,res)=>{
    db.query('SELECT * FROM product_table',(err,results)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.json(results);
        }
    });
});

app.get('/api/orderList',(req,res)=>{
    const query1 = 'SELECT id,name FROM customer_table INNER JOIN invoice_table ON customer_table.id = invoice_table.customer_id';
    const query2 = 'SELECT * FROM order_table INNER JOIN invoice_table ON order_table.invoice_number = invoice_table.invoice_number';
    const query3 = 'SELECT * FROM orderDetail_table INNER JOIN order_table ON orderDetail_table.order_number = order_table.order_number';
    const query4 = 'SELECT * FROM customer_article INNER JOIN orderDetail_table ON customer_article.article_number = orderDetail_table.article_number';
    const query5 = 'SELECT * FROM product_table INNER JOIN customer_article ON product_table.article_number = customer_article.product_id';
    db.query(query1,(err1,customerData)=>{
        if(err1){
            res.status(500).send({error: 'error fetching data'});
        }
       // console.log("customer data: ");
       // console.log(customerData);
        db.query(query2,(err2,invoiceData)=>{
            if(err2){
                res.status(500).send({error: 'error fetching data'});
            }
          //  console.log("invoice data: ");
          //  console.log(invoiceData);
            db.query(query3,(err3,orderData)=>{
                if(err3){
                    res.status(500).send({error: 'error fetching data'});
                }
               // console.log("order details: ");
               // console.log(orderData);
                db.query(query4,(err4,articleData)=>{
                    if(err4){
                        res.status(500).send({error: 'error fetching data'});
                    }
                    //console.log("article data: ");
                    //console.log(articleData);
                    db.query(query5,(err5,productData)=>{
                        if(err4){
                            res.status(500).send({error: 'error fetching data'});
                        }
                        //console.log("product data: ");
                        //console.log(productData);

                        const invoicesMap = {};

                        orderData.forEach(order => {
                            const invoice = invoiceData.find(inv => inv.order_number === order.order_number);
                            if (!invoice) return; // Skip if no invoice is found

                            if (!invoicesMap[invoice.invoice_number]) {
                                // Find the corresponding customer data
                                const customer = customerData.find(cust => cust.id === invoice.customer_id);

                                invoicesMap[invoice.invoice_number] = {
                                    invoice_number: invoice.invoice_number,
                                    customer: {
                                        id: customer.id,
                                        name: customer.name
                                    },
                                    order_date: invoice.order_date,
                                    shipping_date: invoice.shipping_date,
                                    loading_port: invoice.loading_port,
                                    shipping_port: invoice.shipping_port,
                                    total: invoice.total,
                                    orders: []
                                };
                            }

                            // Step 2: Check if order already exists inside the invoice
                            let existingOrder = invoicesMap[invoice.invoice_number].orders.find(o => o.order_number === order.order_number);

                            if (!existingOrder) {
                                existingOrder = {
                                    order_number: order.order_number,
                                    articles: []
                                };
                                invoicesMap[invoice.invoice_number].orders.push(existingOrder);
                            }

                            // Step 3: Find matching article details
                            const articleDetails = articleData.find(a => a.order_number === order.order_number && a.article_number === order.article_number);
                            if (!articleDetails) return;

                            // Step 4: Find corresponding product details
                            const productDetails = productData.find(p => p.article_number === articleDetails.article_number);
                            if (!productDetails) return;

                            // Step 5: Push article and product details inside the order
                            existingOrder.articles.push({
                                article_number: order.article_number,
                                article_amount: order.article_amount,
                                unit_price: order.unit_price,
                                currency: order.currency,
                                product: {
                                    article_number: productDetails.article_number,
                                    name: productDetails.name,
                                    hs_code: productDetails.hs_code,
                                    size: productDetails.size
                                }
                            });
                        });

                        // Step 6: Convert object to array and send response
                        const invoicesArray = Object.values(invoicesMap);
                        res.json(invoicesArray);
                    });
                });
            });
        });
    });                  
});

// select invoice number for edit invoice page
app.get("/api/selectInvoice",(req,res)=>{
    const query = 'SELECT invoice_number FROM invoice_table';
    db.query(query,(err,invoiceNumbers)=>{
        if(err){
            res.status(500).send({error: 'error loading invoice numbers'});
        }
        res.json(invoiceNumbers);
    });
});

// send selected invoice data to edit invoice page
app.get("/api/invoiceDetails",async (req,res)=>{
    const invoiceNumber = req.query.invoice_number;
    try{
        const [invoiceData] = await db.promise().query('SELECT * FROM invoice_table WHERE invoice_number = ?',[invoiceNumber]);
        if (invoiceData.length === 0){
            return res.status(404).json({ error: "Invoice not found" });
        }

        const [orderNumbers] = await db.promise().query('SELECT * FROM order_table WHERE invoice_number = ?',[invoiceNumber]);
        if(orderNumbers.length == 0){
            res.status(500).json({ invoiceData: invoiceData[0], orders: [] });
        }

        const orderDetailsArray = await Promise.all(
            orderNumbers.map(async (order) => {
                const [orderDetails] = await db.promise().query("SELECT * FROM orderDetail_table WHERE order_number = ?",[order.order_number]);
                return {orderDetails };
            })
        );

        res.json({
            invoiceData: invoiceData[0],
            orders: orderDetailsArray,
        });

    }catch(error){
        console.error("Error fetching invoice details:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// storing new invoice details from edit invoice page

app.put("/EditPerformaInvoice",async (req,res)=>{
    const connection = await db.promise().getConnection();

    try{
        await connection.beginTransaction();

        const newData = req.body.new;
        const oldinvoiceData = req.body.old.invoiceData;
        const oldorderData =[];
        req.body.old.orders.forEach(order=>{
            oldorderData.push(order);
        });
        oldorderData.forEach((obj,index)=>{
        oldorderData[index] = obj.orderDetails;
        });
        oldorderData.forEach((arr,index)=>{
            arr.forEach(value=>{
                oldorderData[index] = value;
            })
        });
        let newTotal = 0;
        newData.productAmount.forEach((amount,index)=>{
            newTotal += amount*newData.unitPrice[index];
        });

        console.log('old invoicedata:', oldinvoiceData);
        console.log('old orderdata',oldorderData);
        console.log('new data: ',newData);

        const query3 = 'UPDATE invoice_table SET invoice_number = ?, customer_id = ?, order_date = ?, shipping_date = ?, loading_port = ?, shipping_port = ?, total = ? WHERE invoice_number = ? AND customer_id = ? AND order_date = ? AND shipping_date = ? AND loading_port = ? AND shipping_port = ? AND total = ?';
        await connection.query(query3,[newData.invoiceNum,newData.customerID,newData.orderDate,newData.shippingDate,newData.loadingPort,newData.shippingPort,newTotal,oldinvoiceData.invoice_number,oldinvoiceData.customer_id,oldinvoiceData.order_date,oldinvoiceData.shipping_date,oldinvoiceData.loading_port,oldinvoiceData.shipping_port,oldinvoiceData.total]);
        
        await Promise.all(oldorderData.map(async (order,index)=>{
            const query2 = 'UPDATE order_table SET invoice_number = ?, order_number = ? WHERE invoice_number = ? AND order_number = ?';
            await connection.query(query2,[newData.invoiceNum, newData.orderNumber[index], oldinvoiceData.invoice_number, order.order_number]);
        }));

        await Promise.all(oldorderData.map(async (order, index) => {
            const query1 = 'UPDATE orderDetail_table SET order_number = ?, article_number = ?, article_amount = ?, unit_price = ?,currency = ? WHERE order_number = ? AND article_number = ? AND article_amount = ? AND unit_price = ? AND currency= ? ';
            await connection.query(query1,[newData.orderNumber[index],newData.productNumber[index],newData.productAmount[index],newData.unitPrice[index],newData.currency[index],order.order_number,order.article_number,order.article_amount,order.unit_price,order.currency]);
        }));        
            
        await connection.commit()
        res.json({message: 'INVOICE UPDATED SUCCESSFULLY'});

    } catch (err){
        await connection.rollback(); // Rollback if any error occurs
        console.error("Error updating invoice:", err);
        res.status(500).json({ error: "Server error updating invoice" });
    } finally {
        connection.release(); // Release connection back to the pool
    }
    
});

app.listen(port,()=>{
    console.log("server is running on port " + port);
});