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
import bcrypt from "bcryptjs";
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
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
const __dir = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dir + "/public"));
app.use(session({
    secret: 'naumanasgharr', 
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'lax'
    }
  }));

 //auth function
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/");
    }
    console.log('session exists');
    next();
} 

// LOGIN PAGE
app.get("/",(req,res)=>{
    //res.sendFile(__dir + "/public/HTML/main.html");
    res.sendFile(__dir + "/public/HTML/Forms/login.html");
    console.log("sent");
});

// client side redirection auth check
app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

//error page
app.use((req, res, next) => {
    const publicRoutes = ["/", "/login", "/logout"]; // Add other public routes if needed

    if (!req.session.user && !publicRoutes.includes(req.path)) {
        return res.status(401).send("Unauthorized! Please log in.");
    }
    next();
});

// login page
app.post('/login',async (req,res)=>{
    const {username,password} = req.body;
    console.log(username, password);
    try{
        const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?',[username]);
        console.log(rows)
        if(rows.length == 0 || !rows || rows == null) {
            return res.status(401).send('USERNAME OR PASSWORD IS INCORRECT');
        }
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password,user.password);
        if(!passwordMatch) {
            return res.status(401).send('USERNAME OR PASSWORD IS INCORRECT');
        }
        req.session.user = {id: user.id, username: user.username};
        console.log('success');
        res.status(200).send('success');
    }
    catch (error){
        console.error(error);
        res.status(500).send("Server error");
    }
});

//logout
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Logout failed");
        console.log('session ended');
        res.status(200).send('success');
    });
});

// MAIN PAGE
app.get('/main',requireAuth,(req,res)=>{
    res.sendFile(__dir + "/public/HTML/main.html");
});

// GENERATING PERFORMA INVOICE
app.post("/performaInvoice",requireAuth,(req,res)=>{
    //console.log("Request received at performaInvoice",req.body);
    req.session.pData = req.body;
    res.json({ message: "Order processed successfully"});
});

// saving performa invoice to db
app.post("/saveInvoice",requireAuth,async (req,res)=>{
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
        const orderDetailQueries = orders.map(order =>{
            return order.products.map(async product =>{
                const orderID = orderIDMap[order.orderNumber];
                const [result] = await connection.query(
                    'INSERT INTO orderdetail_table(order_id, article_id, article_amount, unit_price, currency,status) VALUES (?, ?, ?, ?, ?,?)',
                    [orderID, articleIDMap[product.productNumber], product.productAmount, product.unitPrice, product.currency,'PENDING']
                );
                return { orderDetailID: result.insertId, orderID, articleID: articleIDMap[product.productNumber],articleAmount: product.productAmount }; 
            
            }); 
        });
        const insertedOrderDetails = await Promise.all(orderDetailQueries.flat());

        //adding into balance table
        console.log(insertedOrderDetails);
        const balanceQueries = insertedOrderDetails.map(async detail=>{
            return connection.query('INSERT INTO balance_table(order_detail_id, article_id, balance) VALUES (?,?,?)',[detail.orderDetailID,detail.articleID,detail.articleAmount]);
        });
        await Promise.all(balanceQueries);

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
app.post("/customerForm",requireAuth,(req,res)=>{
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
app.get("/api/customerReport",requireAuth,(req,res)=>{
    const src = req.query.src;
    if(src == 'editCustomer'){
        db.query('SELECT name,id FROM customer_table',(err,results)=>{
            if(err){
                res.status(500).send({error: 'error fetching data'});
            } else{
                res.status(200).json(results);
            }    
        });
    }else{
        db.query('SELECT * FROM customer_table',(err,results)=>{
            if(err){
                res.status(500).send({error: 'error fetching data'});
            } else{
                res.status(200).json(results);
            }
        });
    }
    
});

// sending customer data to edit customer
app.get('/api/editCustomerData',requireAuth,(req,res)=>{
    const id = req.query.id;
    db.query('SELECT * FROM customer_table WHERE id = ?',[id],(err,results)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.status(200).json(results);
        }
    });
});

// saving edited customer details
app.put('/editCustomer',requireAuth,async (req,res)=>{
    console.log(req.body);
    const data = req.body;
    const connection = await db.promise().getConnection();
    try{
        connection.beginTransaction();

        await connection.query('UPDATE customer_table SET name=?,phone_number=?,email=?,address=?,country=?,VAT_number=?,office_number=?,website=?,PO_box=?,shipping_port=? WHERE id = ?',[data.name,data.phoneNumber,data.email,data.address,data.country,data.VATnumber,data.officeNumber,data.website,data.PObox,data.shippingPort,data.id]);
        res.status(200).json({message: 'completed'});
        await connection.commit();
    }
    catch{
        await connection.rollback();
        console.error("Error updating customer:", error);
        res.status(500).json({ error: "Failed to update customer data" });
    }
    finally{
        connection.release();
    }
});

// SENDING CUSTOMER NAMES AND IDs TO FORMS
app.get("/api/customerNames",requireAuth,(req,res)=>{
    db.query('SELECT id,name FROM customer_table',(err,names)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.json(names);
        } 
    });
});

// SENDING CUSTOMER SHIPPING PORT TO NEWORDER
app.get('/api/customerShippingPort',requireAuth,(req,res)=>{
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
app.get("/api/productIdAndDesc",requireAuth,(req,res)=>{
    db.query('SELECT id, description FROM product_table',(err,results)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.json(results);
        } 
    });
});

 // INSERTING PRODUCT DATA INTO DB
app.post("/productForm",requireAuth,(req,res)=>{
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
app.post("/articleLink",requireAuth,(req,res)=>{
    console.log(req.body);
    const {customerId, articleNumber, productNumber,cartonPacking,cartonPackingType,unitPacking,unitPackingType,hsCode,cartonLength,cartonWidth,cartonHeight,description} = req.body;
    const query = 'INSERT INTO customer_article(customer_id,product_id,article_number,unit_packing,carton_packing,carton_length,carton_width,carton_height,carton_packing_type,unit_packing_type,hs_code,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
    db.query(query, [customerId,productNumber,articleNumber,unitPacking,cartonPacking,cartonLength,cartonWidth,cartonHeight,cartonPackingType,unitPackingType,hsCode,description], (err,result)=>{
        if(err){
            console.error('Error inserting data:', err);
            res.status(500).send('Failed to insert data');
            return;
        }
        
            res.status(200).json({message:'Article linked Successfully! ✅✅'});    
    });
});

//sending article names and numbers to newOrder.html
app.get('/api/articleNumbersAndNames',requireAuth,(req,res)=>{
    const customerID = req.query.customerID;
    const query = `SELECT article_number,description FROM customer_article WHERE customer_id = ?;`;
    db.query(query,[customerID],(err,result)=>{
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query failed');
        }
        res.json(result);
    });
});

//sending articleNumbers to shippingInvoice.html
app.get('/api/articleNumbersAndNamesForShipmentInvoice',requireAuth,(req,res)=>{
    const customerID = req.query.customerId;
    console.log(customerID);
    const query = `SELECT customer_article.id AS customer_article_id, customer_article.*, product_table.id AS product_id FROM customer_article INNER JOIN product_table ON customer_article.product_id = product_table.id WHERE customer_article.customer_id = ?`;
    db.query(query,[customerID],(err,result)=>{
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query failed');
        }
        res.json(result);
    });
});

//sending invoice and order numbers to shippingInvoice
app.get('/api/invoiceAndOrderNumbers',requireAuth,(req,res)=>{
    const articleNumber = req.query.articleNumber;
    const query = 'SELECT * FROM invoice_table INNER JOIN order_table ON invoice_table.invoice_number = order_table.invoice_number  INNER JOIN orderdetail_table ON order_table.id = orderdetail_table.order_id INNER JOIN customer_article ON orderdetail_table.article_id = customer_article.id INNER JOIN product_table ON customer_article.product_id = product_table.id INNER JOIN balance_table ON orderdetail_table.id = balance_table.order_detail_id WHERE customer_article.id = ? AND balance_table.balance > 0 ORDER BY invoice_table.timestamp_column ASC';
    db.query(query,[articleNumber],(err,results)=>{
        if(err){
            res.status(500).json({message: 'error fetching orders'});
        }
        console.log(results);
        res.status(200).json(results);
    });
});

//sending orderDetails to shippingInvoice
app.get('/api/orderDetailsShippingInvoiceDisplay',requireAuth,(req,res)=>{
    const orderId = req.query.order_id;
    const articleId = req.query.article_id;
    console.log(orderId,articleId);
    const query = 'SELECT customer_article.*,orderdetail_table.*,balance_table.balance FROM orderdetail_table INNER JOIN customer_article ON orderdetail_table.article_id = customer_article.id INNER JOIN product_table ON product_table.id = customer_article.product_id INNER JOIN balance_table ON orderdetail_table.id = balance_table.order_detail_id WHERE orderdetail_table.order_id = ? AND orderdetail_table.article_id = ? AND balance > 0';
    db.query(query,[orderId,articleId],(err,results)=>{
        if(err){
            res.status(500).json({message: 'error fetching Order Details'});
        }
        console.log(results);
        res.status(200).json(results);
    });
});

// SENDING DATA TO performa1.HTML
app.get("/api/performa",requireAuth,(req,res)=>{
    // form data error check
    const performaData = req.session.pData;
    if(!performaData){
        res.status(404).json({error: 'no data available!'});
    }

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
                const query2 = 'SELECT * FROM customer_article WHERE customer_id = ? AND article_number = ?';
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
                        productResult[0].carton_packing = articleResult[0].carton_packing;
                        productResult[0].unit_packing = articleResult[0].unit_packing;
                        productResult[0].hs_code = articleResult[0].hs_code;
                        productResult[0].carton_packing_type = articleResult[0].carton_packing_type;
                        productResult[0].unit_packing_type = articleResult[0].unit_packing_type;
                        productResult[0].carton_length = articleResult[0].carton_length;
                        productResult[0].carton_width = articleResult[0].carton_width;
                        productResult[0].carton_width = articleResult[0].carton_height;
                        productResult[0].description = articleResult[0].description;
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
                                    invoiceNumber: 222222
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
app.get('/api/productList',requireAuth,(req,res)=>{
    db.query('SELECT * FROM product_table',(err,results)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.json(results);
        }
    });
});

// sending data for performa order bank
app.get('/api/orderList',requireAuth, async (req,res)=>{
    const invoice_number = req.query.invoice_number;
    console.log(invoice_number);
    try {
        const connection = await db.promise().getConnection();

        // ✅ 1. Fetch Invoice Data with Customer Names
        const [invoiceData] = await connection.query(
            `SELECT invoice_table.customer_id, invoice_table.order_date, invoice_table.shipping_date, 
            invoice_table.loading_port, invoice_table.shipping_port, invoice_table.total,
            customer_table.name AS customer_name FROM invoice_table INNER JOIN 
            customer_table ON invoice_table.customer_id = customer_table.id
            WHERE invoice_table.invoice_number = ?`,[invoice_number]
        );

        // ✅ 2. Fetch Orders for Each Invoice
        const [orderData] = await connection.query(
            `SELECT order_table.id AS order_id, order_table.order_number
            FROM order_table WHERE order_table.invoice_number = ?`,[invoice_number]
        );
        console.log('invoiceData',invoiceData);
        console.log('orderData',orderData);


        const orderDetailsData = await Promise.all(
            orderData.map(async (order) => {
                const [rows] = await connection.query(
                    `SELECT orderdetail_table.id,orderdetail_table.order_id, orderdetail_table.article_id, orderdetail_table.article_amount,
                    orderdetail_table.unit_price, orderdetail_table.currency, orderdetail_table.status, 
                    customer_article.article_number, customer_article.product_id, customer_article.description, product_table.hs_code, product_table.size,
                    product_table.category FROM orderdetail_table
                    INNER JOIN customer_article ON orderdetail_table.article_id = customer_article.id
                    INNER JOIN product_table ON customer_article.product_id = product_table.id 
                    WHERE orderdetail_table.order_id = ?`,
                    [order.order_id]
                );
                return rows; // 👈 Ensure only `rows` are returned
            })
        );
        const orderDetailsDataFlat = orderDetailsData.flat();
        console.log('orderDetailsData:',orderDetailsDataFlat);

        connection.release();

        orderData.map(data=>data.details = []);
        console.log(orderData);
        
        orderData.map(order => {
            order.details = orderDetailsDataFlat.filter(detail => detail.order_id === order.order_id);
        });
        console.log(JSON.stringify(orderData,null,4));
        res.json({
            invoice: invoiceData[0],
            orders: orderData
        });
        // ✅ 3. Fetch Order Details (Products in Each Order)
        /*const [orderDetailData] = await connection.query(
            `SELECT orderDetail_table.order_id, orderDetail_table.article_id, orderDetail_table.article_amount,
                    orderDetail_table.unit_price, orderDetail_table.currency, orderDetail_table.status,orderDetail_table.status, 
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
                    status: detail.status,
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
        res.json(invoicesArray);*/

    } catch (error) {
        console.error("Error fetching order list:", error);
        res.status(500).json({ error: "Server error fetching order list" });
    }
});

// select invoice number for edit invoice page
app.get("/api/selectInvoice",requireAuth,(req,res)=>{
    const query = 'SELECT invoice_table.invoice_number,customer_table.name FROM invoice_table INNER JOIN customer_table ON invoice_table.customer_id = customer_table.id';
    db.query(query,(err,invoiceNumbers)=>{
        if(err){
            res.status(500).send({error: 'error loading invoice numbers'});
        }
        res.json(invoiceNumbers);
    });
});

// send selected invoice data to edit invoice page
app.get("/api/invoiceDetails",requireAuth,async (req,res)=>{
    const invoiceNumber = req.query.invoice_number;
    
    try{
        const connection = await db.promise().getConnection();
        const [invoiceData] = await db.promise().query('SELECT * FROM invoice_table WHERE invoice_number = ?',[invoiceNumber]);
        if (invoiceData.length === 0){
            return res.status(404).json({ error: "Invoice not found" });
        }

        const [orderDetails] = await connection.query(
            `SELECT od.id AS orderDetailId, od.order_id, od.article_id, od.article_amount, 
                od.unit_price, od.currency, o.order_number, o.id AS orderId, 
                ca.article_number
            FROM orderdetail_table od
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
app.put("/EditPerformaInvoice",requireAuth,async (req,res)=>{
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
        //console.log(orderDetails);
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
                await connection.query('DELETE FROM orderdetail_table WHERE id = ?',[detail]);
            });
        }
        
        // UPDATING INVOICE DETAILS
        await connection.query('UPDATE invoice_table SET customer_id = ?, order_date = ?, shipping_date = ?, loading_port = ?, total = ?, shipping_port = ? WHERE invoice_number= ?;',[newData.customerID, newData.orderDate, newData.shipmentDate, newData.loadingPort, newTotal, newData.shippingPort,  newData.invoiceNum]);

        //UPDATING ORDER_TABLE
        const updateOrderTable = UpdatedOrders.map(order=>
            connection.query('UPDATE order_table SET order_number = ? WHERE id = ?',[order.orderNumber,order.orderId])
        );
        await Promise.all(updateOrderTable);
        
        //UPDATING orderDetail_table
        const updateOrderDetails = oldOrderDetails.map(detail=>
            connection.query('UPDATE orderdetail_table SET order_id = ?,  article_id = ?, article_amount = ?, unit_price = ?, currency = ?,status=? WHERE id = ?',[detail.orderid,detail.productId,detail.productAmount,detail.unitPrice,detail.currency,'PENDING',detail.detailId])
        );
        await Promise.all(updateOrderDetails);
        
        //updating balance table
        const updateBalanceTable = oldOrderDetails.map(detail=>{
            connection.query('UPDATE balance_table SET balance =?, article_id=? WHERE order_detail_id =? ',[detail.productAmount,detail.productId,detail.detailId]);
        });
        await Promise.all(updateBalanceTable);

        if(newOrderDetails.length>0){
            const articleNum = newOrderDetails.map(detail=>detail.productNumber);
            const [articleRows] = await connection.query(
                'SELECT id, article_number FROM customer_article WHERE article_number IN (?)',[articleNum]
            );
            const articleIdMap = Object.fromEntries(articleRows.map(article => [article.article_number, article.id]));
            const insertNewOrderDetails = newOrderDetails.map(detail=>
                connection.query('INSERT INTO orderdetail_table(order_id,article_id,article_amount,unit_price,currency,status) VALUES (?,?,?,?,?,?)',[detail.orderid,articleIdMap[detail.productNumber],detail.productAmount,detail.unitPrice,detail.currency,'PENDING'])
            );
            const results = await Promise.all(insertNewOrderDetails);
            const orderDetailIds = results.map(([result]) => result.insertId);

            const insertBalanceQueries = newOrderDetails.map((detail,index)=>
                connection.query('INSERT INTO balance_table(order_detail_id,article_id,balance) VALUES (?,?,?)',[orderDetailIds[index],articleIdMap[detail.productNumber],detail.productAmount])
            );
            await Promise.all(insertBalanceQueries);
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
                        'INSERT INTO orderdetail_table(order_id, article_id, article_amount, unit_price, currency,status) VALUES (?, ?, ?, ?, ?,?)',
                        [orderId, articleIdMap[product.productNumber], product.productAmount, product.unitPrice, product.currency,'PENDING']
                    )
                )
            );
            // Execute all order detail inserts
            const results = await Promise.all(orderDetailInserts);
            const insertIds = results.map(([result]) => result.insertId);
            console.log('insertIds: ',insertIds);
            const insertBalanceOrderDetails = insertedOrders.map(order=>order.order);
            console.log(insertBalanceOrderDetails);
            //insert into balance_table;
            const balanceInserts  = insertBalanceOrderDetails.map(order=>{
                order.products.map((product,index)=>{
                    connection.query('INSERT INTO balance_table(order_detail_id,balance,article_id) VALUES (?,?,?)',[insertIds[index],product.productAmount,articleIdMap[product.productNumber]]);
                });
            });
            await Promise.all(balanceInserts);
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

//adding product category into db
app.post("/productCategory",requireAuth,(req,res)=>{
    const {prodCategory} = req.body;
    db.query('INSERT INTO productcategory_table(product_category) VALUES (?);',[prodCategory],(err,result)=>{
        if(err){
            console.error('Error inserting data:', err);
            res.status(500).send('Failed to insert data');
            return;
        }
        res.status(200).json({message: "Category Added!"});
    });
});

//sending product categories to product form
app.get("/api/productCategoryGet",requireAuth,(req,res)=>{
    db.query('SELECT product_category FROM productcategory_table;',(err,result)=>{
        if(err){
            console.error('Error inserting data:', err);
            res.status(500).send('Failed to insert data');
            return;
        }
        console.log(result);
        res.json(result);
    });
});


// recieving data from shipping invoice and redirecting to commercial.html (client-side)
app.post('/shippingInvoice',requireAuth, (req,res)=>{
    req.session.shippingData = req.body;
    if(!req.body){
        res.status(500).json({message: 'failed to receive data!'});
    }
    res.status(200).json({message: 'successfully received data!'});
});

//sending data for display on commercial.html
app.get('/api/commercialInvoice',requireAuth,async (req,res)=>{
    const data = req.session.shippingData;
    console.log(data);
    const invoiceData = data.invoiceData;
    const products = data.products;
    const connection = await db.promise().getConnection();
    try{
        if(invoiceData.src){
            const [r] = await connection.query('SELECT address,country,PO_box FROM customer_table WHERE name = ?',[invoiceData.customerID]);
            var customerDetails = r[0];
            customerDetails.name = invoiceData.customerID;
            var invoiceNumber = invoiceData.invoiceNumber;
        }else{
            const [r] = await connection.query('SELECT name,address,country,PO_box FROM customer_table WHERE id = ?',[invoiceData.customerID]);
            var customerDetails = r[0];
            const [rows] = await connection.query('SELECT invoice_number FROM commercial_invoice_table ORDER BY invoice_number DESC LIMIT 1');
            if(rows.length>0){
                var invoiceNumber = rows[0]?.invoice_number + 1;
            }else{
            var invoiceNumber = 222222;
        }
        }
        
        
        const productDetails = await Promise.all(
            data.products.map(async product=>{ 
                const [rows] = await connection.query('SELECT customer_article.id, customer_article.article_number, customer_article.description,customer_article.hs_code,customer_article.carton_length,customer_article.carton_width,customer_article.carton_height,product_table.size,product_table.category FROM product_table INNER JOIN customer_article ON product_table.id = customer_article.product_id WHERE customer_article.id = ?',[product.productID])
                return rows;
            })
        );
        //console.log('product details: ',productDetails.flat());
        const productDetailsFlat = productDetails.flat();
        products.map(product=>{
            for(var index = 0;index<productDetailsFlat.length; index++){
                if(product.productID == productDetailsFlat[index].id){
                    product.description = productDetailsFlat[index].description;
                    product.size = productDetailsFlat[index].size;
                    product.category = productDetailsFlat[index].category;
                    product.article_number = productDetailsFlat[index].article_number;
                    product.carton_length = productDetailsFlat[index].carton_length;
                    product.carton_width = productDetailsFlat[index].carton_width;
                    product.carton_height = productDetailsFlat[index].carton_height;
                    product.hs_code = productDetailsFlat[index].hs_code;
                }
            }
        });
        invoiceData.invoiceNumber = invoiceNumber;

        await connection.commit();
        res.status(200).json({
            customer: customerDetails,
            invoiceData: invoiceData,
            products: products
        });
    }
    catch(err){
        await connection.rollback(); // Rollback if any error occurs
        console.error("Error updating invoice:", err);
        res.status(500).json({ error: "Server error updating invoice" });
    }
    finally{
        connection.release();
    }
});

// saving commercial invoice
app.get('/SaveCommercialInvoice',requireAuth,async (req,res)=>{
    const data = req.session.shippingData;
    const invoiceData = data.invoiceData;
    
    const connection = await db.promise().getConnection();
    try{
        await connection.beginTransaction();
        
        let totalNetWeight = 0;
        let totalGrossWeight = 0;
        let total = 0;
        const products = [];

        //calculating total net and gross weights
        data.products.forEach(product=>{
            totalNetWeight += (product.cartonNetWeight*product.cartons);
            totalGrossWeight += (product.cartonGrossWeight*product.cartons);
            products.push({id:product.productID, orderId: product.orderId, amount: (product.cartons * product.cartonPacking), unitPrice: product.unitPrice, currency: product.currency, cartons: product.cartons, cartonPacking: product.cartonPacking, unit: product.cartonPackingUnit, net: product.cartonNetWeight, gross: product.cartonGrossWeight});
        });

        //calculating invoice total
        products.forEach(obj=>{
            total += (obj.amount * obj.unitPrice);
        });

        //insert into invoice_table
        const [result] = await connection.query('INSERT INTO commercial_invoice_table(customer_id,fiNo,blNo,fiNoDate,blNoDate,loadingPort,shippingPort,total,total_net_weight,total_gross_weight,shipment_terms,date,shipment_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[invoiceData.customerID, invoiceData.fiNo, invoiceData.blNo, invoiceData.fiNoDate, invoiceData.blNoDate, invoiceData.loadingPort, invoiceData.shippingPort, total, totalNetWeight, totalGrossWeight, invoiceData.shipmentTerms,invoiceData.invoiceDate,invoiceData.shipmentDate]);
        const invoiceNumber = result.insertId;
        
        //insert into commercial_invoice_table
        const insertOrderQueries = products.map(async product=>
            await connection.query('INSERT INTO commercial_invoice_article_table(invoice_number,order_id,article_id,article_amount,cartons,unit_price,carton_gross_weight,carton_net_weight,currency,carton_packing,carton_packing_unit) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[invoiceNumber, product.orderId, product.id, product.amount, product.cartons, product.unitPrice, product.gross, product.net, product.currency, product.cartonPacking, product.unit])
        );
        await Promise.all(insertOrderQueries);  

       await connection.commit();
       res.status(200).json({message: 'Invoice Saved', invoiceNumber});

    }catch(err){
        await connection.rollback(); // Rollback if any error occurs
        console.error("Error updating invoice:", err);
        res.status(500).json({ error: err.message});
    }
    finally{
        connection.release();
    }

});

//sending commercial invoice numbers to forms
app.get('/api/commercialInvoiceNumbers',(req,res)=>{
    db.query('SELECT commercial_invoice_table.invoice_number,commercial_invoice_table.customer_id,customer_table.name FROM commercial_invoice_table INNER JOIN customer_table ON commercial_invoice_table.customer_id = customer_table.id',(err,results)=>{
        if(err){
            console.log(err);
            return res.status(500).json({error: 'error fetching invoice Numbers'});
        }
        if (!results) { // Checking if results is null or undefined
            return res.status(404).json({ error: 'No invoice numbers found' });
        }
        res.status(200).json(results);
    });
});

//sending commercial invoice data tp order bank
app.get('/api/commercialOrderBank',requireAuth,async (req,res)=>{
    const invoice_number = req.query.invoice_number;
    const connection = await db.promise().getConnection();
    
    try{
        await connection.beginTransaction();

        const [invoiceDetails] = await connection.query('SELECT * FROM commercial_invoice_table WHERE invoice_number =?',[invoice_number]);
        const [invoiceArticles] = await connection.query('SELECT * FROM commercial_invoice_article_table WHERE invoice_number =?',[invoice_number]);
        const [customerName] = await connection.query('SELECT name FROM customer_table WHERE id =?',[invoiceDetails[0].customer_id]);
        const articleIds = invoiceArticles.map(article=>article.article_id);

        const articleData = await Promise.all(
            articleIds.map(async id=>{
                const [rows] = await  connection.query('SELECT customer_article.id, customer_article.article_number, customer_article.description, product_table.category, product_table.size FROM customer_article INNER JOIN product_table ON customer_article.product_id = product_table.id WHERE customer_article.id =?',[id])
                return rows;
            })
            
        );
        const articleDataFlat = articleData.flat();

        invoiceArticles.forEach((article,index)=>{
            if(article.article_id == articleDataFlat[index].id){
                article.description = articleDataFlat[index].description;
                article.category = articleDataFlat[index].category;
                article.article_number = articleDataFlat[index].article_number;
                article.size = articleDataFlat[index].size;
            }
        });        
        
        
        res.json({
            invoiceDetails: invoiceDetails[0],
            articles: invoiceArticles,
            name: customerName[0]
        })
        await connection.commit();
    }
    catch(err){
        await connection.rollback(); // Rollback if any error occurs
        console.error("Error updating invoice:", err);
        res.status(500).json({ error: "Server error updating invoice" });
    }
    finally{
        connection.release();
    }
    

});

//updating balances of invoices
app.get('/updateBalances',requireAuth,async (req,res)=>{
    const data = req.session.shippingData;
    const connection = await db.promise().getConnection();

    try{    
        await connection.beginTransaction();

        const products = [];

        //calculating total net and gross weights
        data.products.forEach(product=>{
            products.push({id:product.productID, orderId: product.orderId, amount: (product.cartons * product.cartonPacking), unitPrice: product.unitPrice, currency: product.currency, cartons: product.cartons, cartonPacking: product.cartonPacking, unit: product.cartonPackingUnit, net: product.cartonNetWeight, gross: product.cartonGrossWeight});
        });

        //selecting balances for orderIds
        const balancequeries = await Promise.all(
            products.map(async product=>{
                const [rows] = await connection.query('SELECT balance_table.id, balance_table.order_detail_id,balance_table.article_id,balance_table.balance,balance_table.balance,order_table.id AS order_id FROM balance_table INNER JOIN orderdetail_table ON balance_table.order_detail_id = orderdetail_table.id INNER JOIN order_table ON order_table.id = orderdetail_table.order_id WHERE order_table.id = ? AND balance_table.article_id = ?',[product.orderId,product.id])  
                return rows;
            })
        );
        const balanceFlat = balancequeries.flat();
        
        balanceFlat.map((object,index)=>{
            if(object.article_id == products[index].id && object.order_id == products[index].orderId){
                object.amount = products[index].amount;
            }
        });

        //updating balances
        const balanceOrderQueries = await Promise.all(
            balanceFlat.map(async object=>{
                const newBalance = object.balance - object.amount;
                if(newBalance<0){
                    await connection.rollback();
                    throw new Error(`Article amount exceeds balance in database!`);
                }
                await connection.query('UPDATE balance_table SET balance = ? WHERE id =? AND order_detail_id = ?',[newBalance,object.id,object.order_detail_id]);
            })
        );

        await connection.commit();
        res.status(200).json({message: 'balances updated successfully!'});
    }
    catch(err){
        await connection.rollback();
        console.error("Error updating invoice:", err);
        res.status(500).json({ error: "article amount exceeds balance in database!" });
    }
    finally{
        connection.release();
    }
});

//sending data to edit commercial invoice form
app.get('/api/editCommercialInvoice',requireAuth,async (req,res)=>{
    const invoice_number = req.query.invoice_number;
    console.log(invoice_number);
    const connection = await db.promise().getConnection();
    try {
        connection.beginTransaction();
        const [invoiceData] = await connection.query('SELECT commercial_invoice_table.*, customer_table.name FROM commercial_invoice_table INNER JOIN customer_table ON commercial_invoice_table.customer_id = customer_table.id WHERE commercial_invoice_table.invoice_number = ?',[invoice_number]);
        
        let [articleData] = await connection.query('SELECT * FROM commercial_invoice_article_table WHERE invoice_number = ?',[invoice_number]);
        if(articleData.length>0) {
            console.log(articleData);
            const articleIds = articleData.map(article=>article.article_id);

            const [articleInfoQueries] = await Promise.all(
                articleIds.map(id=>
                    connection.query('SELECT customer_article.id,customer_article.article_number,customer_article.description,product_table.category FROM customer_article INNER JOIN product_table ON customer_article.product_id = product_table.id WHERE customer_article.id = ?',[id])
                )
            );
        
            const articleInfo = articleInfoQueries[0];
            articleData.forEach((article,index)=>{
                if(article.article_id == articleInfo[index].id){
                    article.category = articleInfo[index].category;
                    article.description = articleInfo[index].description;
                    article.article_number = articleInfo[index].article_number;
                }
            });
        } 
        else{
            articleData = null;
        }
        
        //console.log(articleInfo);
        console.log(articleData);
        await connection.commit();

        res.status(200).json({
            invoiceData: invoiceData,
            articleData: articleData
        });
    }
    catch(error){
        await connection.rollback();
        console.log(error);
        res.status(500).json({error: 'cannot fetch invoice data'});
    }
    finally{
        connection.release();
    }
});

//updating commercial invoice
app.put('/updateCommercialInvoice',requireAuth,async (req,res)=>{
    const invoiceData = req.body.invoiceData;
    console.log(invoiceData);
    const products = req.body.products;
    const deletedArticles = req.body.deletedArticles;
    const newProducts = products.filter(product=>!product.status);
    console.log(newProducts);

    const connection = await db.promise().getConnection();

    try{
        await connection.beginTransaction();
        let newTotal = 0;
        let NewTotalNet = 0;
        let NewTotalGross = 0;
        products.forEach(product=>{
            newTotal+= product.unitPrice * (product.cartons * product.cartonPacking);
            NewTotalNet += product.cartons * product.cartonNetWeight;
            NewTotalGross += product.cartons * product.cartonGrossWeight;
        });

        // deleting articles
        const deleteArticles = deletedArticles.map(async article=>{
            await connection.query('DELETE FROM commercial_invoice_article_table WHERE id = ? ',[article]);
        });
        await Promise.all(deleteArticles);

        //updating invoice table
        const updateInvoiceTable = await connection.query('UPDATE commercial_invoice_table SET fiNo=?,blNo=?,fiNoDate=?,blNoDate=?,loadingPort=?,shippingPort=?,total=?,total_net_weight=?,total_gross_weight=?,shipment_terms=?,date=?,shipment_date=? WHERE invoice_number =?',[invoiceData.fiNo,invoiceData.blNo,invoiceData.fiNodate,invoiceData.blNoDate,invoiceData.loadingPort,invoiceData.shippingPort,newTotal,NewTotalNet,NewTotalGross,invoiceData.shipmentterms,invoiceData.invoiceDate,invoiceData.shipmentdate,invoiceData.invoiceNumber]);
        
        //inserting into article table
        const updateArticleTable = newProducts.map(async product=>{
            const amount = Number(product.cartons) * Number(product.cartonPacking);
            await connection.query('INSERT INTO commercial_invoice_article_table(invoice_number, article_id, article_amount, cartons, unit_price, carton_gross_weight, carton_net_weight, currency, carton_packing, carton_packing_unit) VALUES (?,?,?,?,?,?,?,?,?,?)',[invoiceData.invoiceNumber, product.productID,amount,product.cartons,product.unitPrice,product.cartonNetWeight,product.cartonGrossWeight,product.currency,product.cartonPacking,product.cartonPackingUnit]);
        });
        await Promise.all(updateArticleTable);

        await connection.commit();
        res.status(200).json({message: 'INVOICE UPDATED!'});
    }
    catch(error){
        await connection.rollback();
        console.log(error);
        res.status(500).json({error: 'error updating invoice'});
    }
    finally{
        connection.release();
    }
    
});

//SENDING PRODUCT IDS TO EDIT PRODUCT FORM SELECT
app.get('/api/productIds',requireAuth,(req,res)=>{
    db.query('SELECT id,description FROM product_table',(err,results)=>{
        if(err){
            res.status(500).json({message: 'ERROR LOADING PRODUCTS'});
        }
        res.status(200).json(results);
    });
});

// SENDING FETCHED PRODUCT DETAILS TO EDIT PRODUCT FORM
app.get('/api/productDetails',requireAuth,(req,res)=>{
    const id = req.query.id;
    db.query('SELECT * FROM product_table WHERE id = ?',[id],(err,result)=>{
        if(err){
            res.status(500).json({message: 'ERROR FETCHING PRODUCT DETAILS'})
        }
        res.status(200).json(result);
    });
});

// SAVING EDITED PRODUCT
app.put('/saveEditProduct',requireAuth,async (req,res)=>{
    req.session.editProductdata = req.body;
    const data = req.session.editProductdata;
    if(!data || data == null){
        console.log('no/null data recieved');
        res.status(500).json({message: 'NO DATA RECIEVED!'});
    }
    console.log(data);
    const connection = await db.promise().getConnection();
    try{
        connection.beginTransaction();
        const query = 'UPDATE product_table SET description = ?, hs_code = ?, size = ?, carton_length = ?, carton_width = ?, carton_height = ?, weight = ?, unit_packing = ?, carton_packing = ?, category = ?, material_composition = ?, weight_packing_type = ?, unit_packing_type = ?, carton_packing_type = ?, weight_units = ? WHERE id = ?';
        await connection.query(query,[data.desc, data.code, data.size, data.cartonLength, data.cartonWidth, data.cartonHeight, data.weight, data.unitPacking, data.cartonPacking, data.category, data.materialComp, data.weightPackingType, data.unitPackingType, data.cartonPackingType, data.weightUnit, data.productID]);
        await connection.commit();
        res.status(200).json({message: 'ARTICLE UPDATED SUCCESSFULLY!'})
    }
    catch(error){
        await connection.rollback();
        console.log(error);
        res.send(500).json({message: 'CANNOT EDIT ARTICLE!'});
    }
    finally{
        connection.release();
    }
});

// send product details to customerarticle page
app.get('/customerArticleProductDetails',requireAuth,(req,res)=>{
    const product_id = req.query.product_id;
    console.log(product_id);
    console.log(' request recieved from article');
    db.query('SELECT hs_code,carton_length,carton_width,carton_height,unit_packing,carton_packing,unit_packing_type,carton_packing_type,description FROM product_table WHERE id=?',[product_id],(err,results)=>{
        if(err){
            console.log(err);
            res.status(500).json({error: 'error fetching product data'});
        }
        res.status(200).json(results);
    });
});


//delete a product
app.post('/deleteProduct', requireAuth, (req,res)=>{
    const id = req.body.articleId;
    console.log(req.body);
    db.query('DELETE FROM product_table WHERE id=?',[id],(err,result)=>{
        if(err) {
            console.log(err);
            return res.status(500).send('error deleting product');
        }
        return res.redirect(req.get('Referrer') || '/HTML/Forms/productForm.html');
    });

});

app.listen(port,'0.0.0.0',()=>{
    console.log("server is running on port " + port);
});
