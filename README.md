# Flashcard Learning System - Backend API

Hệ thống backend FastAPI cho Flashcard Learning System với JWT authentication, Pydantic validation và kiến trúc phân lớp.

## Cấu trúc dự án

```
flashcard_learning_ooad/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── users.py         # User management endpoints
│   │       ├── decks.py          # Deck management endpoints
│   │       ├── learning.py       # Learning & review endpoints
│   │       ├── classroom.py      # Class management endpoints
│   │       ├── exam.py           # Exam endpoints
│   │       └── gamification.py  # Badges & leaderboard endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Application configuration
│   │   ├── database.py          # Database connection
│   │   ├── security.py          # JWT & password hashing
│   │   └── dependencies.py      # FastAPI dependencies
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # User models
│   │   ├── deck.py              # Deck & Flashcard models
│   │   ├── learning.py          # Learning models
│   │   ├── classroom.py         # Class models
│   │   ├── gamification.py      # Badge models
│   │   └── exam.py              # Exam models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py              # User Pydantic schemas
│   │   ├── deck.py              # Deck Pydantic schemas
│   │   ├── learning.py          # Learning Pydantic schemas
│   │   ├── classroom.py         # Class Pydantic schemas
│   │   ├── gamification.py      # Badge Pydantic schemas
│   │   └── exam.py              # Exam Pydantic schemas
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── user_repository.py
│   │   ├── deck_repository.py
│   │   ├── learning_repository.py
│   │   ├── classroom_repository.py
│   │   ├── exam_repository.py
│   │   └── gamification_repository.py
│   └── services/
│       ├── __init__.py
│       ├── auth_service.py
│       ├── deck_service.py
│       └── learning_service.py
├── alembic/                     # Database migrations
├── main.py                      # FastAPI application entry point
├── requirements.txt             # Python dependencies
└── README.md

```

## Cài đặt

1. **Tạo virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate  # Windows
```

2. **Cài đặt dependencies:**

```bash
pip install -r requirements.txt
```

3. **Cấu hình môi trường:**

```bash
# Copy file env.example thành .env
cp env.example .env
# hoặc trên Windows:
copy env.example .env

# Chỉnh sửa .env với thông tin database của bạn:
# - DATABASE_URL: Thay đổi username, password, host, port và database name
# - SECRET_KEY: Tạo secret key mạnh (có thể dùng: openssl rand -hex 32)
# - DEBUG: Đặt False cho production
```

4. **Tạo database:**

```bash
# Tạo database MySQL
mysql -u root -p
CREATE DATABASE flashcard_db;
```

5. **Chạy migrations:**

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

6. **Chạy server:**

```bash
uvicorn main:app --reload
```

Server sẽ chạy tại `http://localhost:8000`

## API Documentation

Sau khi chạy server, truy cập:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Kiến trúc

Hệ thống sử dụng kiến trúc phân lớp:

1. **API Layer** (`app/api/v1/`): Xử lý HTTP requests/responses
2. **Service Layer** (`app/services/`): Business logic
3. **Repository Layer** (`app/repositories/`): Data access
4. **Model Layer** (`app/models/`): SQLAlchemy ORM models
5. **Schema Layer** (`app/schemas/`): Pydantic validation schemas

## Authentication

Hệ thống sử dụng JWT (JSON Web Tokens) cho authentication:

1. **Register:** `POST /api/v1/auth/register`
2. **Login:** `POST /api/v1/auth/login`
3. **Protected endpoints:** Yêu cầu Bearer token trong header:
   ```
   Authorization: Bearer <access_token>
   ```

## Các Use Cases đã implement

### Guest User

- ✅ Browse Deck
- ✅ Register
- ✅ Login

### Authenticated User

- ✅ Manage Favorite Decks
- ✅ Manage Account
- ✅ Forgot password
- ✅ View leaderboard
- ✅ Manage Deck
- ✅ Check study progress
- ✅ Change spaced repetition

### Student

- ✅ Review a deck
- ✅ Take exam
- ✅ View and claim badges
- ✅ Manage Notifications

### Teacher

- ✅ Assign Exam to Class
- ✅ Manage Exam
- ✅ Manage Class
- ✅ Assign Deck to Class

### Admin

- ✅ Manage Users

## Database Models

Hệ thống bao gồm 19 entities theo ERD:

- Users, UserPreferences, NotificationLogs
- Decks, Flashcards, UserFavoriteDecks
- CardRetentionData, ReviewLogs, UserStats, AlgoConfigs
- Classes, ClassDecks, ClassMembers
- Badges, UserBadges
- Exams, ExamAssignments, ExamResults, Questions

## Spaced Repetition Algorithm

Hệ thống sử dụng SM-2 algorithm để tính toán thời gian review tiếp theo dựa trên:

- Quality (0-5)
- Ease factor
- Interval days
- Repetition count
- User's algorithm configuration

## Notes

- Tất cả endpoints đều có validation với Pydantic
- JWT tokens có thời gian hết hạn (mặc định 30 phút)
- Password được hash bằng bcrypt
- Database sử dụng MySQL với SQLAlchemy ORM
- Migrations được quản lý bằng Alembic
