-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    workflow_name VARCHAR(100) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    execution_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_entity ON audit_logs(workflow_name, entity_id);

-- Inventory Stock alerts tracking table
CREATE TABLE IF NOT EXISTS inventory_threshold_logs (
    sku VARCHAR(50) PRIMARY KEY,
    last_reported_stock INT NOT NULL,
    last_reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Abandonment Reminders state table
CREATE TABLE IF NOT EXISTS cart_abandonment_states (
    cart_id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'abandoned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review Email Sequence tracking table
CREATE TABLE IF NOT EXISTS review_campaigns (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    order_count INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'delivered',
    last_action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_review_order ON review_campaigns(order_id);
