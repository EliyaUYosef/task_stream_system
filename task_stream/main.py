from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from services import transcribe_audio, parse_task_with_gpt
from datetime import datetime, timedelta
import os
from database import Base, engine
from models.task_model import Task
from database import SessionLocal
import re
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware

FUTURE_GRACE_SECONDS = 86_400  # 2 דקות

ALLOWED_AUDIO_TYPES = (
    "audio/",
    "application/octet-stream",  # WhatsApp sometimes sends this
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",  # React (Vite)
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
@app.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    phone: str = Form(...),
    isVoiceNote: bool = Form(False),
    message_what_id: str | None = Form(None),
    timestamp: int | None = Form(None),
):
    # ---- file ----
    if not file:
        raise HTTPException(status_code=400, detail="File is required")

    if not file.content_type or not file.content_type.startswith(ALLOWED_AUDIO_TYPES):
        raise HTTPException(
            status_code=401,
            detail=f"Invalid file type: {file.content_type}"
        )
    
    # ---- phone ----
    if not phone or not phone.isdigit():
        raise HTTPException(
            status_code=402,
            detail="Phone must be a numeric string"
        )
    
    if not re.fullmatch(r"\d{12}", phone):
        raise HTTPException(
            status_code=403,
            detail="phone must be exactly 12 digits"
        )
    
    # ---- timestamp ----
    print("Received timestamp:", timestamp)
    if timestamp is not None:
        try:
            ts = int(timestamp)
        except ValueError:
            raise HTTPException(
                status_code=406,
                detail="timestamp must be a unix timestamp (int)"
            )
        
        # normalize milliseconds
        if ts > 10_000_000_000:
            ts = ts // 1000

        now_ts = int(datetime.utcnow().timestamp())
        week_ago_ts = int((datetime.utcnow() - timedelta(days=7)).timestamp())

        if ts < week_ago_ts:
            raise HTTPException(
                status_code=411,
                detail="timestamp is older than 7 days"
            )

        if ts > now_ts + FUTURE_GRACE_SECONDS:  # 2 דקות קדימה
            raise HTTPException(
                status_code=410,
                detail="timestamp is too far in the future"
            )
            
        
    # ---- message id ----
    if message_what_id is not None and len(message_what_id) < 5:
        raise HTTPException(
            status_code=405,
            detail="message_what_id is too short"
        )

    user_id = phone
    
    db = SessionLocal()
    today = datetime.now().strftime("%Y-%m-%d")
    timestamp = datetime.now()

    base_dir = f"audio_files/users/{user_id}/{today}"
    os.makedirs(base_dir, exist_ok=True)

    file_path = f"{base_dir}/{timestamp}_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    transcript = transcribe_audio(file_path)
    task = parse_task_with_gpt(transcript)
    db_task = Task(
        user_id=user_id,
        audio_path=file_path,
        transcript=transcript,

        title=task.get("title"),
        description=task.get("description"),
        priority=task.get("priority"),
        category=task.get("category"),

        raw_time_expression=task.get("raw_time_expression"),
        deadline_expression=task.get("deadline_expression"),
        estimated_duration_min=task.get("estimated_duration_min"),

        contact_person=task.get("contact_person"),
        location=task.get("location"),
        requested_file=task.get("requested_file"),

        is_night=task.get("is_night"),
        is_event=task.get("is_event"),
        action_type=task.get("action_type"),
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    db.close()
    
    print("= = = = = = = = = = = = = = = =")
    print("Parsed Task:", task)
    print("= = = = = = = = = = = = = = = =")
   
    return {
        "task_id": db_task.id,
        "client_link": f"http://localhost:5175/task/{db_task.id}?phone={user_id}",
        "filename": file.filename,
        "transcript": transcript,
        "parsed_task": task,
    }

from fastapi import Query
from typing import Optional, List
from database import SessionLocal
from models.task_model import Task

@app.get("/tasks")
def get_tasks(
    phone: Optional[str] = Query(None, description="Filter by user phone"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    db = SessionLocal()

    query = db.query(Task)

    if phone:
        query = query.filter(Task.user_id == phone)

    tasks = (
        query
        .order_by(Task.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    db.close()

    return {
        "count": len(tasks),
        "skip": skip,
        "limit": limit,
        "tasks": [
            {
                "id": t.id,
                "user_id": t.user_id,
                "title": t.title,
                "description": t.description,
                "priority": t.priority,
                "category": t.category,

                "audio_path": t.audio_path,
                "transcript": t.transcript,

                "raw_time_expression": t.raw_time_expression,
                "deadline_expression": t.deadline_expression,
                "estimated_duration_min": t.estimated_duration_min,

                "contact_person": t.contact_person,
                "location": t.location,
                "requested_file": t.requested_file,

                "is_night": t.is_night,
                "is_event": t.is_event,
                "action_type": t.action_type,

                "created_at": t.created_at,
            }
            for t in tasks
        ]
    }

from fastapi import HTTPException, Path
from database import SessionLocal
from models.task_model import Task

@app.get("/task/{task_id}")
def get_task_by_id(
    task_id: int = Path(..., ge=1),
    phone: str = Query(..., description="User phone (authorization)"),
):
    db = SessionLocal()

    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == phone)
        .first()
    )

    db.close()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found for this user"
        )

    return {
        "id": task.id,
        "user_id": task.user_id,

        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "category": task.category,

        "audio_path": task.audio_path,
        "transcript": task.transcript,

        "raw_time_expression": task.raw_time_expression,
        "deadline_expression": task.deadline_expression,
        "estimated_duration_min": task.estimated_duration_min,

        "contact_person": task.contact_person,
        "location": task.location,
        "requested_file": task.requested_file,

        "is_night": task.is_night,
        "is_event": task.is_event,
        "action_type": task.action_type,

        "created_at": task.created_at,
    }


@app.post("/task/{task_id}")
def delete_task(
    task_id: int = Path(..., ge=1),
    phone: str = Query(..., description="User phone (authorization)"),
):
    # ---- phone ----
    if not phone or not phone.isdigit():
        raise HTTPException(
            status_code=402,
            detail="Phone must be a numeric string"
        )
    
    if not re.fullmatch(r"\d{12}", phone):
        raise HTTPException(
            status_code=403,
            detail="phone must be exactly 12 digits"
        )
    
    if not isinstance(task_id, int):
        raise HTTPException(
            status_code=400,
            detail="task_id must be an integer"
        )

    if task_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="task_id must be greater than 0"
        )
    db = SessionLocal()

    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == phone)
        .first()
    )

    if not task:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Task not found or not authorized"
        )

    db.delete(task)
    db.commit()
    db.close()

    return {
        "status": "deleted",
        "task_id": task_id,
    }