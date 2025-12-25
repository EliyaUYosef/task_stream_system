import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTaskById } from "../api/tasks";
import { useUser } from "../context/UserContext";

export default function TaskDetails() {
  const { taskId } = useParams();
  const { phone } = useUser();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTaskById(phone, taskId);
        setTask(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load task");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [taskId]);

  if (loading) return <div>⏳ Loading task...</div>;
  if (error) return <div>❌ {error}</div>;
  if (!task) return <div>❓ Task not found</div>;

  return (
    <div>
      <Link to="/">⬅ Back to tasks</Link>

      <h1>📝 {task.title || "Untitled task"}</h1>

      <p>
        <strong>תיאור המשימה:</strong>
        <br />
        {task.description || "—"}
      </p>

      <p>
        <strong>עדיפות (1-5):</strong> {task.priority || "—"}
      </p>

      <p>
        <strong>קטגוריה:</strong> {task.category || "—"}
      </p>

      <p>
        <strong>איש/אנשי קשר:</strong> {task.contact_person || "—"}
      </p>
      <p>
        <strong>מועד אחרון:</strong> {task.deadline_expression || "—"}
      </p>
      <p>
        <strong>זמן משוער:</strong> {task.estimated_duration_min + "דק׳" || "—"}
      </p>
      <p>
        <strong>מיקום:</strong> {task.location || "—"}
      </p>
      <p>
        <strong>מתי:</strong> {task.raw_time_expression || "—"}
      </p>
      <p>
        <strong>קבצים:</strong> {task.requested_file || "—"}
      </p>
      <p>
        <strong>נוצר ב:</strong>{" "}
        {(() => {
          const v = task.created_at;
          if (!v) return "—";
          const d = typeof v === "number" ? new Date(v * 1000) : new Date(v);
          return isNaN(d.getTime()) ? "—" : d.toLocaleString();
        })()}
      </p>
    </div>
  );
}
