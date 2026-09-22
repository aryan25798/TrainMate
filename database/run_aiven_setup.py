#!/usr/bin/env python3
"""
TrainMate - Automated Aiven MySQL Schema & Seed Runner
Executes database/aiven_setup.sql directly against an Aiven Cloud MySQL instance.
Supports Aiven Service URI or discrete host/port/user/password options.
"""

import sys
import os
import re
import argparse
import urllib.parse
import ssl
import pymysql

def parse_aiven_uri(uri_str):
    """
    Parses an Aiven MySQL Service URI:
    mysql://avnadmin:password@host:port/defaultdb?ssl-mode=REQUIRED
    """
    if uri_str.startswith("jdbc:mysql://"):
        # Strip JDBC prefix
        uri_str = uri_str.replace("jdbc:mysql://", "mysql://")
        
    parsed = urllib.parse.urlparse(uri_str)
    
    user = parsed.username or "avnadmin"
    password = parsed.password or ""
    host = parsed.hostname or "localhost"
    port = parsed.port or 3306
    # Strip leading slash
    database = (parsed.path or "").lstrip("/") or "defaultdb"
    
    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "database": database
    }

def split_sql_statements(sql_content):
    """
    Splits SQL script into individual executable statements,
    ignoring comments and preserving semicolons within string literals.
    """
    statements = []
    current = []
    in_single_quote = False
    in_double_quote = False
    in_line_comment = False
    in_block_comment = False
    
    i = 0
    n = len(sql_content)
    
    while i < n:
        char = sql_content[i]
        next_char = sql_content[i + 1] if i + 1 < n else ""
        
        # Check comment starts
        if not in_single_quote and not in_double_quote:
            if not in_block_comment and char == '-' and next_char == '-':
                in_line_comment = True
                i += 2
                continue
            if not in_line_comment and char == '/' and next_char == '*':
                in_block_comment = True
                i += 2
                continue
                
        # Check comment ends
        if in_line_comment:
            if char == '\n':
                in_line_comment = False
            i += 1
            continue
            
        if in_block_comment:
            if char == '*' and next_char == '/':
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue
            
        # String quotes
        if char == "'" and not in_double_quote:
            # Check for escaped quote ''
            if in_single_quote and next_char == "'":
                current.append("''")
                i += 2
                continue
            in_single_quote = not in_single_quote
            current.append(char)
            i += 1
            continue
            
        if char == '"' and not in_single_quote:
            in_double_quote = not in_double_quote
            current.append(char)
            i += 1
            continue
            
        # Semicolon outside of quotes
        if char == ';' and not in_single_quote and not in_double_quote:
            stmt = "".join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []
            i += 1
            continue
            
        current.append(char)
        i += 1
        
    final_stmt = "".join(current).strip()
    if final_stmt:
        statements.append(final_stmt)
        
    return statements

def execute_setup(connection_params, sql_file_path):
    print("=" * 60)
    print("TrainMate - Automated Aiven MySQL Deployment")
    print("=" * 60)
    print(f"Connecting to host: {connection_params['host']}:{connection_params['port']}")
    print(f"Target Database:    {connection_params['database']}")
    print(f"User:               {connection_params['user']}")
    print("-" * 60)
    
    # Configure SSL for Aiven Cloud MySQL
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    try:
        connection = pymysql.connect(
            host=connection_params["host"],
            port=connection_params["port"],
            user=connection_params["user"],
            password=connection_params["password"],
            database=connection_params["database"],
            ssl=ssl_context,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
            connect_timeout=15
        )
        print("[SUCCESS] Successfully connected to Aiven Cloud MySQL!")
    except Exception as e:
        print(f"[ERROR] Failed to connect to Aiven MySQL: {e}")
        return False

    if not os.path.exists(sql_file_path):
        print(f"[ERROR] SQL file not found at: {sql_file_path}")
        return False
        
    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()
        
    statements = split_sql_statements(sql_content)
    print(f"Loaded {len(statements)} executable SQL statements from {os.path.basename(sql_file_path)}")
    print("-" * 60)
    
    success_count = 0
    with connection.cursor() as cursor:
        for idx, stmt in enumerate(statements, start=1):
            # Print brief preview of statement
            lines = [l.strip() for l in stmt.splitlines() if l.strip()]
            preview = lines[0][:65] if lines else "EMPTY"
            try:
                cursor.execute(stmt)
                success_count += 1
                print(f"[{idx:02d}/{len(statements):02d}] OK: {preview}...")
            except Exception as stmt_err:
                print(f"[{idx:02d}/{len(statements):02d}] FAILED: {preview}...")
                print(f"         Error: {stmt_err}")
                
    print("-" * 60)
    print(f"Executed {success_count}/{len(statements)} statements successfully.")
    
    # Run Verification Queries
    print("\nVerifying database tables & seed data:")
    tables = ["users", "trainer", "cohort", "notification"]
    with connection.cursor() as cursor:
        for t in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) AS cnt FROM {t}")
                res = cursor.fetchone()
                count = res["cnt"] if res else 0
                print(f"  - Table '{t}': {count} rows")
            except Exception as q_err:
                print(f"  - Table '{t}': Verification query failed ({q_err})")
                
    connection.close()
    print("=" * 60)
    print("[COMPLETED] Aiven Cloud MySQL database is initialized and ready!")
    print("=" * 60)
    return True

def main():
    parser = argparse.ArgumentParser(description="Run TrainMate aiven_setup.sql against Aiven MySQL")
    parser.add_argument("--uri", help="Aiven Service URI (e.g. mysql://avnadmin:pass@host:port/defaultdb?ssl-mode=REQUIRED)")
    parser.add_argument("--host", help="Aiven MySQL Hostname")
    parser.add_argument("--port", type=int, default=3306, help="Aiven MySQL Port")
    parser.add_argument("--user", default="avnadmin", help="Aiven MySQL Username")
    parser.add_argument("--password", help="Aiven MySQL Password")
    parser.add_argument("--database", default="defaultdb", help="Aiven MySQL Database Name")
    parser.add_argument("--file", default=os.path.join(os.path.dirname(__file__), "aiven_setup.sql"), help="Path to SQL file")
    
    args = parser.parse_args()
    
    # Check URI first
    service_uri = args.uri or os.environ.get("AIVEN_SERVICE_URI") or os.environ.get("SPRING_DATASOURCE_URL")
    
    if service_uri and "localhost" not in service_uri:
        connection_params = parse_aiven_uri(service_uri)
        # Override password/user if provided discretely
        if args.user and args.user != "avnadmin":
            connection_params["user"] = args.user
        if args.password:
            connection_params["password"] = args.password
    elif args.host:
        connection_params = {
            "host": args.host,
            "port": args.port,
            "user": args.user,
            "password": args.password or os.environ.get("SPRING_DATASOURCE_PASSWORD", ""),
            "database": args.database
        }
    else:
        print("\n[AIVEN CONNECTION REQUIRED]")
        print("Please provide your Aiven Service URI or host details:")
        print("Example URI: mysql://avnadmin:YOUR_PASSWORD@mysql-xxxx.aivencloud.com:PORT/defaultdb?ssl-mode=REQUIRED\n")
        try:
            uri_input = input("Enter Aiven Service URI: ").strip()
            if not uri_input:
                print("No URI provided. Exiting.")
                sys.exit(1)
            connection_params = parse_aiven_uri(uri_input)
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)
            
    execute_setup(connection_params, args.file)

if __name__ == "__main__":
    main()
