import pandas as pd
import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('../backend/.env')
DATABASE_URL = os.getenv('DATABASE_URL')

# 定义 CSV 文件路径
CSV_DIR = 'data/csv'
PROJECTS_CSV = os.path.join(CSV_DIR, 'projects.csv')
TAGS_CSV = os.path.join(CSV_DIR, 'tags.csv')
MEDIA_CSV = os.path.join(CSV_DIR, 'media.csv')

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
        print(f"\nReading projects from: {PROJECTS_CSV}")
        df = pd.read_csv(PROJECTS_CSV)
        print("Projects CSV columns:", df.columns.tolist())
        print("\nFirst few rows of projects.csv:")
        print(df.head())
        
        cursor = conn.cursor()
        
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
            print(f"Imported project {index + 1}/{len(df)}")
        
        conn.commit()
        print("Projects data imported successfully")
    except Exception as e:
        print(f"Error importing projects: {e}")
        print("Error details:", str(e))

def import_tags(conn):
    try:
        print(f"\nReading tags from: {TAGS_CSV}")
        df = pd.read_csv(TAGS_CSV)
        print("Tags CSV columns:", df.columns.tolist())
        print("\nFirst few rows of tags.csv:")
        print(df.head())
        
        cursor = conn.cursor()
        
        for index, row in df.iterrows():
            # 先插入标签
            sql = """
                INSERT INTO "Tag" (name, "createdAt")
                VALUES (%s, %s)
                ON CONFLICT (name) DO NOTHING
                RETURNING id
            """
            values = (row['name'], datetime.now())
            cursor.execute(sql, values)
            
            # 如果有项目ID，创建关联
            if 'projectId' in row:
                sql = """
                    INSERT INTO "_ProjectToTag" ("A", "B")
                    VALUES (%s, %s)
                """
                cursor.execute(sql, (row['projectId'], cursor.fetchone()[0]))
            
            print(f"Imported tag {index + 1}/{len(df)}")
        
        conn.commit()
        print("Tags data imported successfully")
    except Exception as e:
        print(f"Error importing tags: {e}")
        print("Error details:", str(e))

def import_media(conn):
    try:
        print(f"\nReading media from: {MEDIA_CSV}")
        df = pd.read_csv(MEDIA_CSV)
        print("Media CSV columns:", df.columns.tolist())
        print("\nFirst few rows of media.csv:")
        print(df.head())
        
        cursor = conn.cursor()
        
        for index, row in df.iterrows():
            sql = """
                INSERT INTO "Media" (url, key, type, "createdAt", "projectId")
                VALUES (%s, %s, %s, %s, %s)
            """
            values = (
                row['url'],
                row['key'],
                row['type'],
                datetime.now(),
                row['projectId']
            )
            cursor.execute(sql, values)
            print(f"Imported media {index + 1}/{len(df)}")
        
        conn.commit()
        print("Media data imported successfully")
    except Exception as e:
        print(f"Error importing media: {e}")
        print("Error details:", str(e))

def main():
    # 检查文件是否存在
    for csv_file in [PROJECTS_CSV, TAGS_CSV, MEDIA_CSV]:
        if not os.path.exists(csv_file):
            print(f"Error: File not found: {csv_file}")
            return

    conn = connect_to_db()
    if not conn:
        return

    try:
        # 按顺序导入数据
        import_projects(conn)
        import_tags(conn)
        import_media(conn)
        
        print("All data imported successfully!")
    except Exception as e:
        print(f"Error during import: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main() 