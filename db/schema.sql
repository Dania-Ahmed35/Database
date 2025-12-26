CREATE DATABASE bookstore;

USE bookstore;

CREATE TABLE User(
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name  VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

)

CREATE TABLE Admins(
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    FOREIGN KEY (admin_id) REFERENCES User (user_id)
);

CREATE TABLE Customers(
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20),
    shipping_address VARCHAR(256),
    FOREIGN KEY (customer_id) REFERENCES User (user_id)
    );  

CREATE TABLE Publishers(
    publisher_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20)
);

CREATE TABLE Category(
	category_id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) UNIQUE NOT NULL
);


CREATE TABLE Books(
    isbn VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    publication_year YEAR,
    selling_price DECIMAL(10,2),
    category ENUM('Science','Art','Religion','History','Geography'),
    stock_level INT DEFAULT 0,
    threshold INT DEFAULT 5,
    publisher_id INT,
    FOREIGN KEY (publisher_id) REFERENCES Publishers(publisher_id)
    FOREIGN KEY (category_id)  REFERENCES  Category(category_id)
);

CREATE TABLE Authors(
    author_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    address VARCHAR(255)
);

CREATE TABLE Book_Authors(
    isbn VARCHAR(20),
    author_id INT,
    PRIMARY KEY(isbn, author_id),
    FOREIGN KEY (isbn) REFERENCES Books(isbn),
    FOREIGN KEY (author_id) REFERENCES Authors(author_id)
);

CREATE TABLE Publisher_Orders(
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    isbn VARCHAR(20),
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    quantity INT,
    status ENUM('PENDING','CONFIRMED') DEFAULT 'PENDING',
    FOREIGN KEY (admin_id) REFERENCES Admins(admin_id),
    FOREIGN KEY (isbn) REFERENCES Books(isbn)
);

CREATE TABLE Sales_Orders(
    sales_order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

CREATE TABLE Sales_Order_Items(
    sales_order_id INT,
    isbn VARCHAR(20),
    quantity INT,
    unit_price DECIMAL(10,2),
    PRIMARY KEY(sales_order_id, isbn),
    FOREIGN KEY(sales_order_id) REFERENCES Sales_Orders(sales_order_id),
    FOREIGN KEY(isbn) REFERENCES Books(isbn)
);

CREATE TABLE Shopping_Cart(
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

CREATE TABLE Cart_Items(
    cart_id INT,
    isbn VARCHAR(20),
    quantity INT,
    PRIMARY KEY(cart_id, isbn),
    FOREIGN KEY(cart_id) REFERENCES Shopping_Cart(cart_id),
    FOREIGN KEY(isbn) REFERENCES Books(isbn)
);
