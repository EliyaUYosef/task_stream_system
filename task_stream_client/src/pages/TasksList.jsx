import { useEffect, useState } from "react";
import { fetchTasks } from "../api/tasks";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Style from "./TasksList.module.css";
import { deleteTaskById } from "../api/tasks";
export default function TasksList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { phone } = useUser();

  async function deleteTask(id, title) {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את המשימה: ${title}?`)) return;

    try {
      await deleteTaskById(phone, id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
      alert("אירעה שגיאה במחיקת המשימה");
    }
  }
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTasks(phone);
        console.log(data);
        setTasks(data.tasks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div>⏳ Loading tasks...</div>;

  return (
    <div
      className={Style.container}
      dir="rtl"
    >
      <h2 className={Style.pageTitle}>משימות</h2>

      {tasks.length === 0 && <p className={Style.noTasksMessage}>אין משימות</p>}

      <ul className={Style.tasksList}>
        {tasks.map((task) => (
          <li
            key={task.id}
            className={Style.taskItem}
          >
            <p className={Style.taskTitle}>{task.title}</p>
            <p className={Style.taskDescription}>{task.description}</p>
            <em className={Style.taskTimestamp}>
              {" -  "}
              {(() => {
                const v = task.created_at;
                if (!v) return "—";
                const d =
                  typeof v === "number" ? new Date(v * 1000) : new Date(v);
                return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
              })()}
            </em>
            <div className={Style.taskActions}>
              <Link
                title={"מעבר לפרטי המשימה"}
                to={`/task/${task.id}`}
                style={{ padding: "8px" }}
              >
                📋
              </Link>
              <button
                title={"מחק משימה"}
                onClick={() => deleteTask(task.id, task.title)}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
