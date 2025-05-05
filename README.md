# Customer-Management-System
A customer management system that lets companies manage their customer, product, and order data. It also generates important documents such as invoices with very little hassle. A big textile business is currently using this. 
# Components
The front-end was designed using simple HTML, CSS, and JavaScript. A front-end framework wasn't used. The backend was built using JavaScript's Node library, and Express was used to design the server-side logic. A MySQL database is integrated to perform CRUD operations on important company Data.
- The server-side code is contained in the index.js file
-- The frontend files are inside the *Public* folder. HTML and JavaScript files are inside the HTML and JS folders, respectively.
- The HTML folder contains Invoices, Forms, and Reports folders. The folder also contains the HTML file for the main page, *main.html*
- The Invoices folder contains the HTML file for the invoices.
- The reports folder contains the Order Report files.
- The Forms folder contains the html files for all the forms used in the application.
# Working of the Application
The application was developed considering a specific textile company's business model and needs.
The application stores:
- Customer Data
- Article Data
- Specific Customer Article Numbers (Company specific)
- Order Data
- **Customer Article Numbers are Customer-Specific. They are linked to Company Article IDs. These customer article numbers and the data associated with them are used while creating invoices.**
- *To generate an invoice, the user should:*
- Store Customer Data. (Add Customer)
- Store Product Data. (Add Article)
- Store Customer Article Numbers. (Add Article No)
- Generate an Invoice using the customer name and Customer Article Numbers. The Article data for each article number is fetched accordingly from the database.
- **Make sure the Customer Article Numbers used have been stored for the same Customer. Invoices will not be generated if:**
- *Customer name is wrong*
- *Customer Article Numbers are wrong*
- **commercial invoice**
- A commercial invoice can be created after a performa invoice. Commercial invoices can contain products from multiple performa invoices. If a single customer has multiple performa invoices, commercial invoices can be used to handle partial order shipments.
- An **update balances** feature has been added, which calculates order balances and marks orders as pending or complete.
- **NOTE THAT THE ABOVE FEATURE CAN BE USED AFTER GENERATING A COMMERCIAL INVOICE AND WHILE EDITING A COMMERCIAL INVOICE. USERS SHOULD ONLY USE THIS FEATURE ONCE PER INVOICE (EITHER WHILE GENERATING OR WHILE EDITING) SO THE APP DOESN'T REPEAT ORDER DEDUCTIONS. THIS FEATURE WAS KEPT IN THE EDIT INVOICE SECTION SINCE A USER MIGHT WANT TO CHANGE AN INVOICE LATER**
- After updating balances, the backend deducts the order amounts in the commercial invoice from the amounts in the performa invoices for the respective order. A database trigger is used to mark the orders as **completed** when the balance = 0. This can be seen in the **View Invoices** section for performa invoices. Once an order balance reaches 0, that order will not be available in the commercial invoices select options.

# Running the Application
Clone the repo and make sure you have Node.js installed on your machine. Use *npm i* to install the necessary modules. Import the database schema in MySQL and connect it to the server using a .env file. Use *node index.js* to run the application on your localhost server.

