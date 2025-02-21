# Customer-Management-System
A customer management system that lets companies manage their customer, product, and order data. It also generates important documents such as invoices with very little hassle. A big textile business is currently using this. 
# Components
The front-end was designed using simple HTML, CSS, and JavaSript. A front-end framework wasn't used. The backend was built using JavaScript's Node library, and Express was used to design the server-side logic. A MySql database is integrated to perform CRUD operations on important company Data.
- the server-side code is contained in the index.js file
-- the frontend files are inside the *Public* folder. HTML and Javascript files are inside the HTML and JS folders, respectively.
- HTML folder contains Invoices, Forms, and Reports folders. The folder also contains the HTML file for the main page *main.html*
- Invoices contains the HTML file for an invoice.
- The reports folder contains the Order Report file.
- Forms folder contains the html files for all the forms used in the application.
# Step by Step by Working of the Application
The application was developed considering a specific textile company's business model and needs.
The application stores:
- Customer Data
- Article Data
- Specific Customer Article Numbers (Company specific)
- Order Data
**Customer Article Numbers are Customer-Specific. They are linked to Company Article IDs. These customer article numbers are used while creating invoices.**
To generate an invoice, the user should:
- Store Customer Data. (Add Customer)
- Store Product Data. (Add Article)
- Store Customer Article Numbers. (Add Article No)
- Generate Invoice using customer ID and Customer Article Numbers. The Article data for each article number is fetched accordingly from the database.
**Make sure the Customer Article Numbers used have been stored for the same Customer. Invoice will not be generated if:**
*- Customer ID is wrong*
*- Customer Article Numbers are wrong*

# Running the Application
Clone the repo and make sure you have Node.js installed on your machine. Use *npm i* to install the necessary modules. Use *node index.js* to run the application on your localhost server.

