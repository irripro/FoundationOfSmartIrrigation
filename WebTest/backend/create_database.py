import sqlite3

def create_database():
    conn = sqlite3.connect('farm.db')
    cursor = conn.cursor()

    # Create table for crop models
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS crop_models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_variety TEXT NOT NULL,
        planting_area TEXT NOT NULL,
        gdd REAL NOT NULL,
        maturity_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Create table for users
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    create_database()
