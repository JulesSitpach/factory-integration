Format:

ER diagram (use DrawSQL or EdrawMax for visuals)

SQL DDL (schema.sql) for Supabase/Postgres

Example (simplified):

sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE user_organizations (
  user_id UUID REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  role TEXT,
  PRIMARY KEY (user_id, org_id)
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  uploaded_by UUID REFERENCES users(id),
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE calculations (
  id UUID PRIMARY KEY,
  po_id UUID REFERENCES purchase_orders(id),
  summary JSONB,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add tables for subscriptions, payments, alerts, suppliers, etc.