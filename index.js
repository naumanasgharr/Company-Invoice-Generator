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
    console.log(customerID,productNumber); 

    // SQL query for retrieving customer data related to customerid recieved from form data/ used nested queries (3)
    const query1 = 'SELECT * FROM customer_table WHERE id = ?'; 
    db.query(query1,[customerID],(err1,customerResult)=>{
        if(err1){
            console.log('error fetching data');
            res.status(500).json({error: 'error fetching data'});
        }

        //logging customer data to check if the result is correct
        console.log(customerResult);
        
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
                    return; // Skip if no product is found for this article number
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
                    console.log(products);
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

app.listen(port,()=>{
    console.log("server is running on port " + port);
});