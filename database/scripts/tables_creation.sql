-- 1. USER TABLE
CREATE TABLE Users (
  user_id INT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- 2. ADDRESS
CREATE TABLE Address(
  address_id INT PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  street VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10) NOT NULL
);

-- 3. CUSTOMER & STAFF
CREATE TABLE Customer (
  user_id INT PRIMARY KEY,
  balance DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Staff(
  user_id INT PRIMARY KEY,
  salary DECIMAL(10,0) DEFAULT 0,
  job_title VARCHAR(100) NOT NULL,
  address_id INT,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (address_id) REFERENCES Address(address_id)
);

-- 4. CUSTOMER ADDRESS
CREATE TABLE Customer_Address(
  user_id INT,
  address_id INT,
  PRIMARY KEY (user_id, address_id),
  FOREIGN KEY (user_id) REFERENCES Customer(user_id),
  FOREIGN KEY (address_id) REFERENCES Address(address_id)
);

-- 5. PAYMENT CARD
CREATE TABLE Payment_Card(
  card_id INT PRIMARY KEY,
  user_id INT NOT NULL,
  card_type VARCHAR(20) NOT NULL,
  card_number NUMERIC(20) NOT NULL,
  expiry_date DATE NOT NULL,
  cvv VARCHAR(3) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Customer(user_id),
  CHECK (card_type IN ('VISA', 'DEBIT', 'CREDIT', 'AMEX', 'MASTERCARD'))
);

-- 6. BILLING ADDRESS
CREATE TABLE Billing_Address(
  card_id INT,
  address_id INT,
  PRIMARY KEY (card_id, address_id),
  FOREIGN KEY (card_id) REFERENCES Payment_Card(card_id),
  FOREIGN KEY (address_id) REFERENCES Address(address_id)
);

-- 7. PRODUCT & SUPPLIER
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
  name VARCHAR(100) NOT NULL
);

CREATE TABLE Supplies(
  product_id INT,
  supplier_id INT,
  supplier_price DECIMAL(10,2),
  start_date DATE,
  PRIMARY KEY (product_id, supplier_id, start_date),
  FOREIGN KEY (product_id) REFERENCES Product(product_id),
  FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
);

-- 8. PRODUCT PRICE
CREATE TABLE Product_Price (
    product_id INT NOT NULL,
    start_date DATE,
    sell_price DECIMAL(10,2) DEFAULT 0,
    PRIMARY KEY (product_id, start_date),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-- 9. WAREHOUSE & STOCK
CREATE TABLE Warehouse(
  warehouse_id INT PRIMARY KEY,
  capacity INT,
  address_id INT,
  FOREIGN KEY (address_id) REFERENCES Address(address_id)
);

CREATE TABLE Stock(
  quantity INT DEFAULT 0,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  PRIMARY KEY (product_id, warehouse_id),
  FOREIGN KEY (product_id) REFERENCES Product(product_id),
  FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id)
);

-- 10. ORDERS
CREATE TABLE Orders(
  order_id INT PRIMARY KEY,
  user_id INT NOT NULL,
  order_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  total_amount DECIMAL(10,2) NOT NULL,
  CHECK (status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return')),
  FOREIGN KEY (user_id) REFERENCES Customer(user_id)
);

-- 11. ORDER ITEM
CREATE TABLE Order_Item(
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  purchase_price DECIMAL(10,2),
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES Orders(order_id),
  FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-- 12.DELIVERY PLAN
CREATE TABLE Delivery_Plan (
    delivery_id INT PRIMARY KEY,
    delivery_type VARCHAR(50),
    delivery_cost DECIMAL(10,2) NOT NULL,
    ship_date DATE,
    delivery_date DATE,
    CHECK (delivery_type in ('Express', 'Standard'))
);

-- 13. ORDER PAYMENT
CREATE TABLE Order_Payment(
  order_id INT NOT NULL,
  card_id INT NOT NULL,
  delivery_id INT NOT NULL,
  PRIMARY KEY(order_id, card_id),
  FOREIGN KEY (order_id) REFERENCES Orders(order_id),
  FOREIGN KEY (card_id) REFERENCES Payment_Card(card_id),
  FOREIGN KEY (delivery_id) REFERENCES Delivery_Plan(delivery_id)
);

-- 14. ORDER SHIPPING
CREATE TABLE Order_Shipping(
  order_id INT NOT NULL,
  address_id INT NOT NULL,
  PRIMARY KEY (order_id, address_id),
  FOREIGN KEY (order_id) REFERENCES Orders(order_id),
  FOREIGN KEY (address_id) REFERENCES Address(address_id)
);