var express = require('express');
const pug = require('pug');
const session = require('express-session');
const e = require('express');
const Pool = require('pg').Pool;

var app = express();

app.use(express.static("static"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'gfw3h42ibhjkfes', 
	resave: true,
	saveUninitialized: true,
    cookie: {maxAge: 3600000}
}));

app.set("view engine", "pug");
app.set("views", "./static/views")

// Connect to Postgres Database
const postgres = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'LookInnaBook',
    password: 'admin',
    port: 5432
})

// Threshold for stock quantity
let stockQuantityThreshold = 5;

// Render the Home Page
app.get('/', function(req, res) {
    res.render('home', {sessionStatus: req.session});
});

// Render the Books Page
app.get('/books', function(req, res) {
    let title = req.query.title;
    let author = req.query.author;
    let isbn = req.query.isbn;
    let genre = req.query.genre;

    // If no query parameters found, load the page with no search results
    if ((title == null || title == undefined || title == '') &&
        (author == null || author == undefined || author == '') &&
        (isbn == null || isbn == undefined || isbn == '') &&
        (genre == null || genre == undefined || genre == '')) {
    
        res.render('books', {sessionStatus: req.session});
    }
    else {
        // Create a SQL SELECT query depending on valid search fields
        query = `SELECT DISTINCT book.isbn, book.title FROM Book 
                 INNER JOIN Author ON Author.isbn = Book.isbn
                 INNER JOIN Genre ON Genre.isbn = Book.isbn
                 WHERE `
        if (title != "") {
            query += `LOWER(book.title) SIMILAR TO LOWER('%${title}%') AND `
        }
        if (author != "") {
            query += `LOWER(author.full_name) SIMILAR TO LOWER('%${author}%') AND `
        }
        if (isbn != "") {
            query += `book.isbn = '${isbn}' AND `
        }
        if (genre != "") {
            query += `LOWER(genre.genre_name) SIMILAR TO LOWER('%${genre}%') AND `
        }
        query = query.slice(0, -4)
        // Query for the searched books
        postgres.query(query, (error, results) => {
            if (error) {
                throw error;
            }
            // If no books are found
            if (results.rowCount == 0) {
                res.render('books', {sessionStatus: req.session, found: false});
            }
            else {
                res.render('books', {sessionStatus: req.session, found: true, books: results.rows});
            }
        })
    }
})

// Render the Add Book Page
app.get('/addBook', auth, function(req, res) {
    query = `SELECT * FROM Publisher`
    postgres.query(query, (error, results) => {
        if (error) {
            throw error;
        }
        res.render('addBook', {sessionStatus: req.session, publishers: results.rows});
    })
})

// Add a new book to the database
app.post('/books', auth, function(req, res) {
    let isbn = req.body.isbn
    let title = req.body.title
    let yearPublished = req.body.year_published
    let publisher = req.body.publisher
    let price = req.body.price
    let numPages = req.body.num_pages
    let stockQuantity = req.body.stock_quantity
    let author = req.body.author
    let genre = req.body.genre
    let publisherRoyalties = req.body.publisher_royalties
    // Query to insert a new book into the database, along with its Genre and Author
    query = `INSERT INTO Book (isbn, title, year_published, price, num_pages, stock_quantity, publisher_royalties_amt, publisher_id)
             VALUES ('${isbn}', '${title}', ${yearPublished}, ${price}, ${numPages}, ${stockQuantity}, ${publisherRoyalties}, ${publisher});
             INSERT INTO Genre (isbn, genre_name)
             VALUES ('${isbn}', '${genre}');
             INSERT INTO Author (isbn, full_name)
             VALUES ('${isbn}', '${author}')`
    postgres.query(query, (error, results) => {
        if (error) {
            throw error;
        }
        res.redirect(`/book/${isbn}`)
    })
})

// Delete a book, given its ISBN
app.delete('/books', auth, function(req, res) {
    let isbn = req.body.isbn;
    query = `DELETE FROM AddBookToOrder WHERE isbn = '${isbn}';
             DELETE FROM Author WHERE isbn = '${isbn}';
             DELETE FROM Genre WHERE isbn = '${isbn}';
             DELETE FROM RestockOrder WHERE isbn = '${isbn}';
             DELETE FROM Book WHERE isbn = '${isbn}'`
    postgres.query(query, (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).send("Success!");
    })
})

// Render the Book Page (page with detailed information on a single book)
app.get('/book/:isbn', function(req, res) {
    let isbn = req.params.isbn;

    // Retrieve the book's information, author(s) and genre(s)
    query = `SELECT * FROM Book
             INNER JOIN Publisher ON Publisher.publisher_id = Book.publisher_id
             WHERE isbn = '${isbn}';
             SELECT DISTINCT full_name FROM Author 
             WHERE isbn = '${isbn}';
             SELECT DISTINCT genre_name FROM Genre 
             WHERE isbn = '${isbn}'`
    postgres.query(query, (error, results) => {
        if (error) {
            throw error;
        }
        // Form a list of Genres
        genres = []
        for (let i in results[2].rows) {
            genres.push(results[2].rows[i].genre_name)
        }
        // Form a list of Authors
        authors = []
        for (let i in results[1].rows) {
            authors.push(results[1].rows[i].full_name)
        }

        res.render('book', {sessionStatus: req.session, 
                            book: results[0].rows[0],
                            authors: authors,
                            genres: genres})
    })
})

// Render the Shopping Cart Page
app.get('/cart', function(req, res) {
    res.render('cart', {sessionStatus: req.session});
})

// Render the Orders Page
app.get('/orders', auth, function(req, res) {
    // If user is the Admin, retrieve all customer orders and restock orders
    if (req.session.user == 1) {
        query = `SELECT order_num, current_status, order_total_amt, order_date FROM Orders;
                 SELECT * FROM RestockOrder`
    }
    // Otherwise, retrieve only the orders that belong to the current user
    else {
        query = `SELECT order_num, current_status, order_total_amt, order_date FROM Orders
                WHERE user_id = ${req.session.user}`
    }
    // Query the orders from the Orders table
    postgres.query(query, (error, results) => {
        if (error) {
            throw error;
        }
        if (req.session.user == 1) {
            res.render('orders', {sessionStatus: req.session, orders: results[0].rows, restockOrders: results[1].rows})
        }
        else {
            res.render('orders', {sessionStatus: req.session, orders: results.rows});
        }
    })
})

// Add submitted orders to the database
app.post('/orders', auth, async function(req, res) {
    let isbnList = req.body.isbn;
    let shippingAddress = req.body.shipping_address;
    let creditCardNum = req.body.credit_card_num;
    let creditCardCVV = req.body.credit_card_cvv;
    let billingName = req.body.billing_name;
    let billingAddress = req.body.billing_address;
    let orderTotalAmt = req.body.order_total_amount;
    // Insert the Credit Card, Billing Info and Order's info into their respective tables
    // For the newly created order, return its Order Number
    let query = `INSERT INTO CreditCard (credit_card_num, billing_name, billing_address, credit_card_cvv)
                 VALUES ('${creditCardNum}', '${billingName}', '${billingAddress}', '${creditCardCVV}');
                 WITH PlacedOrder AS (INSERT INTO Orders (credit_card_num, shipping_address, current_status, order_total_amt, order_date, user_id)
                                    VALUES ('${creditCardNum}', '${shippingAddress}', 'Order Received', ${orderTotalAmt}, CURRENT_DATE, 
                                            ${req.session.user}) RETURNING order_num)
                 SELECT order_num FROM PlacedOrder`
    await postgres.query(query, async (error, results) => {
        if (error) {
            throw error;
        }
        // Retrieve the order num of the newly created order from the results
        let order_num = results[1].rows[0].order_num;
        query = ``;
        // Create a query and execute it to insert all ISBNs in the order, along with the order num, into the database
        isbnList.forEach(isbn => {
            query += `INSERT INTO AddBookToOrder (order_num, isbn) 
                      VALUES (${order_num}, '${isbn}');`
        })
        query = query.slice(0, -1);
        
        await postgres.query(query, (error, results) => {
            if (error) {
                throw error;
            }
            res.status(200).send("Success!");
        })
    })
})

// Add submitted orders to the database, insert the order as a new Sales record, reduce the stock quantity for all books
// inside the order, and retrieve a list of ISBNs with a stock quantity below the hard-coded threshold
app.put('/orders', auth, async function(req, res) {
    let orderNum = req.body.order_num;
    query = `UPDATE Orders
             SET current_status = 'Completed'
             WHERE order_num = ${orderNum};
             INSERT INTO Sales (sales_amt, expenditure_amt, sales_date, order_num)
             VALUES ((SELECT ROUND(SUM(price), 2) AS total_sales_amt FROM AddBookToOrder
                      INNER JOIN Book on Book.isbn = AddBookToOrder.isbn
                      WHERE order_num = ${orderNum}),
                      (SELECT ROUND(SUM((price / 100) * publisher_royalties_amt), 2) AS expenditure_amt FROM AddBookToOrder
                      INNER JOIN Book on Book.isbn = AddBookToOrder.isbn
                      WHERE order_num = ${orderNum}),
                      CURRENT_DATE, ${orderNum});
             UPDATE Book
             SET stock_quantity = stock_quantity - 1
             WHERE isbn IN (SELECT Book.isbn from AddBookToOrder
                            INNER JOIN Book on Book.isbn = AddBookToOrder.isbn
                            WHERE order_num = ${orderNum}
                            AND stock_quantity > 0);
             SELECT isbn FROM Book
             WHERE stock_quantity < ${stockQuantityThreshold}`
    await postgres.query(query, async (error, results) => {
        if (error) {
            throw error;
        }
        // Create a query to create Restock Orders for all books with low stock quantity
        let query = ``
        results[3].rows.forEach(book => {
            query += `INSERT INTO RestockOrder (quantity, isbn)
                      VALUES (10, '${book.isbn}');`
        })
        query = query.slice(0, -1)
        // Insert the Restock Orders into the database
        await postgres.query(query, (error, results) => {
            if (error) {
                throw error;
            }
  
            res.status(200).send("Success!");
        })
    })
})

// Render the Order Page to view a specific order in detail
app.get('/order/:order_num', auth, function(req, res) {
    let order_num = req.params.order_num;
    // Retrieve an order and all the books associated with that order
    query = `SELECT * FROM Orders
             WHERE order_num = ${order_num};
             SELECT DISTINCT Book.isbn, Book.title FROM AddBookToOrder
             INNER JOIN Book on Book.isbn = AddBookToOrder.isbn
             WHERE AddBookToOrder.order_num = ${order_num}`
    postgres.query(query, (error, results) => {
        if (error) {
            throw error;
        }
        // Form an object with ISBN and book's title pairs
        books = []
        for (let i in results[1].rows) {
            books.push({"isbn": results[1].rows[i].isbn, 
                        "title": results[1].rows[i].title})
        }
        res.render('order', {sessionStatus: req.session,
                             order: results[0].rows[0],
                             books: books});
    })
})

// Render the Login Page
app.get('/login', function(req, res) {
    res.render('login', {sessionStatus: req.session});
})

// Authenticate user and sign in
app.post('/login', function(req, res) {
    // Send error if user is already logged in
    if (req.session.loggedin) {
        res.status(200).send("User is already logged in")
    }
    else {
        // Search for the user in the database
        let query = `SELECT * FROM Users WHERE email_address = '${req.body.email_address}' AND password = '${req.body.password}'`;
        postgres.query(query, (error, results) => {
            if (error) {
                throw error;
            }
            // If credentials are invalid, send an error
            if (results.rowCount <= 0) {
                res.status(401).send("Login Failed! Invalid email address or password. Please try again");
            }
            // Else, log the user in
            else {
                req.session.loggedin = true;
                req.session.user = results.rows[0].user_id;

                // Check if the user is an admin
                if (req.body.email_address == 'admin') {
                    req.session.admin = true;
                }
                else {
                    req.session.admin = false;
                }

                res.redirect('/');
            }
        })
    }
})

// Logout and remove user session
app.get('/logout', function(req, res) {
    if (req.session.loggedin) {
        req.session.loggedin = false;
        req.session.user = undefined;
        req.session.admin = undefined;
        res.redirect('/')
    }
    else {
        res.status(200).send("User is already logged out");
    }
})

// Render the Register Page
app.get('/register', function(req, res) {
    res.render('register', {sessionStatus: req.session});
})

// Register a new user
app.post('/register', function(req, res) {
    // Send error if user is already logged in
    if (req.session.loggedin) {
        res.status(200).send("User is already logged in. Please logout to register a new profile")
    }
    else {
        // Insert new user's info into the database
        let emailAddress = req.body.email_address;
        let password = req.body.password;
        let firstName = req.body.first_name;
        let lastName = req.body.last_name;
        let address = req.body.address;
        let query = `INSERT INTO Users (first_name, last_name, email_address, password, address)
                     VALUES ('${firstName}', '${lastName}', '${emailAddress}', '${password}', '${address}')`;

        postgres.query(query, (error, results) => {
            if (error) {
                throw error;
            }
            res.redirect('/login');
        })
    }
})

// Render the Sales Report Page
app.get('/sales', auth, function(req, res) {
    // Query for Total Sales vs Expenditure Amount (First query)
    // Query for Sales by Genres (Second query)
    // Query for Sales by Publisher (Third query)
    query = `SELECT SUM(sales_amt) AS total_sales, SUM(expenditure_amt) AS total_expenditure FROM Sales;
            SELECT genre_name, SUM(price) AS total_sales FROM Sales
            INNER JOIN AddBookToOrder ON AddBookToOrder.order_num = Sales.order_num
            INNER JOIN Book ON Book.isbn = AddBookToOrder.isbn
            INNER JOIN Genre ON Genre.isbn = AddBookToOrder.isbn
            GROUP BY genre_name;
            SELECT Publisher.name, SUM(price) as total_sales FROM Sales
            INNER JOIN AddBookToOrder ON AddBookToOrder.order_num = Sales.order_num
            INNER JOIN Book ON Book.isbn = AddBookToOrder.isbn
            INNER JOIN Publisher ON Publisher.publisher_id = Book.publisher_id
            GROUP BY Publisher.name`
    postgres.query(query, (error, results) => {
        if (error) {
            throw error;
        }
        res.render('sales', {sessionStatus: req.session, totSalesExp: results[0].rows[0],
                             salesPerGenres: results[1].rows, salesPerPublisher: results[2].rows});
    })
})

// Authentication function to authenticate the user for specific routes
function auth(req, res, next) {
    if (req.session.loggedin) {
        next();
    }
    else {
        res.redirect('/login')
    }
}

app.listen(3000, function() {
    console.log("Server listening on port 3000")
});