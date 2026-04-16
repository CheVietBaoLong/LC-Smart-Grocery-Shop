-- ==================
-- TABLES CREATION
-- ==================

-- USER
CREATE TABLE Users (
  user_id INT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- ADDRESS
CREATE TABLE Address(
  address_id INT PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  street VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10) NOT NULL
);

-- WAREHOUSE
CREATE TABLE Warehouse(
  warehouse_id INT PRIMARY KEY,
  capacity INT,
  address_id INT,
  FOREIGN KEY (address_id) REFERENCES Address(address_id) ON DELETE SET NULL
);

-- CUSTOMER & STAFF
CREATE TABLE Customer (
  user_id INT PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE Staff(
  user_id INT PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
  warehouse_id INT REFERENCES Warehouse(warehouse_id) ON DELETE SET NULL,
  salary DECIMAL(10,0) DEFAULT 0,
  job_title VARCHAR(100) NOT NULL,
  address_id INT,
  FOREIGN KEY (address_id) REFERENCES Address(address_id) ON DELETE SET NULL
);

-- CUSTOMER ADDRESS
CREATE TABLE Customer_Address(
  user_id INT REFERENCES Customer(user_id) ON DELETE CASCADE,
  address_id INT REFERENCES Address(address_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, address_id)
);

-- PAYMENT CARD
CREATE TABLE Payment_Card(
  card_id INT PRIMARY KEY,
  address_id INT,
  user_id INT NOT NULL,
  card_type VARCHAR(20) NOT NULL,
  card_number NUMERIC(20) NOT NULL,
  expiry_date DATE NOT NULL,
  cvv VARCHAR(3) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Customer(user_id) ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES Address(address_id) ON DELETE CASCADE,
  CHECK (card_type IN ('VISA', 'DEBIT', 'CREDIT', 'AMEX', 'MASTERCARD'))
);

-- PRODUCT & SUPPLIER
CREATE TABLE Product(
  product_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  size VARCHAR(50),
  brand VARCHAR(100)
);

CREATE TABLE Supplier(
  supplier_id INT PRIMARY KEY,
  address_id INT REFERENCES Address(address_id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE Supplies(
  product_id INT,
  supplier_id INT,
  supplier_price DECIMAL(10,2),
  start_date DATE,
  PRIMARY KEY (product_id, supplier_id, start_date),
  FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE CASCADE
);

-- PRODUCT PRICE
CREATE TABLE Product_Price (
    price_id INT PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Product(product_id) ON DELETE CASCADE,
    sell_price NUMERIC(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE
);

-- STOCK
CREATE TABLE Stock(
  quantity INT DEFAULT 0,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  PRIMARY KEY (product_id, warehouse_id),
  FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id) ON DELETE CASCADE
);

-- DELIVERY PLAN
CREATE TABLE Delivery_Plan (
    delivery_id INT PRIMARY KEY,
    delivery_type VARCHAR(50),
    delivery_cost DECIMAL(10,2) NOT NULL,
    ship_date DATE,
    delivery_date DATE,
    CHECK (delivery_type in ('Express', 'Standard'))
);

-- ORDERS
CREATE TABLE Orders(
  order_id INT PRIMARY KEY,
  user_id INT REFERENCES Customer(user_id) ON DELETE SET NULL,
  card_id INT REFERENCES Payment_Card(card_id) ON DELETE SET NULL,
  delivery_id INT REFERENCES Delivery_Plan(delivery_id) ON DELETE SET NULL,
  order_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  -- total_amount DECIMAL(10,2) NOT NULL,
  CHECK (status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return'))
);

-- ORDER ITEM
CREATE TABLE Order_Item(
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);

-- ORDER SHIPPING
CREATE TABLE Order_Shipping(
  order_id INT NOT NULL,
  address_id INT NOT NULL,
  PRIMARY KEY (order_id, address_id),
  FOREIGN KEY (order_id) REFERENCES Orders(order_id),
  FOREIGN KEY (address_id) REFERENCES Address(address_id)
);




-- ==================
-- DERIVED ATTRIBUTES
-- ==================

-- Function to get effective sell price for a product on a given date
CREATE OR REPLACE FUNCTION get_sell_price(p_product_id INT, p_date DATE)
RETURNS DECIMAL(10, 2) AS $$
    SELECT sell_price
    FROM Product_Price
    WHERE product_id = p_product_id
      AND start_date <= p_date
    ORDER BY start_date DESC
    LIMIT 1;
$$ LANGUAGE sql STABLE;

-- When inserting an OrderItem, auto-populate purchase_price using the function above:
-- INSERT INTO OrderItem (order_id, product_id, quantity, purchase_price)
-- VALUES (
--     1, 42, 3,
--     get_sell_price(42, (SELECT order_date FROM Orders WHERE order_id = 1))
-- );


-- total_amount() on Order
-- Sum of (purchase_price * quantity) for all items in the order.
CREATE OR REPLACE VIEW v_order_total AS
    SELECT
        o.order_id,
        o.user_id,
        o.order_date,
        o.status,
        COALESCE(SUM(oi.purchase_price * oi.quantity), 0.00) AS total_amount
    FROM Orders o
    LEFT JOIN Order_Item oi ON oi.order_id = o.order_id
    GROUP BY o.order_id, o.user_id, o.order_date, o.status;
 

-- balance on Customer
--    Can be treated as derived: total credits minus total charges.
--    This view shows how it could be computed rather than stored.
CREATE OR REPLACE VIEW v_customer_balance AS
    SELECT
        c.user_id AS customer_id,
        c.balance AS stored_balance,
        COALESCE(SUM(oi.purchase_price * oi.quantity), 0.00) AS total_spent
    FROM Customer c
    LEFT JOIN Orders o  ON o.user_id  = c.user_id
    LEFT JOIN Order_Item oi ON oi.order_id  = o.order_id
    GROUP BY c.user_id, c.balance;
 