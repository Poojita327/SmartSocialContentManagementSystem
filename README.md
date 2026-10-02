# Smart Social Media Content Management System

Assessment-ready React + Node.js/Express + SQLite application implementing content lifecycle management, scheduling simulation, role-based access, engagement simulation, filters, analytics, platform management and edit history.

## Tech stack
- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express
- Database: SQLite
- Authentication: JWT + bcrypt password hashing

## Roles
- Content Creator: create posts, edit own drafts, view own dashboard/history
- Marketing Manager: schedule, bulk schedule, simulate engagement, view analytics
- Admin: full access including platform management

## Demo credentials
All demo passwords are `Demo@123`.
- creator@example.com
- manager@example.com
- admin@example.com

## Run locally
### Backend
```bash
cd backend
npm install
copy .env.example .env   # Windows
# cp .env.example .env  # macOS/Linux
npm start
```
API: http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal.

Optional frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Lifecycle
Draft -> Scheduled -> Published -> Engagement/Analytics.
The backend checks due schedules every 10 seconds and also checks when dashboard/list endpoints are requested.

## Business rules
- SQLite is the source of truth.
- Only drafts can be edited.
- Creators can edit only their own drafts.
- Scheduling is restricted to Marketing Managers/Admins.
- A post can only be scheduled on a platform attached to that post.
- Duplicate active schedules for the same platform and exact timestamp are blocked both by API validation and a SQLite unique index.
- All protected APIs require a JWT.
- Role selection is never trusted from the frontend; the role comes from the authenticated database user.
- Bulk scheduling validates the complete batch before committing it.
- Engagement can only be simulated for published posts.

## Notes for deployment
Set `JWT_SECRET` to a strong random secret in the deployment environment. Do not commit `.env` or the generated SQLite database.
