#!/usr/bin/env python3
"""Test script to verify PostgreSQL connection"""

import sys
from sqlalchemy import text
from app.db.session import engine

def test_database_connection():
    """Test if we can connect to PostgreSQL"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ PostgreSQL connection successful!")
            print(f"✅ Connected to database: {connection.info.get('connection_info', 'quiz_battle')}")
            return True
    except Exception as e:
        print(f"❌ PostgreSQL connection failed!")
        print(f"Error: {type(e).__name__}: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)
