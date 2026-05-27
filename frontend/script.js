// ==========================================
// 1. user_id 생성 및 관리
// ==========================================
function getUserId() {
    let userId = localStorage.getItem("user_id");
    if (!userId) {
        userId = "user_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("user_id", userId);
    }
    return userId;
}

// ==========================================
// 2. Flask API 요청
// ==========================================
async function fetchRecommend(bodyParts, equipments, goals, level) {
    let params = new URLSearchParams();
    bodyParts.forEach(v => params.append("body_part", v));
    equipments.forEach(v => params.append("equipment", v));
    goals.forEach(v => params.append("goal", v));
    if (level) params.append("level", level);

    const response = await fetch(`http://127.0.0.1:5000/recommend?${params.toString()}`);
    const data = await response.json();
    return data.exercises;
}

// ==========================================
// 3. 영상 재생 (결과 화면)
// ==========================================
function playVideo(videoUrl) {
    const videoFrame = document.getElementById("video-frame");
    if (!videoFrame) return;

    let videoId = "";
    const shortsMatch = videoUrl.match(/shorts\/([^?]+)/);
    const watchMatch = videoUrl.match(/v=([^&]+)/);
    const youtubeMatch = videoUrl.match(/youtu\.be\/([^?]+)/);

    if (shortsMatch) videoId = shortsMatch[1];
    else if (watchMatch) videoId = watchMatch[1];
    else if (youtubeMatch) videoId = youtubeMatch[1];

    if (videoId) {
        videoFrame.innerHTML = `
            <iframe width="100%" height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen>
            </iframe>
        `;
    }

    document.querySelector(".video-player-container").scrollIntoView({ behavior: "smooth" });
}

// ==========================================
// 4. 영상 재생 (즐겨찾기 화면)
// ==========================================
function playFavoriteVideo(videoUrl) {
    const videoFrame = document.getElementById("favorites-video-frame");
    if (!videoFrame) return;

    let videoId = "";
    const shortsMatch = videoUrl.match(/shorts\/([^?]+)/);
    const watchMatch = videoUrl.match(/v=([^&]+)/);
    const youtubeMatch = videoUrl.match(/youtu\.be\/([^?]+)/);

    if (shortsMatch) videoId = shortsMatch[1];
    else if (watchMatch) videoId = watchMatch[1];
    else if (youtubeMatch) videoId = youtubeMatch[1];

    if (videoId) {
        videoFrame.innerHTML = `
            <iframe width="100%" height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen>
            </iframe>
        `;
    }

    document.querySelector(".favorites-video-container").scrollIntoView({ behavior: "smooth" });
}

// ==========================================
// 5. 운동 카드 화면에 그리기
// ==========================================
let currentExercises = [];

function renderExercises(exercises) {
    const container = document.getElementById("workout-results");
    container.innerHTML = "";

    if (!exercises || exercises.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#8d99ae; padding:20px;">조건에 맞는 운동이 없습니다. 다른 조건을 선택해보세요!</p>`;
        return;
    }

    exercises.forEach((exercise, index) => {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const isWished = favorites.some(f => f.name === exercise.name);

        const card = document.createElement("div");
        card.className = "workout-card";
        card.innerHTML = `
            <div class="card-info">
                <div class="badge-container">
                    <span class="badge body-part">${exercise.body_part}</span>
                    <span class="badge equipment">${exercise.equipment}</span>
                    <span class="badge goal">${exercise.goal}</span>
                </div>
                <h3 class="workout-title">${exercise.name}</h3>
                <p class="workout-sets">${exercise.sets}세트 × ${exercise.reps}회</p>
                <button type="button" class="play-video-btn" onclick="playVideo('${exercise.video_url}')">▶ 이 운동 영상 재생</button>
                <button type="button" class="wish-btn" id="wish-${index}" onclick="toggleFavorite(${index})">${isWished ? "❤️" : "🤍"}</button>
            </div>
        `;
        container.appendChild(card);
    });

    const notice = document.createElement("p");
    notice.style = "text-align:center; color:#8d99ae; font-size:12px; margin-top:10px; line-height:1.6;";
    notice.textContent = "이 영상은 외부 재생이 제한되어 있을 수 있어요. 영상이 재생되지 않으면 YouTube에서 보기를 클릭하세요! 🎬";
    container.appendChild(notice);
}

// ==========================================
// 6. 즐겨찾기
// ==========================================
function toggleFavorite(index) {
    const exercise = currentExercises[index];
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const wishBtn = document.getElementById(`wish-${index}`);
    const exists = favorites.some(f => f.name === exercise.name);

    if (exists) {
        favorites = favorites.filter(f => f.name !== exercise.name);
        wishBtn.textContent = "🤍";
        alert(`${exercise.name} 즐겨찾기에서 삭제됐어요!`);
    } else {
        favorites.push(exercise);
        wishBtn.textContent = "❤️";
        alert(`${exercise.name} 즐겨찾기에 추가됐어요!`);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const container = document.getElementById("favorites-list");
    container.innerHTML = "";

    const videoArea = document.createElement("div");
    videoArea.className = "favorites-video-container";
    videoArea.innerHTML = `
        <div id="favorites-video-frame" class="video-placeholder">
            <span>📺 하단 카드에서 [영상 보기]를 누르면 여기에 재생됩니다.</span>
        </div>
    `;
    container.appendChild(videoArea);

    if (favorites.length === 0) {
        const empty = document.createElement("p");
        empty.style = "text-align:center; color:#8d99ae; padding:20px;";
        empty.textContent = "즐겨찾기한 운동이 없어요!";
        container.appendChild(empty);
    } else {
        favorites.forEach((exercise, index) => {
            const card = document.createElement("div");
            card.className = "workout-card";
            card.innerHTML = `
                <div class="card-info">
                    <div class="badge-container">
                        <span class="badge body-part">${exercise.body_part}</span>
                        <span class="badge equipment">${exercise.equipment}</span>
                        <span class="badge goal">${exercise.goal}</span>
                    </div>
                    <h3 class="workout-title">${exercise.name}</h3>
                    <button type="button" class="play-video-btn" onclick="playFavoriteVideo('${exercise.video_url}')">▶ 영상 보기</button>
                    <button type="button" class="wish-btn" onclick="removeFavorite(${index})">❤️</button>
                </div>
            `;
            container.appendChild(card);
        });

        const notice = document.createElement("p");
        notice.style = "text-align:center; color:#8d99ae; font-size:12px; margin-top:10px; line-height:1.6;";
        notice.textContent = "이 영상은 외부 재생이 제한되어 있을 수 있어요. 영상이 재생되지 않으면 YouTube에서 보기를 클릭하세요! 🎬";
        container.appendChild(notice);
    }

    navigateToPage("step-favorites");
}

function removeFavorite(index) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    showFavorites();
}

// ==========================================
// 7. 루틴 저장 (전역 변수로 exercises 관리)
// ==========================================
let savedExercises = [];

async function saveRoutine() {
    const userId = getUserId();

    try {
        await fetch("http://127.0.0.1:5000/save_routine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                exercises: savedExercises.map(e => e.name)
            })
        });

        const statsEl = document.getElementById("weekly-stats");
        if (statsEl) {
            statsEl.textContent = "✅ 루틴이 저장됐어요!";
            setTimeout(() => fetchWeeklyStats(), 2000);
        }

    } catch (error) {
        console.error("저장 오류:", error);
    }
}

// ==========================================
// 8. 주간 통계
// ==========================================
async function fetchWeeklyStats() {
    const userId = getUserId();
    const response = await fetch(`http://127.0.0.1:5000/weekly_stats?user_id=${userId}`);
    const data = await response.json();

    const statsEl = document.getElementById("weekly-stats");
    if (statsEl) {
        statsEl.textContent = `이번 주 ${data.week_count}회 운동 | ${data.feedback}`;
    }
}

// ==========================================
// 9. 검색 버튼 클릭
// ==========================================
document.getElementById("search-btn").addEventListener("click", async function (e) {
    e.preventDefault();

    const bodyParts = [...document.querySelectorAll("#body-part-filters .btn.active")].map(b => b.dataset.value);
    const equipments = [...document.querySelectorAll("#equipment-filters .btn.active")].map(b => b.dataset.value);
    const goals = [...document.querySelectorAll("#goal-filters .btn.active")].map(b => b.dataset.value);
    const level = document.querySelector("#level-filters .btn.active")?.dataset.value;

    if (goals.length === 0) { alert("운동 목적을 선택해주세요!"); return; }
    if (bodyParts.length === 0) { alert("운동 부위를 선택해주세요!"); return; }
    if (equipments.length === 0) { alert("운동 도구를 선택해주세요!"); return; }
    if (!level) { alert("난이도를 선택해주세요!"); return; }

    navigateToPage("step-result");

    document.getElementById("workout-results").innerHTML = `<p style="text-align:center; color:#8d99ae; padding:20px;">운동을 찾는 중입니다... ⏳</p>`;

    try {
        const exercises = await fetchRecommend(bodyParts, equipments, goals, level);
        currentExercises = exercises;
        savedExercises = exercises;
        renderExercises(exercises);
        fetchWeeklyStats();

    } catch (error) {
        document.getElementById("workout-results").innerHTML = `<p style="text-align:center; color:#ff4d4d; padding:20px;">오류가 발생했습니다. 서버가 켜져있는지 확인해주세요!</p>`;
    }
});

// 저장 버튼 이벤트 (전역으로 분리)
document.getElementById("save-routine-btn").addEventListener("click", function(e) {
    e.preventDefault();
    saveRoutine();
});

// ==========================================
// 10. 루틴 기록 불러오기
// ==========================================
async function showHistory() {
    const userId = getUserId();
    const container = document.getElementById("history-list");
    container.innerHTML = `<p style="text-align:center; color:#8d99ae; padding:20px;">불러오는 중... ⏳</p>`;

    navigateToPage("step-history");

    try {
        const response = await fetch(`http://127.0.0.1:5000/get_routines?user_id=${userId}`);
        const data = await response.json();

        container.innerHTML = "";

        if (!data.routines || data.routines.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#8d99ae; padding:20px;">저장된 루틴 기록이 없어요!</p>`;
            return;
        }

        data.routines.forEach(routine => {
            const exerciseList = routine.exercises
                .replace(/[\[\]']/g, "")
                .split(",")
                .map(e => e.trim())
                .join(", ");

            const card = document.createElement("div");
            card.className = "workout-card";
            card.innerHTML = `
                <div class="card-info">
                    <p style="font-size:13px; color:#8d99ae; margin-bottom:8px;">📅 ${routine.date}</p>
                    <p style="font-size:15px; color:#1d1e2c; font-weight:500; line-height:1.6;">${exerciseList}</p>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = `<p style="text-align:center; color:#ff4d4d; padding:20px;">불러오기 실패! 서버가 켜져있는지 확인해주세요.</p>`;
    }
}