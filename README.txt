Instructions to setup this Web Appliation on your local machine:

- This application uses HTML/CSS and JavaScript for the front-end, and Node.js for the back-end, therefore, you will need to first
install Node.js on your local machine

- Inside a terminal, navigate to this project's directory

- Run: npm install

- The above command will install all required dependencies and modules for this application

- This web application uses PostgreSQL for the back-end SQL Database, therefore, you will need to install PostgreSQL on your
local machine

- I recommend installing pgAdmin4 as well, as it provides a useful GUI to interact with the Database

- Create a new Database in PostgreSQL

- In the server.js file, for Line 23 to Line 28, make sure to change the Connection Info to match your newly created database

- Inside the SQL folder, in the project's directory, use the queries in "DDL-init.sql" to create all the required tables in the database

- In the above directory, use the queries in "DML-init.sql" to insert example data into the tables in the database

- In a terminal, run: node server.js

- You can now access the Web Application in your browser by going to localhost:3000