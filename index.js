import express from "express";
import bodyParser from "body-parser";
import mysql2 from "mysql2";
import {dirname} from "path";
import { fileURLToPath, pathToFileURL } from "url";
import methodOverride from "method-override";
import session from "express-session";
import { group } from "console";
import dotenv from "dotenv";
import { connect } from "http2";
dotenv.config();
const db = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
    //console.log("Request received at performaInvoice",req.body);
    req.session.pData = req.body;
    res.json({ message: "Order processed successfully"});
});

// saving invoice to db
app.post("/saveInvoice",async (req,res)=>{
    console.log(JSON.stringify(req.body,null,4));
    const {invoiceData, total} = req.body;
    //const invoiceNumber = invoiceData.invoiceNum;
    const { customerID, orderDate, loadingPort, shippingPort, shipmentDate, orders } = invoiceData;
    const orderNumberArray = orders.map(order => order.orderNumber); 
    const articleNumberArray = orders.map(order =>order.products.map(product=>product.productNumber));
    const flatArticleNumberArray = articleNumberArray.flat();
    console.log(orderNumberArray);
    console.log(flatArticleNumberArray);
    const connection = await db.promise().getConnection();
    try{
        await connection.beginTransaction();

        const [articleIdArray] = await connection.query('SELECT id,article_number FROM customer_article WHERE customer_id = ? AND article_number IN (?)',[customerID,flatArticleNumberArray]);
        const articleIDMap = Object.fromEntries(articleIdArray.map(article => [article.article_number, article.id]));
        const [invoiceResult] =  await connection.query('INSERT INTO invoice_table(customer_id,order_date,shipping_date,loading_port,shipping_port,total) VALUES (?,?,?,?,?,?)',[customerID, orderDate, shipmentDate, loadingPort,shippingPort, total]);
        const invoiceNumber = invoiceResult.insertId;
        
        const orderQueries = orderNumberArray.map(async orderNumber=>{
            await connection.query('INSERT INTO order_table(invoice_number,order_number) VALUES (?,?)',[invoiceNumber,orderNumber]);
        });
        await Promise.all(orderQueries);
        
        const [orderRows] = await connection.query('SELECT id, order_number FROM order_table WHERE invoice_number = ?',[invoiceNumber]);
        const orderIDMap = Object.fromEntries(orderRows.map(order => [order.order_number, order.id]));
        let index = 0; 
        const orderDetailQueries = orders.flatMap(order =>{
            const orderID = orderIDMap[order.orderNumber]; // Assign correct order_id
            return order.products.map(product =>
                connection.query(
                    'INSERT INTO orderDetail_table(order_id, article_id, article_amount, unit_price, currency) VALUES (?, ?, ?, ?, ?)',
                    [orderID, articleIDMap[product.productNumber], product.productAmount, product.unitPrice, product.currency]
                )
            );
        });
        await Promise.all(orderDetailQueries);

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
    const {customerName, customerAddress, country, phoneNumber, officeNumber, email, VATnumber, PObox, website, shippingPort} = req.body;   
    const query = 'INSERT INTO customer_table (name, phone_number, email, address, country, VAT_number, office_number, website, PO_box, shipping_port) VALUES (?,?,?,?,?,?,?,?,?,?)';
    db.query(query, [customerName, phoneNumber, email, customerAddress, country, VATnumber, officeNumber, website, PObox,shippingPort], (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).send('Failed to insert data');
          return;
        }
        console.log('customer added!');
        res.status(200).json({message: 'Customer added successfully!'});
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

// SENDING CUSTOMER NAMES AND IDs TO FORMS
app.get("/api/customerNames",(req,res)=>{
    db.query('SELECT id,name FROM customer_table',(err,names)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.json(names);
        } 
    });
});

// SENDING CUSTOMER SHIPPING PORT TO NEWORDER
app.get('/api/customerShippingPort',(req,res)=>{
    const customerID = req.query.customerID;
    db.query('SELECT shipping_port FROM customer_table WHERE id = ?;',[customerID],(err,result)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.json(result);
        } 
    });
});

// SENDING PRODUCT ID AND DESC TO ARTICLE LINK FORM
app.get("/api/productIdAndDesc",(req,res)=>{
    db.query('SELECT id, description FROM product_table',(err,results)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.json(results);
        } 
    });
});

 // INSERTING PRODUCT DATA INTO DB

app.post("/productForm",(req,res)=>{
    const {productName, productDesc, materialComposition, productWeight, weightUnit, weightPacking, productSize, productCode, cartonLength, cartonHeight, cartonWidth, unitPackingType, cartonPackingType, unitPacking, cartonPacking} = req.body;
    
    const query = 'INSERT INTO product_table (category, description, hs_code, size, carton_length, carton_width, carton_height, weight, material_composition, weight_units, unit_packing_type, carton_packing_type, weight_packing_type, unit_packing, carton_packing) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    db.query(query, [productName,productDesc,productCode,productSize,cartonLength,cartonWidth,cartonHeight,productWeight, materialComposition, weightUnit, unitPackingType, cartonPackingType, weightPacking, unitPacking, cartonPacking], (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).send('Failed to insert data');
          return;
        }
        res.status(200).json({message: 'Product Added!'});
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

app.get('/api/articleNumbersAndNames',(req,res)=>{
    const customerID = req.query.customerID;
    const query = `SELECT customer_article.article_number, product_table.description FROM customer_article INNER JOIN product_table ON customer_article.product_id = product_table.id WHERE customer_article.customer_id = ?;`;
    db.query(query,[customerID],(err,result)=>{
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query failed');
        }
        res.json(result);
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

    const query = 'SELECT invoice_number FROM invoice_table;'
    db.query(query,(err,invoiceNum)=>{
        if(err){
            console.log('error fetching data');
            res.status(500).json({error: 'error fetching data'});
        }
        
            console.log(invoiceNum);           
        
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
                    const query3 = 'SELECT * FROM product_table WHERE id = ?';
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
                        //console.log(customerResult[0]);
                        // Once all queries are completed, send the response
                        if (completedQuerries === articleNumbersArray.length) {
                            if(invoiceNum.length != 0){
                                res.json({
                                    performa: performaData,
                                    customer: customerResult[0],
                                    products: products,
                                    invoiceNumber: invoiceNum[invoiceNum.length-1].invoice_number + 1
                                });
                            }else{
                                res.json({
                                    performa: performaData,
                                    customer: customerResult[0],
                                    products: products,
                                    invoiceNumber: 1500
                                });
                            }
                        }
                    });
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
app.get('/api/orderList', async (req,res)=>{
   /* const query1 = 'SELECT id,name FROM customer_table INNER JOIN invoice_table ON customer_table.id = invoice_table.customer_id';
    const query2 = 'SELECT * FROM order_table INNER JOIN invoice_table ON order_table.invoice_number = invoice_table.invoice_number';
    const query3 = 'SELECT * FROM orderDetail_table INNER JOIN order_table ON orderDetail_table.order_id = order_table.id';
    const query4 = 'SELECT * FROM customer_article INNER JOIN orderDetail_table ON customer_article.id = orderDetail_table.article_id';
    const query5 = 'SELECT * FROM product_table INNER JOIN customer_article ON product_table.id = customer_article.product_id';
    db.query(query1,(err1,customerData)=>{
        if(err1){
            res.status(500).send({error: 'error fetching data'});
        }
        console.log("customer data: ");
        console.log(customerData);
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
                console.log("order details: ");
                console.log(orderData);
                db.query(query4,(err4,articleData)=>{
                    if(err4){
                        res.status(500).send({error: 'error fetching data'});
                    }
                    console.log("article data: ");
                    console.log(articleData);
                    db.query(query5,(err5,productData)=>{
                        if(err4){
                            res.status(500).send({error: 'error fetching data'});
                        }
                        console.log("product data: ");
                        console.log(productData);

                        const invoicesMap = {};

                        orderData.forEach(order => {
                            const invoice = invoiceData.find(inv => inv.id === order.id);
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
                            const articleDetails = articleData.find(a => a.order_id === order.id && a.id === order.article_id);
                            if (!articleDetails) return;

                            // Step 4: Find corresponding product details
                            const productDetails = productData.find(p => p.id === articleDetails.product_id);
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
    });*/
    
    try {
        const connection = await db.promise().getConnection();

        // ✅ 1. Fetch Invoice Data with Customer Names
        const [invoiceData] = await connection.query(
            `SELECT invoice_table.invoice_number, invoice_table.customer_id, 
                    invoice_table.order_date, invoice_table.shipping_date, 
                    invoice_table.loading_port, invoice_table.shipping_port, 
                    invoice_table.total, customer_table.name AS customer_name
            FROM invoice_table
            INNER JOIN customer_table ON invoice_table.customer_id = customer_table.id`
        );

        // ✅ 2. Fetch Orders for Each Invoice
        const [orderData] = await connection.query(
            `SELECT order_table.id AS order_id, order_table.invoice_number, order_table.order_number
            FROM order_table`
        );

        // ✅ 3. Fetch Order Details (Products in Each Order)
        const [orderDetailData] = await connection.query(
            `SELECT orderDetail_table.order_id, orderDetail_table.article_id, orderDetail_table.article_amount,
                    orderDetail_table.unit_price, orderDetail_table.currency, 
                    customer_article.article_number, customer_article.product_id
            FROM orderDetail_table
            INNER JOIN customer_article ON orderDetail_table.article_id = customer_article.id`
        );

        // ✅ 4. Fetch Product Data (Description, HS Code, etc.)
        const [productData] = await connection.query(`SELECT product_table.id AS product_id, product_table.description, product_table.hs_code, product_table.size, product_table.category FROM product_table`);

        connection.release();

        // ✅ 5. Construct the Response Object
        const invoicesMap = {};

        orderData.forEach(order => {
            const invoice = invoiceData.find(inv => inv.invoice_number === order.invoice_number);
            if (!invoice) return;

            if (!invoicesMap[invoice.invoice_number]) {
                invoicesMap[invoice.invoice_number] = {
                    invoice_number: invoice.invoice_number,
                    customer: {
                        id: invoice.customer_id,
                        name: invoice.customer_name
                    },
                    order_date: invoice.order_date,
                    shipping_date: invoice.shipping_date,
                    loading_port: invoice.loading_port,
                    shipping_port: invoice.shipping_port,
                    total: invoice.total,
                    orders: []
                };
            }

            let existingOrder = invoicesMap[invoice.invoice_number].orders.find(o => o.order_number === order.order_number);

            if (!existingOrder) {
                existingOrder = {
                    order_number: order.order_number,
                    articles: []
                };
                invoicesMap[invoice.invoice_number].orders.push(existingOrder);
            }

            // ✅ 6. Add Articles to the Order
            const orderDetails = orderDetailData.filter(od => od.order_id === order.order_id);
            orderDetails.forEach(detail => {
                const product = productData.find(p => p.product_id === detail.product_id);
                if (!product) return;

                existingOrder.articles.push({
                    article_number: detail.article_number,
                    article_amount: detail.article_amount,
                    unit_price: detail.unit_price,
                    currency: detail.currency,
                    product: {
                        description: product.description,
                        hs_code: product.hs_code,
                        size: product.size,
                        category: product.category
                    }
                });
            });
        });

        // ✅ 7. Convert to Array and Send Response
        const invoicesArray = Object.values(invoicesMap);
        res.json(invoicesArray);

    } catch (error) {
        console.error("Error fetching order list:", error);
        res.status(500).json({ error: "Server error fetching order list" });
    }
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
        const connection = await db.promise().getConnection();
        const [invoiceData] = await db.promise().query('SELECT * FROM invoice_table WHERE invoice_number = ?',[invoiceNumber]);
        if (invoiceData.length === 0){
            return res.status(404).json({ error: "Invoice not found" });
        }

        /*const [orderNumbers] = await db.promise().query('SELECT * FROM order_table WHERE invoice_number = ?',[invoiceNumber]);
        if(orderNumbers.length == 0){
            res.status(500).json({ invoiceData: invoiceData[0], orders: [] });
        }

        const orderDetailsArray = await Promise.all(
            orderNumbers.map(async (order) => {
                const [orderDetails] = await db.promise().query("SELECT * FROM orderDetail_table WHERE order_id = ?",[order.id]);
                return {orderDetails};
            })
        );
        const articleIdsArray = [];
            orderDetailsArray.forEach(order=>{
                order.orderDetails.forEach(detail=>articleIdsArray.push(detail.article_id));
            });

        //console.log("article numbers,",articleNumbersArray);
        const articleNumbersArray = await Promise.all(
            articleIdsArray.map(async (id) => {
                const [articleNumbers] = await db.promise().query("SELECT * FROM customer_article WHERE id = ?",[id]);
                return articleNumbers;
            })
        );
        const flatArticleArray = articleNumbersArray.flat();

        let index = 0;
        orderDetailsArray.forEach(order=>{
            order.orderDetails.forEach(detail =>{
                detail.article_number = flatArticleArray[index].article_number;
                index++;
            })
        });
        
        console.log(JSON.stringify(orderDetailsArray,null,4));
        const groupedOrders = orderDetailsArray.reduce((acc,order,index)=>{
            order.orderDetails.forEach(detail=>{
                if(orderNumbers[index].id == detail.order_id){
                    var orderNumber = orderNumbers[index].order_number;
                    
                }     
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
        });*/
        const [orderDetails] = await connection.query(
            `SELECT od.id AS orderDetailId, od.order_id, od.article_id, od.article_amount, 
                od.unit_price, od.currency, o.order_number, o.id AS orderId, 
                ca.article_number
            FROM orderDetail_table od
            INNER JOIN order_table o ON od.order_id = o.id
            INNER JOIN customer_article ca ON od.article_id = ca.id
            WHERE o.invoice_number = ?`,
        [invoiceNumber]);
        
        connection.release();
        console.log(orderDetails);    
        const groupedOrders = orderDetails.reduce((acc, detail) => {
            if (!acc[detail.order_number]) {
                acc[detail.order_number] = {
                    orderNumber: detail.order_number,
                    order_id: detail.order_id,
                    orderDetails: [],
                };
            }
            acc[detail.order_number].orderDetails.push({
                detailId: detail.orderDetailId,
                article_id: detail.article_id,
                article_amount: detail.article_amount,
                unit_price: detail.unit_price,
                currency: detail.currency,
                article_number: detail.article_number,
            });
            return acc;
        }, {});

        // Convert object to an array
        const groupedOrderObjects = Object.values(groupedOrders);

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
    console.log("request recieved at editinvoice");

    try{
        await connection.beginTransaction();
        const newData = req.body.new;
        const invoiceNumber = newData.invoiceNum;
        const orders = newData.orders;
        const deletedOrders = newData.deletedOrders;
        const deletedOrderDetails = newData.deletedOrderDetails;

        //CALCULATING NEW TOTAL
        let newTotal = 0;
        orders.forEach(order=>{
            order.products.forEach(product=>{
                newTotal += product.productAmount*product.unitPrice;
            });
        });

        const UpdatedOrders = [];
        const newOrders = [];
        orders.forEach(order=>{
            if(order.orderId != null){
                UpdatedOrders.push(order);
            }else{
                newOrders.push(order);
            }
        });
        const orderDetailsArray = UpdatedOrders.map(order=>order.products);
        const orderDetails = orderDetailsArray.flat();
        const oldOrderDetails = [];
        const newOrderDetails = [];
        orderDetails.forEach(detail=>{
            if(detail.detailId != null){
                oldOrderDetails.push(detail);
            }else{
                newOrderDetails.push(detail);
            }
        });
        console.log(orderDetails);
        //console.log("updated orders: ",UpdatedOrders);
        //console.log("new orders", JSON.stringify(UpdatedOrders,null,4));

        // DELETING ORDERS IF ANY
        if(deletedOrders.length>0){
            deletedOrders.map(async order=>{
                await connection.query('DELETE FROM order_table WHERE id = ?',[order]);
            })  
        }
        if(deletedOrderDetails.length>0){
            deletedOrderDetails.map(async detail=>{
                await connection.query('DELETE FROM orderDetail_table WHERE id = ?',[detail]);
            });
        }
        
        // UPDATING INVOICE DETAILS
        await connection.query('UPDATE invoice_table SET customer_id = ?, order_date = ?, shipping_date = ?, loading_port = ?, total = ?, shipping_port = ? WHERE invoice_number= ?;',[newData.customerID, newData.orderDate, newData.shippingDate, newData.loadingPort, newTotal, newData.shippingPort,  newData.invoiceNum]);

        //UPDATING ORDER_TABLE
        const updateOrderTable = UpdatedOrders.map(order=>
            connection.query('UPDATE order_table SET order_number = ? WHERE id = ?',[order.orderNumber,order.orderId])
        );
        await Promise.all(updateOrderTable);
        
        //UPDATING orderDetail_table
        const updateOrderDetails = oldOrderDetails.map(detail=>
            connection.query('UPDATE orderDetail_table SET order_id = ?,  article_id = ?, article_amount = ?, unit_price = ?, currency = ? WHERE id = ?',[detail.orderid,detail.productId,detail.productAmount,detail.unitPrice,detail.currency,detail.detailId])
        );
        await Promise.all(updateOrderDetails);

        if(newOrderDetails.length>0){
            const articleNum = newOrderDetails.map(detail=>detail.productNumber);
            const [articleRows] = await connection.query(
                'SELECT id, article_number FROM customer_article WHERE article_number IN (?)',[articleNum]
            );
            const articleIdMap = Object.fromEntries(articleRows.map(article => [article.article_number, article.id]));
            const insertNewOrderDetails = newOrderDetails.map(detail=>
                connection.query('INSERT INTO orderDetail_table(order_id,article_id,article_amount,unit_price,currency) VALUES (?,?,?,?,?)',[detail.orderid,articleIdMap[detail.productNumber],detail.productAmount,detail.unitPrice,detail.currency])
            )
            await Promise.all(insertNewOrderDetails);
        }

        //ADDING NEW ORDERS IF ANY
        if (newOrders.length > 0) {
            // ✅ Step 1: Insert into order_table and retrieve order IDs
            const orderInserts = newOrders.map(async (order) => {
                const [orderResult] = await connection.query(
                    'INSERT INTO order_table(invoice_number, order_number) VALUES (?, ?)',
                    [invoiceNumber, order.orderNumber]
                );
                return { orderId: orderResult.insertId, order }; // Save orderId for later use
            });
        
            // Wait for all orders to be inserted and fetch their IDs
            const insertedOrders = await Promise.all(orderInserts);
        
            // Retrieve article IDs from customer_article
            const articleNumbers = newOrders.flatMap(order => order.products.map(product => product.productNumber));
            const [articleRows] = await connection.query(
                'SELECT id, article_number FROM customer_article WHERE article_number IN (?)',
                [articleNumbers]
            );
        
            // Create a mapping of article_number → article_id
            const articleIdMap = Object.fromEntries(articleRows.map(article => [article.article_number, article.id]));
        
            // Insert into orderDetail_table
            const orderDetailInserts = insertedOrders.flatMap(({ orderId, order }) =>
                order.products.map(product =>
                    connection.query(
                        'INSERT INTO orderDetail_table(order_id, article_id, article_amount, unit_price, currency) VALUES (?, ?, ?, ?, ?)',
                        [orderId, articleIdMap[product.productNumber], product.productAmount, product.unitPrice, product.currency]
                    )
                )
            );
        
            // Execute all order detail inserts
            await Promise.all(orderDetailInserts);
        }

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

app.post("/productCategory",(req,res)=>{
    const {prodCategory} = req.body;
    db.query('INSERT INTO productCategory_table(product_category) VALUES (?);',[prodCategory],(err,result)=>{
        if(err){
            console.error('Error inserting data:', err);
            res.status(500).send('Failed to insert data');
            return;
        }
        res.status(200).json({message: "Category Added!"});
    });
});
app.get("/api/productCategoryGet",(req,res)=>{
    db.query('SELECT product_category FROM productCategory_table;',(err,result)=>{
        if(err){
            console.error('Error inserting data:', err);
            res.status(500).send('Failed to insert data');
            return;
        }
        console.log(result);
        res.json(result);
    });
});

app.listen(port,()=>{
    console.log("server is running on port " + port);
});