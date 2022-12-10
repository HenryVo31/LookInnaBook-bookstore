/* Initialization Queries - Used to insert example data into the database */

-- Insert data into the Publisher table
INSERT INTO Publisher (name, address, email_address, bank_account_num)
VALUES ('Del Rey', '1745 Broadway, New York, NY', 'inquiry@delrey.com', '1112223334445'),
       ('Scholastic Paperbacks', '557 Broadway, New York, NY', 'inquiry@scolastic.com', '5556667778881'),
       ('Voyager', '1493 Crown St North Vancouver', 'inquiry@voyager.com', '9993331112243'),
       ('DAW', '375 Hudson St, New York, NY', 'inquiry@daw.com', '8881110009996'),
       ('TOR Fantasy', '120 Broadway, New York, NY', 'inquiry@torfantasy.com', '0005556663330');

-- Insert data into the Book table
INSERT INTO Book (isbn, title, year_published, price, num_pages, stock_quantity, publisher_royalties_amt, publisher_id)
VALUES ('9780345339737', 'The Return of the King (The Lord of the Rings, Part 3)', 1986, 8.99, 512, 5, 8, 1),
       ('9780439708180', 'Harry Potter and the Sorcerers Stone', 1999, 12.99, NULL, 11, 10, 2),
       ('9780006479888', 'A Game of Thrones (A Song of Ice and Fire, Book 1)', 2003, 7.10, 864, 15, 8.5, 3),
       ('9780756404741', 'Name of the Wind: The Kingkiller Chronicle - Day One', 2008, 14.84, 736, 6, 7.5, 4),
       ('9781250251497', 'The Dragon Reborn: Book Three of The Wheel of Time', 2019, 14.84, 704, 12, 10.5, 5),
       ('9780756412586', 'Twelve Kings in Sharakhai', 2016, 17.59, 592, 3, 6, 4),
       ('9780765365279', 'The Way of Kings: Book One of the Stormlight Archive', 2011, 11.92, 1280, 18, 11.5, 5),
       ('9780345285546', 'The Elfstones of Shannara (The Shannara Chronicles)', 1983, 11.87, 576, 4, 6, 1),
       ('9780765350381', 'Mistborn: The Final Empire', 2007, 14.76, 672, 7, 10.5, 5);

-- Insert data into the Author table
INSERT INTO Author (isbn, full_name)
VALUES ('9780345339737', 'J.R.R. Tolkien'),
       ('9780439708180', 'J.K. Rowling'),
       ('9780006479888', 'George R.R. Martin'),
       ('9780756404741', 'Patrick Rothfuss'),
       ('9781250251497', 'Robert Jordan'),
       ('9780756412586', 'Bradley Beaulieu'),
       ('9780765365279', 'Brandon Sanderson'),
       ('9780345285546', 'Terry Brooks'),
       ('9780765350381', 'Brandon Sanderson');

-- Insert data into the Genre table
INSERT INTO Genre (isbn, genre_name)
VALUES ('9780006479888', 'Fantasy'),
       ('9780439708180', 'Fantasy'),
       ('9780756404741', 'Fantasy'),
       ('9780756412586', 'Fantasy'),
       ('9780345285546', 'Fantasy'),
       ('9780756404741', 'Mystery'),
       ('9780006479888', 'Mystery'),
       ('9780765365279', 'Action and Adventure'),
       ('9780756412586', 'Action and Adventure'),
       ('9780006479888', 'Romance'),
       ('9780439708180', 'Magic'),
       ('9780765350381', 'Dystopian'),
       ('9780345339737', 'Epic Fantasy'),
       ('9780765365279', 'Epic Fantasy'),
       ('9780765350381', 'Epic Fantasy'),
       ('9781250251497', 'Epic Fantasy');

-- Insert data into the PhoneNumber table
INSERT INTO PhoneNumber (number, publisher_id)
VALUES ('9319233384', 1),
       ('4598967867', 2),
       ('9579235068', 3),
       ('5026441258', 4),
       ('8957437672', 5);

-- Insert data into the User table
INSERT INTO Users (first_name, last_name, email_address, password, address)
VALUES ('admin', 'admin', 'admin', 'admin', 'admin'),
       ('Henry', 'Vo', 'myinbox@gmail.com', '123', 'Example Street, Ottawa, ON');
       
