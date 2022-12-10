-- Find user with the inputted email_address and password for Authentication
SELECT * FROM Users WHERE email_address = '${req.body.email_address}' AND password = '${req.body.password}'

-- Register new user by inserting the user's info into the Database
INSERT INTO Users (first_name, last_name, email_address, password, address)
VALUES ('${firstName}', '${lastName}', '${emailAddress}', '${password}', '${address}')

-- Search query for books with matching filters (using SIMILAR TO and '%' for better matching - BONUS feature)
-- Available filters: Title, Author, ISBN, Genre
SELECT DISTINCT book.isbn, book.title FROM Book 
INNER JOIN Author ON Author.isbn = Book.isbn
INNER JOIN Genre ON Genre.isbn = Book.isbn
WHERE LOWER(book.title) SIMILAR TO LOWER('%${title}%') AND 
LOWER(author.full_name) SIMILAR TO LOWER('%${author}%') AND 
book.isbn = '${isbn}' AND
LOWER(genre.genre_name) SIMILAR TO LOWER('%${genre}%')

-- Query to retrieve all information on a book based on its ISBN
SELECT * FROM Book
INNER JOIN Publisher ON Publisher.publisher_id = Book.publisher_id
WHERE isbn = '${isbn}';
SELECT DISTINCT full_name FROM Author 
WHERE isbn = '${isbn}';
SELECT DISTINCT genre_name FROM Genre 
WHERE isbn = '${isbn}'

-- Query to insert the user's Credit Card and Billing info into the CreditCard table
INSERT INTO CreditCard (credit_card_num, billing_name, billing_address, credit_card_cvv)
VALUES ('${creditCardNum}', '${billingName}', '${billingAddress}', '${creditCardCVV}');
-- Query to insert the user's Credit Card and order's info into the Orders table, returning the new Order Num
WITH PlacedOrder AS (INSERT INTO Orders (credit_card_num, shipping_address, current_status, order_total_amt, order_date, user_id)
VALUES ('${creditCardNum}', '${shippingAddress}', 'Order Received', ${orderTotalAmt}, CURRENT_DATE, 
         ${req.session.user}) RETURNING order_num)
SELECT order_num FROM PlacedOrder
-- Query to insert all ISBNs in an order, along with the Order Num, into the AddBookToOrder table
INSERT INTO AddBookToOrder (order_num, isbn) 
VALUES (${order_num}, '${isbn}');

-- Retrieve the list of available Publishers for the Add Book page
SELECT * FROM Publisher

-- Add a new book to the Database
INSERT INTO Book (isbn, title, year_published, price, num_pages, stock_quantity, publisher_royalties_amt, publisher_id)
VALUES ('${isbn}', '${title}', ${yearPublished}, ${price}, ${numPages}, ${stockQuantity}, ${publisherRoyalties}, ${publisher});
INSERT INTO Genre (isbn, genre_name)
VALUES ('${isbn}', '${genre}');
INSERT INTO Author (isbn, full_name)
VALUES ('${isbn}', '${author}')

-- Delete an existing Book given its ISBN
DELETE FROM AddBookToOrder WHERE isbn = '${isbn}';
DELETE FROM Author WHERE isbn = '${isbn}';
DELETE FROM Genre WHERE isbn = '${isbn}';
DELETE FROM RestockOrder WHERE isbn = '${isbn}';
DELETE FROM Book WHERE isbn = '${isbn}'

-- Find all customer orders and restock orders for the Track Order page - If user is Admin
SELECT order_num, current_status, order_total_amt, order_date FROM Orders;
SELECT * FROM RestockOrder

-- Find all orders under the current user for the Track Order page - If user is a customer
SELECT order_num, current_status, order_total_amt, order_date FROM Orders
WHERE user_id = ${req.session.user}

-- Update an Order to mark it as "Completed"
UPDATE Orders
SET current_status = 'Completed'
WHERE order_num = ${orderNum};
-- Record the completed order as a Sales, calculating the Total Sales Amount based on the books' prices, and
-- calculate the Expenditure Amount based on the Publisher Royalties Amount (it is a percentage of the selling price)
INSERT INTO Sales (sales_amt, expenditure_amt, sales_date, order_num)
VALUES ((SELECT ROUND(SUM(price), 2) AS total_sales_amt FROM AddBookToOrder
        INNER JOIN Book on Book.isbn = AddBookToOrder.isbn
        WHERE order_num = ${orderNum}),
        (SELECT ROUND(SUM((price / 100) * publisher_royalties_amt), 2) AS expenditure_amt FROM AddBookToOrder
        INNER JOIN Book on Book.isbn = AddBookToOrder.isbn
        WHERE order_num = ${orderNum}),
        CURRENT_DATE, ${orderNum});
-- Update the stock quantity for the books inside the completed order
UPDATE Book
SET stock_quantity = stock_quantity - 1
WHERE isbn IN (SELECT Book.isbn from AddBookToOrder
            INNER JOIN Book on Book.isbn = AddBookToOrder.isbn
            WHERE order_num = ${orderNum}
            AND stock_quantity > 0);
-- Retrieve the ISBNs for Books with a Stock Quantity that is lower than a minimum threshold
SELECT isbn FROM Book
WHERE stock_quantity < ${stockQuantityThreshold}
-- For all the books with a low stock quantity, create Restock Orders for them, each with a quantity of 10 new copies
INSERT INTO RestockOrder (quantity, isbn)
VALUES (10, '${book.isbn}');

-- Retrieve all information about an Order for the Order's Details page
SELECT * FROM Orders
WHERE order_num = ${order_num};
SELECT DISTINCT Book.isbn, Book.title FROM AddBookToOrder
INNER JOIN Book on Book.isbn = AddBookToOrder.isbn
WHERE AddBookToOrder.order_num = ${order_num}

-- Calculate and retrieve the Total Sales Amount and Total Expenditure of all recorded sales
SELECT SUM(sales_amt) AS total_sales, SUM(expenditure_amt) AS total_expenditure FROM Sales;
-- Calculate and retrieve the Total Sales Amount by Genres
SELECT genre_name, SUM(price) AS total_sales FROM Sales
INNER JOIN AddBookToOrder ON AddBookToOrder.order_num = Sales.order_num
INNER JOIN Book ON Book.isbn = AddBookToOrder.isbn
INNER JOIN Genre ON Genre.isbn = AddBookToOrder.isbn
GROUP BY genre_name;
-- Calculate and retrieve the Total Sales Amount by Publishers
SELECT Publisher.name, SUM(price) as total_sales FROM Sales
INNER JOIN AddBookToOrder ON AddBookToOrder.order_num = Sales.order_num
INNER JOIN Book ON Book.isbn = AddBookToOrder.isbn
INNER JOIN Publisher ON Publisher.publisher_id = Book.publisher_id
GROUP BY Publisher.name