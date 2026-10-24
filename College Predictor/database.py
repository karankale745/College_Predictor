import sqlite3
from datetime import datetime, timezone

DATABASE = "college_access.db"


def get_db():

    conn = sqlite3.connect(DATABASE)

    conn.row_factory = sqlite3.Row

    return conn


def init_database():

    conn = get_db()

    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            email TEXT NOT NULL UNIQUE,

            password_hash TEXT,

            google_sub TEXT UNIQUE,

            auth_provider TEXT NOT NULL DEFAULT 'email',

            created_at TEXT NOT NULL

        );


        CREATE TABLE IF NOT EXISTS subscriptions (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            razorpay_order_id TEXT NOT NULL UNIQUE,

            razorpay_payment_id TEXT UNIQUE,

            amount INTEGER NOT NULL,

            status TEXT NOT NULL DEFAULT 'created',

            starts_at TEXT,

            ends_at TEXT,

            created_at TEXT NOT NULL,

            FOREIGN KEY(user_id)
            REFERENCES users(id)

        );


        CREATE TABLE IF NOT EXISTS password_resets (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            token_hash TEXT NOT NULL UNIQUE,

            expires_at TEXT NOT NULL,

            used INTEGER NOT NULL DEFAULT 0,

            created_at TEXT NOT NULL,

            FOREIGN KEY(user_id)
            REFERENCES users(id)

        );
        """
    )

    conn.commit()

    conn.close()


def utc_now():

    return datetime.now(
        timezone.utc
    )