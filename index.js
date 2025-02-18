import express from "express";
import bodyParser from "body-parser";
import mysql2 from "mysql2";
import {dirname} from "path";
import { fileURLToPath, pathToFileURL } from "url";
import methodOverride from "method-override";
import session from "express-session";
import { group } from "console";

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
app.use(session({
    secret: 'naumanasgharr', 
    resave: false,
    saveUninitialized: true
  }));

function ensureArray(value) {
    return Array.isArray(value) ? value : [value];
}
function flattenObject(obj) {
    Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key])) {
            obj[key] = obj[key].flat(); // Flatten nested arrays
        }
    });
    return obj;
}

// MAIN PAGE

app.get("/",(req,res)=>{
    res.sendFile(__dir + "/public/HTML/main.html");
    console.log("sent");
});

// GENERATING PERFORMA INVOICE
var performaData = null;
app.post("/performaInvoice",(req,res)=>{
    console.log("Request received at performaInvoice");
    req.session.pData = req.body;
    res.json({ message: "Order processed successfully"});
});

// saving invoice to db
app.post("/api/saveInvoice",async (req,res)=>{

    const {invoiceData, productData, total} = req.body;
    const invoiceNumber = invoiceData.invoiceNum;
    const customerID = invoiceData.customerID;
    const orderDate = invoiceData.orderDate;
    const loadingPort = invoiceData.loadingPort;
    const shippingPort = invoiceData.shippingPort;
    const shipmentDate = invoiceData.shipmentDate;
    const orderNumberArray =[]; 
    invoiceData.orders.forEach(order=>{
        orderNumberArray.push(order.orderNumber);
    });

    const connection = await db.promise().getConnection();
    try{
        await connection.beginTransaction();

        const query1 = 'INSERT INTO invoice_table(invoice_number,customer_id,order_date,shipping_date,loading_port,shipping_port,total) VALUES (?,?,?,?,?,?,?)';
        const query2 = 'INSERT INTO order_table(invoice_number,order_number) VALUES (?,?)';
        const query3 = 'INSERT INTO orderDetail_table(order_number,article_number,article_amount,unit_price,currency) VALUES (?,?,?,?,?)';
    
        await connection.query(query1,[invoiceNumber,customerID, orderDate, shipmentDate, loadingPort,shippingPort, total]);
        
        for(var i = 0; i<orderNumberArray.length;i++){
            await connection.query(query2,[invoiceNumber,orderNumberArray[i]]);
        }

        invoiceData.orders.forEach(async order=>{
            const orderNo = order.orderNumber;
            order.products.forEach(async product=>{
                await connection.query(query3,[orderNo,product.productNumber,product.productAmount,product.unitPrice,product.currency]);
            });
        });

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
        
            res.status(200).json({message:'Article linked Successfully! ✅✅'});    
    });
});

// SENDING DATA TO performa1.HTML

app.get("/api/performa",(req,res)=>{
    // form data error check
    const performaData = req.session.pData;
    if(!performaData){
        res.status(404).json({error: 'no data available!'});
    }
    //flattenObject(performaData);
    // extracting customer_id and article_number from form data
    const{customerID,orders} = performaData;
    /////////
    const articleNumbersArray = [];
    orders.forEach(order=>{
        order.products.forEach(product=>{
            articleNumbersArray.push(product.productNumber);
        });
    }); 

    // SQL query for retrieving customer data related to customerid recieved from form data/ used nested queries (3)
    const query1 = 'SELECT * FROM customer_table WHERE id = ?'; 
    db.query(query1,[customerID],(err1,customerResult)=>{
        if(err1){
            console.log('error fetching data');
            res.status(500).json({error: 'error fetching data'});
        }
        
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
                    //console.log(products);
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

// sending data for order bank
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
                return {orderDetails};
            })
        );
        const groupedOrders = orderDetailsArray.reduce((acc,order)=>{
            order.orderDetails.forEach(detail=>{
                const orderNumber = detail.order_number;
                if (!acc[orderNumber]) {
                    acc[orderNumber] = {
                        orderNumber: orderNumber,
                        orderDetails: []
                    };
                }   
                acc[orderNumber].orderDetails.push(detail);
            });
            return acc;
        },{});
        const groupedOrderObjects = Object.values(groupedOrders);
        groupedOrderObjects.forEach(obj=>{
            obj.orderDetails.forEach(detail=>{
                delete detail.order_number;
            });
        });
        //console.log("grouped orders", JSON.stringify(groupedOrderObjects,null,4));
        
        
        
        res.json({
            invoiceData: invoiceData[0],
            orders: groupedOrderObjects,
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
       //const originalData = req.body.originalData;
       const oldInvoiceData = req.body.old.invoiceData;
       const oldOrderData = req.body.old.orders;
       const oldOrderNumbers = oldOrderData.map(order=>order.orderNumber);
       const newOrders = newData.orders;
       let newTotal = 0;
        newOrders.forEach(order=>{
            order.products.forEach(product=>{
                newTotal += product.productAmount*product.unitPrice;
            });
        });
        const newOrderNumbers = [];
        newData.orders.forEach(order=>{
             newOrderNumbers.push(order.orderNumber);     
        }); 
       console.log(newOrderNumbers);
       if(newOrders.length>0){
       await connection.query('DELETE FROM orderDetail_table WHERE order_number IN (?)',[oldOrderNumbers]);
       await connection.query('DELETE FROM order_table WHERE order_number IN (?)',[oldOrderNumbers]);
       await connection.query('DELETE FROM invoice_table WHERE invoice_number =?',[oldInvoiceData.invoice_number]);
       }

       await connection.query('INSERT INTO invoice_table(invoice_number, customer_id, order_date, shipping_date, loading_port, shipping_port, total) VALUES (?, ?, ?, ?, ?, ?, ?)',[newData.invoiceNum, newData.customerID, newData.orderDate, newData.shipmentDate, newData.loadingPort, newData.shippingPort, newTotal]); 
        
       await Promise.all(newOrderNumbers.map(async number => {
            await connection.query('INSERT INTO order_table(invoice_number, order_number) VALUES (?, ?)', [newData.invoiceNum, number]);
       }));

        await Promise.all(newData.orders.map(async order => {
            await Promise.all(order.products.map(async product => {
                await connection.query(
                    'INSERT INTO orderDetail_table(order_number, article_number, article_amount, unit_price, currency) VALUES (?, ?, ?, ?, ?)',
                    [order.orderNumber, product.productNumber, product.productAmount, product.unitPrice, product.currency]
                );
            }));
        }));

        await connection.commit();
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