import express from "express";
import bodyParser from "body-parser";
import mysql2 from "mysql2";
import {dirname} from "path";
import { fileURLToPath, pathToFileURL } from "url";

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
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
const __dir = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dir + "/public"));

// MAIN PAGE

app.get("/",(req,res)=>{
    res.sendFile(__dir + "/public/main.html");
    console.log("sent");
});

// GENERATING PERFORMA INVOICE
var performaData = null;

app.post("/performaInvoice",(req,res)=>{
    console.log("Request received at performaInvoice");
    console.log(req.body);
    performaData = req.body;
    console.log(typeof req.body);
    res.sendFile(__dir+"/public/pages/document1.html");
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
    const {productName, articleNumber, productCode, prodDesc, productWeight, productSize, cartonLength, cartonHeight, cartonWidth} = req.body;
    const query = 'INSERT INTO product_table (article_number, name, description, hs_code, size, carton_length, carton_width, carton_height, weight) VALUES (?,?,?,?,?,?,?,?,?)';
    db.query(query, [articleNumber,productName,prodDesc,productCode,productSize,cartonLength,cartonWidth,cartonHeight,productWeight], (err, result) => {
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

// sending data to document1.html

app.get("/api/performa",(req,res)=>{
    if(!performaData){
        res.status(404).json({error: 'no data available!'});
    }
    const{customerID,productNumber} = performaData;
    const articleNumbersArray = Array.isArray(productNumber) ? productNumber : [productNumber];
    console.log(customerID,productNumber);
    //const product = performaData.product_id;
    //const customer = performaData.customer_id;
    const query1 = 'SELECT * FROM customer_table WHERE id = ?';
    db.query(query1,[customerID],(err1,customerResult)=>{
        if(err1){
            console.log('error fetching data');
            res.status(500).json({error: 'error fetching data'});
        }
        console.log(customerResult);
        const products = [];
        let completedQuerries = 0;
        articleNumbersArray.forEach(productNumber => {
            const query2 = 'SELECT product_id FROM customer_article WHERE customer_id = ? AND article_number = ?';     //(${product.map(() => "?").join(",")})
            db.query(query2,[customerID,productNumber],(err2,articleResult)=>{
                if (err2) {
                    console.error("Error fetching product data:", err2);
                    return res.status(500).json({ error: "Database error (products)" });
                }
                if (articleResult.length === 0) {
                    console.log(`No product found for article number ${productNumber}`);
                    return; // Skip if no product is found for this article number
                }
                const product_number = articleResult[0].product_id;
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
                    console.log(products);

                    // Once all queries are completed, send the response
                if (completedQuerries === productNumber.length) {
                        res.json({
                            performa: performaData,
                            customer: customerResult[0],
                            products: products
                        });
                    }
            });
        });
        
           
          //  const productNumbers = articleResult.map(row => row.product_number);
           // console.log(productNumbers);
         /*   console.log(performaData);
            console.log(productResult);
           // console.log(customerResult[0]);
            res.json({
                performa: performaData,
                customers: customerResult[0],
                products: productResult
            });*/
        });
    });

});

app.listen(port,()=>{
    console.log("server is running on port " + port);
});