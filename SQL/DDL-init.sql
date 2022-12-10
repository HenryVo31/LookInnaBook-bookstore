/* Creating Tables in the Database */

-- Creating the Publisher Table:
CREATE TABLE Publisher (
    publisher_id        SERIAL          NOT NULL    PRIMARY KEY,
    name                VARCHAR(30)     NOT NULL,
    address             VARCHAR(30),
    email_address       VARCHAR(30)     NOT NULL,
    bank_account_num    VARCHAR(20)     NOT NULL
);

-- Creating the Book Table:
CREATE TABLE Book (
    isbn                      CHAR(13)        NOT NULL    PRIMARY KEY,
    title                     VARCHAR(70)     NOT NULL,
    year_published            INT,
    price                     NUMERIC(10, 2)  NOT NULL,
    num_pages                 INT,
    stock_quantity            INT             NOT NULL,
    publisher_royalties_amt   NUMERIC(5, 2)   NOT NULL,
    publisher_id              INT             NOT NULL,
    FOREIGN KEY (publisher_id)
        REFERENCES Publisher(publisher_id)
);

-- Creating the Author Table:
CREATE TABLE Author (
    isbn        CHAR(13)        NOT NULL,
    full_name   VARCHAR(20)     NOT NULL ,
    PRIMARY KEY (isbn, full_name),
    FOREIGN KEY (isbn)
        REFERENCES Book(isbn)
);

-- Creating the Genre Table:
CREATE TABLE Genre (
    isbn        CHAR(13)        NOT NULL,
    genre_name  VARCHAR(20)     NOT NULL,
    PRIMARY KEY (isbn, genre_name),
    FOREIGN KEY (isbn)
        REFERENCES Book(isbn)
);

-- Creating RestockOrder Table:
CREATE TABLE RestockOrder (
    restock_order_id    SERIAL      NOT NULL    PRIMARY KEY,
    quantity            INT         NOT NULL,
    isbn                CHAR(13)    NOT NULL,
    FOREIGN KEY (isbn)
        REFERENCES Book(isbn)
);

-- Creating PhoneNumber Table:
CREATE TABLE PhoneNumber (
    number          VARCHAR(11)     NOT NULL    PRIMARY KEY,
    publisher_id    INT             NOT NULL,
    FOREIGN KEY (publisher_id)
        REFERENCES Publisher(publisher_id)
);

-- Creating User Table:
CREATE TABLE Users (
    user_id         SERIAL          NOT NULL    PRIMARY KEY,
    first_name      VARCHAR(20),
    last_name       VARCHAR(20)     NOT NULL,
    email_address   VARCHAR(20)     NOT NULL,
    password        VARCHAR(20)     NOT NULL,
    address         VARCHAR(30)
);

-- Creating CreditCard Table:
CREATE TABLE CreditCard (
    credit_card_num     VARCHAR(16)     NOT NULL    PRIMARY KEY,
    billing_name        VARCHAR(20)     NOT NULL,
    billing_address     VARCHAR(30)     NOT NULL,
    credit_card_cvv     CHAR(3)         NOT NULL
);

-- Creating Order Table:
CREATE TABLE Orders (
    order_num           SERIAL          NOT NULL    PRIMARY KEY,
    credit_card_num     VARCHAR(16)     NOT NULL,
    shipping_address    VARCHAR(30)     NOT NULL,
    current_status      VARCHAR(20)     NOT NULL,
    order_total_amt     NUMERIC(10, 2)  NOT NULL,
    order_date          DATE            NOT NULL,
    user_id             INT             NOT NULL,
    FOREIGN KEY (credit_card_num)
        REFERENCES CreditCard(credit_card_num),
    FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
);

-- Creating AddBookToOrder Table:
CREATE TABLE AddBookToOrder (
    order_num   INT         NOT NULL,
    isbn        CHAR(13)    NOT NULL,
    PRIMARY KEY (order_num, isbn),
    FOREIGN KEY (order_num)
        REFERENCES Orders(order_num),
    FOREIGN KEY (isbn)
        REFERENCES Book(isbn)
);

-- Creating Sales Table:
CREATE TABLE Sales (
    sales_id            SERIAL          NOT NULL    PRIMARY KEY,
    sales_amt           NUMERIC(10, 2)  NOT NULL,
    expenditure_amt     NUMERIC(10, 2)  NOT NULL,
    sales_date          DATE            NOT NULL,
    order_num           INT             NOT NULL,
    FOREIGN KEY (order_num)
        REFERENCES Orders(order_num)
);
