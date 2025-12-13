# Flashcard Learning System - Frontend

Frontend React application cho Flashcard Learning System với thiết kế Neobrutalism.

## 🎨 Thiết kế

Ứng dụng sử dụng phong cách **Neobrutalism** với:
- Màu sắc tươi sáng, đậm (Primary: #FF6B6B, Secondary: #4ECDC4, Accent: #FFE66D)
- Border dày, đen (4px)
- Shadow rõ ràng (brutal shadow)
- Typography đậm, rõ ràng
- Layout đơn giản, không có border radius

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn

### Cài đặt dependencies

```bash
cd ui
npm install
```

### Cấu hình môi trường

Tạo file `.env` trong thư mục `ui`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Build cho production

```bash
npm run build
```

Files sẽ được build vào thư mục `dist/`

## 📁 Cấu trúc dự án

```
ui/
├── src/
│   ├── components/              # Reusable components
│   │   └── Layout.tsx          # Main layout với navigation
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── pages/                   # Page components
│   │   ├── auth/                # Login, Register
│   │   ├── student/             # Student pages
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── StudyPage.tsx
│   │   │   ├── DecksPage.tsx
│   │   │   ├── DeckDetailPage.tsx
│   │   │   ├── DeckStudyPage.tsx
│   │   │   ├── BrowseDecksPage.tsx
│   │   │   ├── BadgesPage.tsx
│   │   │   ├── ClassesPage.tsx
│   │   │   ├── ClassDetailPage.tsx
│   │   │   └── ExamsPage.tsx
│   │   ├── teacher/             # Teacher pages
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── TeacherClassesPage.tsx
│   │   │   ├── TeacherClassDetailPage.tsx
│   │   │   └── TeacherExamsPage.tsx
│   │   └── admin/               # Admin pages
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminUsersPage.tsx
│   │       └── AdminBadgesPage.tsx
│   ├── routes/                  # Routing configuration
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   ├── services/                # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── deckService.ts
│   │   ├── learningService.ts
│   │   ├── badgeService.ts
│   │   ├── classService.ts
│   │   ├── examService.ts
│   │   └── userService.ts
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   ├── utils/                   # Utility functions
│   │   └── badgeChecker.ts      # Badge criteria checking logic
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 Tính năng

### Student
- ✅ Dashboard với thống kê học tập
- ✅ Study flashcards với spaced repetition
- ✅ Quản lý decks và flashcards (My Decks)
- ✅ Browse public decks với search
- ✅ Xem chi tiết deck và study từng deck
- ✅ Xem và claim badges
- ✅ Tham gia classes và xem class details
- ✅ Xem và làm exams được assign
- ✅ Navigation: Dashboard → My Decks → Browse/View/Study → Classes → Exams → Badges

### Teacher
- ✅ Dashboard quản lý classes và exams
- ✅ Tạo và quản lý classes (Classes page)
- ✅ Xem chi tiết class và assign decks/exams
- ✅ Tạo và quản lý exams (Exams page)
- ✅ Assign exams cho classes
- ✅ Navigation: Dashboard → Classes → Exams

### Admin
- ✅ Dashboard quản lý users và badges
- ✅ Quản lý users (Users page)
- ✅ Tạo và quản lý badges (Badges Management page)
- ✅ Navigation: Dashboard → Users → Badges

## 🏆 Badge System

Hệ thống badge với logic tự động check và unlock:

### Criteria Types
- `cards_learned`: Số lượng cards đã học
- `streak`: Số ngày học liên tiếp
- `total_xp`: Tổng điểm XP
- `decks_completed`: Số decks đã hoàn thành
- `exams_passed`: Số exams đã pass

### Operators
- `gte`: Greater than or equal (>=)
- `lte`: Less than or equal (<=)
- `eq`: Equal (==)

### Logic Check
Badge sẽ tự động được unlock khi:
1. User stats đạt criteria
2. Progress >= 100%
3. Status chuyển từ LOCKED → UNLOCKED

User có thể claim badge để nhận XP reward.

## 🎨 Components

### Brutal Design Components

- `btn-brutal`: Button với brutal style
- `btn-primary`: Primary button (đỏ)
- `btn-secondary`: Secondary button (xanh)
- `btn-accent`: Accent button (vàng)
- `card-brutal`: Card với border và shadow
- `input-brutal`: Input với brutal style
- `badge-brutal`: Badge component

## 🔐 Authentication

- JWT token được lưu trong `localStorage`
- Auto redirect khi token hết hạn
- Protected routes cho các pages cần authentication

## 📡 API Integration

Tất cả API calls được thực hiện qua:
- `src/services/api.ts`: Axios instance với interceptors
- Các service files trong `src/services/`

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📝 Notes

- Backend API phải chạy tại `http://localhost:8000`
- CORS phải được enable trên backend
- JWT token được tự động thêm vào headers

## 🐛 Troubleshooting

### API connection errors
- Kiểm tra backend đã chạy chưa
- Kiểm tra CORS settings
- Kiểm tra `VITE_API_URL` trong `.env`

### Build errors
- Xóa `node_modules` và `dist`
- Chạy `npm install` lại
- Kiểm tra TypeScript errors

## 📄 License

MIT

