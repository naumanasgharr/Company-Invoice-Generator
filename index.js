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

app.get("/",(req,res)=>{
    res.sendFile(__dir + "/public/main.html");
    console.log("sent");
});

app.post("/performaInvoice",(req,res)=>{
    console.log("Request received at performaInvoice");
    console.log(req.body);
    res.sendFile(__dir+"/public/pages/document1.html");
});

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

app.get("/api/customerReport",(req,res)=>{
    db.query('SELECT * FROM customer_table',(err,results)=>{
        if(err){
            res.status(500).send({error: 'error fetching data'});
        } else{
            res.json(results);
        }
    });
});

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

app.listen(port,()=>{
    console.log("server is running on port " + port);
});