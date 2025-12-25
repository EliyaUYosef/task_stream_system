from database import SessionLocal
from models.task_model import Task

db = SessionLocal()
db.query(Task).delete()
db.commit()
db.close()