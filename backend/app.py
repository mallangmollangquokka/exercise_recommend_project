from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

LEVEL_INFO = {
    "초급": {"sets": 2, "reps": 10},
    "중급": {"sets": 3, "reps": 15},
    "고급": {"sets": 4, "reps": 20}
}

WEEKLY_FEEDBACK = {
    1: "시작이 반이에요! 내일도 도전해봐요 💪",
    2: "조금씩 늘고 있어요! 꾸준함이 힘이에요 🌱",
    3: "이번 주 절반 성공! 이 페이스 유지해봐요 🔥",
    4: "훌륭해요! 습관이 만들어지고 있어요 ⭐",
    5: "이번 주 정말 열심히 했네요! 몸이 달라지고 있어요 🏃",
    6: "거의 매일 운동했어요! 대단한 의지력이에요 💎",
    7: "완벽한 한 주! 당신은 이미 운동 고수예요 🏆"
}

def get_db_connection():
    conn = sqlite3.connect("exercise.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/recommend", methods=["GET"])
def recommend():
    body_parts = request.args.getlist("body_part")
    equipments = request.args.getlist("equipment")
    goals = request.args.getlist("goal")
    level = request.args.get("level")

    level_data = LEVEL_INFO.get(level, {"sets": 3, "reps": 15})

    conn = get_db_connection()
    cur = conn.cursor()

    conditions = []
    params = []

    if body_parts:
        placeholders = ",".join(["?" for _ in body_parts])
        conditions.append(f"body_part IN ({placeholders})")
        params.extend(body_parts)
    if equipments:
        placeholders = ",".join(["?" for _ in equipments])
        conditions.append(f"equipment IN ({placeholders})")
        params.extend(equipments)
    if goals:
        placeholders = ",".join(["?" for _ in goals])
        conditions.append(f"goal IN ({placeholders})")
        params.extend(goals)

    if conditions:
        query = "SELECT * FROM exercises WHERE " + " AND ".join(conditions)
    else:
        query = "SELECT * FROM exercises"

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    if not rows:
        return jsonify({"exercises": [], "message": "조건에 맞는 운동이 없습니다."})

    sample = random.sample(list(rows), min(3, len(rows)))

    exercises = []
    for row in sample:
        exercises.append({
            "name": row["name"],
            "body_part": row["body_part"],
            "equipment": row["equipment"],
            "goal": row["goal"],
            "video_url": row["video_url"],
            "sets": level_data["sets"],
            "reps": level_data["reps"]
        })

    return jsonify({"exercises": exercises})


@app.route("/save_routine", methods=["POST"])
def save_routine():
    data = request.get_json()
    user_id = data.get("user_id")
    exercises = str(data.get("exercises"))
    date = datetime.now().strftime("%Y-%m-%d")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO routines (user_id, date, exercises)
        VALUES (?, ?, ?)
    """, (user_id, date, exercises))
    conn.commit()
    conn.close()

    return jsonify({"message": "오늘의 루틴 저장 완료! 🎉"})


# 루틴 기록 불러오기 API (추가)
@app.route("/get_routines", methods=["GET"])
def get_routines():
    user_id = request.args.get("user_id")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT date, exercises FROM routines
        WHERE user_id = ?
        ORDER BY date DESC
    """, (user_id,))
    rows = cur.fetchall()
    conn.close()

    routines = []
    for row in rows:
        routines.append({
            "date": row["date"],
            "exercises": row["exercises"]
        })

    return jsonify({"routines": routines})


@app.route("/weekly_stats", methods=["GET"])
def weekly_stats():
    user_id = request.args.get("user_id")

    today = datetime.now()
    start_of_week = (today - timedelta(days=today.weekday())).strftime("%Y-%m-%d")
    end_of_week = (today + timedelta(days=6 - today.weekday())).strftime("%Y-%m-%d")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT COUNT(*) FROM routines
        WHERE user_id = ?
        AND date BETWEEN ? AND ?
    """, (user_id, start_of_week, end_of_week))
    count = cur.fetchone()[0]
    conn.close()

    feedback_key = min(count, 7)
    feedback = WEEKLY_FEEDBACK.get(feedback_key, "이번 주도 화이팅! 💪")

    return jsonify({
        "week_count": count,
        "feedback": feedback
    })

@app.route("/")
def home():
    return send_from_directory("../frontend", "index.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)