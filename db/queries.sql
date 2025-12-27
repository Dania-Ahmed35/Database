
-- Search book by ISBN/title/category/author/publisher
SELECT 
    b.isbn,
    b.title,
    b.selling_price,
    b.stock_level,
    c.name AS category_name,
    p.name AS publisher_name,
    a.first_name,
    a.last_name
FROM Books b
JOIN Category c ON b.category_id = c.category_id
JOIN Publishers p ON b.publisher_id = p.publisher_id
JOIN Book_Authors ba ON b.isbn = ba.isbn
JOIN Authors a ON ba.author_id = a.author_id
WHERE 
    b.isbn = ? 
    OR b.title = ?
    OR c.name = ?
    OR a.first_name = ?
    OR a.last_name = ?
    OR p.name = ?;


-- Shopping Cart query
SELECT 
    b.title,
    b.book_image,
    ci.quantity,
    b.selling_price,
    (ci.quantity * b.selling_price) AS item_total,
    SUM(ci.quantity * b.selling_price) OVER () AS cart_total -- OVER keeps the rows as it is not like GROUP BY
FROM Shopping_Cart sc
JOIN Cart_Items ci ON sc.cart_id = ci.cart_id
JOIN Books b ON ci.isbn = b.isbn
WHERE sc.customer_id = ?;


--past history of the customer
SELECT 
    so.sales_order_id,
    so.order_date,
    b.title,
    soi.quantity,
    soi.unit_price,
    (soi.quantity * soi.unit_price) AS item_total,
    SUM(soi.quantity * soi.unit_price) OVER (PARTITION BY so.sales_order_id) AS order_total -- over defines the window that sum function will calculate without merging the data and partition divides the data into groups for calculations
FROM Sales_Order_Items AS soi
JOIN Sales_Orders AS so ON soi.sales_order_id = so.sales_order_id
JOIN Books AS b ON soi.isbn = b.isbn
WHERE so.customer_id = ?  
ORDER BY so.sales_order_id, b.title;



--Top 5 Customers (Last 3 Months)
SELECT 
    u.first_name,
    u.last_name,
    SUM(soi.quantity * soi.unit_price) AS total_purchase
FROM Users AS u
JOIN Customers AS c ON u.user_id = c.user_id
JOIN Sales_Orders AS so ON c.customer_id = so.customer_id
JOIN Sales_Order_Items AS soi ON so.sales_order_id = soi.sales_order_id
WHERE so.order_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
GROUP BY c.customer_id
ORDER BY total_purchase DESC
LIMIT 5;


--Top 10 Selling Books (Last 3 Months)
SELECT 
    b.title,
    b.book_image,
    SUM(soi.quantity) AS number_of_copies_sold
FROM Books AS b
JOIN Sales_Order_Items AS soi ON b.isbn = soi.isbn
JOIN Sales_Orders AS so ON soi.sales_order_id = so.sales_order_id
WHERE so.order_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
GROUP BY b.isbn, b.title, b.book_image
ORDER BY number_of_copies_sold DESC
LIMIT 10;


-- Total Number of Times a Specific Book Has Been Ordered
SELECT 
    b.title,
    b.book_image,
    COUNT(po.order_id) AS total_number_of_times 
FROM Books as b 
JOIN Publisher_Orders AS po ON b.isbn=po.isbn
WHERE b.title="";


-- Total sales for books in the previous month
SELECT 
    SUM(soi.quantity*soi.unit_price) As total_sales_for_books_previous_month
FROM Sales_Order_Items as soi 
JOIN Sales_Orders as so ON soi.sales_order_id=so.sales_order_id
WHERE YEAR(so.order_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
    AND MONTH(so.order_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH);


-- The total sales for books on a certain day
SELECT 
    SUM(soi.quantity*soi.unit_price) As total_sales_for_books_on_certain_day
FROM Sales_Order_Items as soi 
JOIN Sales_Orders as so ON soi.sales_order_id=so.sales_order_id
WHERE DATE(so.order_date)=""; --separate the date from time


-- Admin book stock threshold
SELECT b.title,b.book_image,b.stock_level,b.threshold
FROM Books as b
WHERE b.stock_level<b.threshold