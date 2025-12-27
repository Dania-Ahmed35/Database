use bookstore;
DELIMITER $$ --Changes delimiter so we can write multiple SQL statements inside the trigger.

CREATE TRIGGER prevent_negative_stock
BEFORE UPDATE ON Books -- trigger hould run before the update
FOR EACH ROW -- trigger is fired for each row being updated
BEGIN
    IF NEW.stock_level < 0 THEN
        SIGNAL SQLSTATE '45000'-- throughs an error to stop the update
        SET MESSAGE_TEXT = 'Stock level cannot be negative';
    END IF;
END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER after_book_update
AFTER UPDATE ON Books
FOR EACH ROW
BEGIN
    IF OLD.stock_level > NEW.threshold AND NEW.stock_level <= NEW.threshold THEN
        INSERT INTO Publisher_Orders (admin_id, isbn, order_date, quantity, status)
        VALUES (IFNULL(@current_admin_id, 1), NEW.isbn, NOW(), 10, 'PENDING');
    END IF;
END$$

DELIMITER ;