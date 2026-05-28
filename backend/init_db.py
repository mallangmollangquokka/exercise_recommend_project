import sqlite3
import csv

conn = sqlite3.connect("exercise.db")
cur = conn.cursor()

# 운동 테이블
cur.execute("""
CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body_part TEXT,
    name TEXT,
    goal TEXT,
    equipment TEXT,
    video_url TEXT
)
""")

# 루틴 저장 테이블 (추가)
cur.execute("""
CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    date TEXT,
    exercises TEXT
)
""")

with open("exercise.csv", newline='', encoding='cp949') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cur.execute("""
        INSERT INTO exercises
        (body_part, name, goal, equipment, video_url)
        VALUES (?, ?, ?, ?, ?)
        """, (
            row['body_part'],
            row['name'],
            row['goal'],
            row['equipment'],
            row['video_url']
        ))

conn.commit()
conn.close()

print("DB 생성 완료!")