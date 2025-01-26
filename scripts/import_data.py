import pandas as pd
import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('../backend/.env')
DATABASE_URL = os.getenv('DATABASE_URL')

def connect_to_db():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("Successfully connected to PostgreSQL database")
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def import_projects(conn):
    try:
        df = pd.read_csv('data/csv/projects.csv')
        print("\nProjects data preview:")
        print(df.head())
        
        cursor = conn.cursor()
        # 创建 ID 映射字典：原始ID -> 新ID
        id_mapping = {}
        
        for index, row in df.iterrows():
            sql = """
                INSERT INTO "Project" (
                    title, description, institution, "projectType", "skillLevel",
                    status, "createdAt", "updatedAt", "creatorId"
                ) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            values = (
                row['title'],
                row['description'],
                row['institution'],
                row['projectType'],
                row['skillLevel'],
                'active',
                datetime.now(),
                datetime.now(),
                1  # 默认创建者ID为1
            )
            cursor.execute(sql, values)
            new_id = cursor.fetchone()[0]
            original_id = row['id']
            id_mapping[original_id] = new_id
            print(f"Imported project {index + 1}/{len(df)}: Original ID {original_id} -> New ID {new_id}")
        
        conn.commit()
        print("Projects data imported successfully")
        return id_mapping
    except Exception as e:
        print(f"Error importing projects: {e}")
        conn.rollback()
        return {}

def import_media(conn, id_mapping):
    try:
        df = pd.read_csv('data/csv/media.csv')
        print("\nMedia data preview:")
        print(df.head())
        
        cursor = conn.cursor()
        
        for index, row in df.iterrows():
            original_project_id = row['projectId']
            new_project_id = id_mapping.get(original_project_id)
            
            if new_project_id is None:
                print(f"Skipping media record {index + 1}: Cannot map original projectId {original_project_id}")
                continue
                
            sql = """
                INSERT INTO "Media" (url, key, type, "createdAt", "projectId")
                VALUES (%s, %s, %s, %s, %s)
            """
            values = (
                row['url'],
                row['key'],
                row['type'],
                datetime.now(),
                new_project_id  # 使用新的项目ID
            )
            cursor.execute(sql, values)
            print(f"Imported media {index + 1}/{len(df)}: Mapped projectId {original_project_id} -> {new_project_id}")
        
        conn.commit()
        print("Media data imported successfully")
    except Exception as e:
        print(f"Error importing media: {e}")
        conn.rollback()

def main():
    conn = connect_to_db()
    if not conn:
        return

    try:
        # 先导入 projects 并获取 ID 映射
        print("Step 1: Importing projects...")
        id_mapping = import_projects(conn)
        
        if not id_mapping:
            print("No projects were imported. Stopping media import.")
            return
            
        print(f"\nID Mapping: {id_mapping}")
        
        # 使用 ID 映射导入 media
        print("\nStep 2: Importing media...")
        import_media(conn, id_mapping)
        
        print("\nImport process completed!")
    except Exception as e:
        print(f"Error during import process: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main() 