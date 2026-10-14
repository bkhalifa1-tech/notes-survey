CREATE TABLE IF NOT EXISTS admin_login_limits (
  ip_hash TEXT NOT NULL,
  window INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, window)
);
