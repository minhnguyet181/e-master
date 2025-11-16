# 🎯 Band Filtering & Study Requirements Features

## 📋 Tổng quan

Tính năng này cho phép:
1. **AI phân loại band** từ placement test results
2. **Lọc tài liệu** theo band level (current hoặc target)
3. **Tính yêu cầu thời gian học** để đạt band mục tiêu

---

## 🔧 Các tính năng đã implement

### 1. Placement Test với AI Band Classification

**Endpoint:** `POST /e-master/placement-test/submit`

Sau khi user làm placement test, AI sẽ:
- Phân tích kết quả test
- Phân loại band hiện tại (ví dụ: "Band 5.0", "Band 6.5")
- Xác định level (Beginner, Intermediate, Advanced)
- Identify weak/strong skills
- Generate study recommendations
- **Tự động update `user.current_band`**

**Request:**
```json
{
  "answers": [
    {"question_id": 1, "answer": "A"},
    {"question_id": 2, "answer": "B"}
  ],
  "scores": {
    "reading": 5.5,
    "listening": 6.0,
    "writing": 5.0,
    "speaking": 5.5
  }
}
```

**Response:**
```json
{
  "success": true,
  "placement_test": {
    "assessed_band": "Band 5.5",
    "assessed_level": "Intermediate",
    "scores": {...},
    "weak_skills": ["writing", "speaking"],
    "strong_skills": ["reading", "listening"],
    "ai_analysis": "...",
    "recommended_program": "...",
    "study_recommendations": [...]
  }
}
```

**Get Result:** `GET /e-master/placement-test/result`

---

### 2. Resource Filtering theo Band

**Endpoint:** `GET /e-master/resources`

Lấy tài liệu phù hợp với user's band (current_band hoặc band_target).

**Query Parameters:**
- `use_target_band` (boolean): `true` = dùng `band_target`, `false` = dùng `current_band`
- `skill` (string): Filter theo skill (writing, reading, speaking, listening, etc.)
- `type` (string): Filter theo type (article, video, exercise, etc.)
- `limit` (number): Số lượng results
- `offset` (number): Pagination offset

**Example:**
```
GET /e-master/resources?use_target_band=false&skill=writing&limit=10
```

**Response:**
```json
{
  "success": true,
  "resources": [...],
  "total": 25,
  "filter_applied": {
    "band": "Band 5.0",
    "skill": "writing",
    "type": "all"
  }
}
```

**Public Endpoint (no auth):** `GET /e-master/resources/by-band?band=Band 5.0`

---

### 3. Study Requirements Calculator

**Endpoint:** `GET /e-master/study-requirements`

Tính yêu cầu thời gian học để đạt band mục tiêu.

**Response:**
```json
{
  "success": true,
  "current_band": "Band 5.0",
  "target_band": "Band 7.0",
  "band_gap": 2.0,
  "minimum_hours_per_week": 15,
  "estimated_weeks": 28,
  "estimated_months": 7,
  "recommendations": [
    "⚠️ Bạn đang học 10 giờ/tuần, nhưng cần ít nhất 15 giờ/tuần...",
    "⏱️ Ước tính thời gian: 7 tháng (28 tuần)..."
  ],
  "study_schedule": {
    "hours_per_week": 15,
    "hours_per_day": 3,
    "days_per_week": 6
  }
}
```

**Custom Calculation:** `POST /e-master/study-requirements/calculate`

```json
{
  "current_band": "Band 5.0",
  "target_band": "Band 7.0",
  "study_hours_per_week": 10
}
```

---

## 📊 Logic Band Filtering

### Band Matching Rules

1. **Range format** (ví dụ: "Band 5-6"):
   - User band phải nằm trong range

2. **Single band** (ví dụ: "Band 5"):
   - User band trong khoảng ±0.5 của resource band

3. **Level names**:
   - Beginner/Elementary: User band ≤ 4.5
   - Intermediate: User band 4.5 - 6.5
   - Upper-Intermediate/Advanced: User band ≥ 6.0

### Study Requirements Formula

- **0.5 band improvement**: ~7 weeks với 8-10 hours/week
- **1.0 band improvement**: ~14 weeks với 10-12 hours/week
- **1.5 band improvement**: ~21 weeks với 12-15 hours/week
- **2.0 band improvement**: ~28 weeks với 15-18 hours/week

---

## 🔄 Flow hoạt động

### Scenario 1: User làm Placement Test

1. User làm placement test
2. Submit kết quả → `POST /e-master/placement-test/submit`
3. AI phân loại band → Update `user.current_band`
4. User xem tài liệu → `GET /e-master/resources` (tự động filter theo `current_band`)

### Scenario 2: User chọn Band muốn học (không test)

1. User chọn `band_target` (ví dụ: "Band 7.0")
2. User xem tài liệu → `GET /e-master/resources?use_target_band=true` (filter theo `band_target`)
3. User xem yêu cầu thời gian → `GET /e-master/study-requirements`

---

## 📁 Files đã tạo/cập nhật

### Models
- `src/models/placementTest.model.js` - Extended với AI assessment fields
- `src/models/user.model.js` - Added `current_band` field
- `src/models/resource.model.js` - Created (có field `level`)

### Services
- `src/services/placementTest.service.js` - AI band classification
- `src/services/resource.service.js` - Band filtering logic
- `src/services/studyRequirement.service.js` - Study time calculation

### Controllers
- `src/controllers/placementTest.controller.js`
- `src/controllers/resource.controller.js`
- `src/controllers/studyRequirement.controller.js`

### Routes
- `src/routes/placementTest.routes.js`
- `src/routes/resource.routes.js`
- `src/routes/studyRequirement.routes.js`
- `src/routes/index.js` - Updated to include new routes

---

## 🚀 Usage Examples

### 1. Submit Placement Test

```bash
curl -X POST http://localhost:1818/e-master/placement-test/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [{"question_id": 1, "answer": "A"}],
    "scores": {"reading": 5.5, "listening": 6.0, "writing": 5.0, "speaking": 5.5}
  }'
```

### 2. Get Resources for User

```bash
curl http://localhost:1818/e-master/resources?skill=writing&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Study Requirements

```bash
curl http://localhost:1818/e-master/study-requirements \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Checklist

- [x] Placement Test model với AI assessment fields
- [x] User model với `current_band` field
- [x] Resource model với `level` field
- [x] AI band classification service
- [x] Resource filtering by band
- [x] Study requirements calculator
- [x] API endpoints
- [x] Routes integration

---

## 📝 Notes

- **Band format**: Sử dụng format "Band X.X" (ví dụ: "Band 5.0", "Band 6.5")
- **Resource level format**: Có thể là "Band 5-6", "Band 5", "Intermediate", etc.
- **AI Classification**: Sử dụng Google Gemini API (cần `GEMINI_API_KEY` trong `.env`)
- **Database**: Cần sync models để tạo tables mới

---

## 🔮 Future Enhancements

- [ ] Vector embeddings cho semantic search
- [ ] Machine learning model để predict band từ test results
- [ ] Adaptive learning path dựa trên band progression
- [ ] Band progression tracking và analytics

