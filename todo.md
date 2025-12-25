# TASKSTREAM — PROJECT PLAN (V1)

## רכיבי מערכת (סופיים)

- api (FastAPI)
- worker (תמלול + AI)
- wa-gateway (Baileys)
- client (React)
- mongo
- redis
- nginx (SSL + routing)

---

## Pipeline (קבוע, לא משתנה)

input  
→ transcription  
→ parse (LLM)  
→ normalize_time (קוד)  
→ validate  
→ READY / WAITING_FOR_INPUT

---

## שלבי פיתוח (בסדר ביצוע)

### שלב 1 — תשתית (DevOps נסגר)

מטרה: הכל רץ בדוקר עם SSL

- EC2 (Ubuntu)
- Docker + Docker Compose
- Nginx בדוקר
- SSL (Let’s Encrypt)
- API בסיסי (/health)
- React בסיסי
- docker compose up אחד שמרים הכל

---

### שלב 2 — דאטה + אבטחה בסיסית

- MongoDB בדוקר + volume
- User מינימלי (user_id = phone)
- Token / API key פנימי
- הרשאות בסיסיות (owner / shared)

---

### שלב 3 — WhatsApp → API → React

- Baileys מחובר
- הודעת טקסט → API
- יצירת Task
- החזרת לינק ל־React
- React מציג Task

---

### שלב 4 — Worker + S3

- העלאת אודיו ל־S3
- Job ל־Redis
- Worker:
  - תמלול
  - שמירת transcript
- API מעדכן Task

---

### שלב 5 — Pipeline (הכי חשוב)

- Prompt קבוע ל־parse
- normalize_time()
- validator קשיח
- שאלה אחת בלבד אם חסר זמן

---

### שלב 6 — תזכורות ומייל

- חיבור SMTP (SES / SendGrid)
- שליחת מייל
- יצירת קובץ ICS
- תזכורות דרך worker

---

### שלב 7 — שיתוף וחזרתיות

- משתתפים
- הרשאות שיתוף
- משימות חוזרות
- visibility

---

## חוקי עבודה

- שלב אחד פתוח בכל רגע
- לא מוסיפים פיצ’ר לפני שסוגרים שלב
- DevOps נסגר בשלב 1 ולא נוגעים בו
- Task הוא מקור האמת
