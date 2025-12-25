const API_URL = "http://localhost:3100";

export async function fetchTasks(phone) {
  const res = await fetch(`${API_URL}/tasks?phone=${phone}`);
  console.log(`${API_URL}/tasks?phone=${phone}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function fetchTaskById(phone, taskId) {
  const res = await fetch(`${API_URL}/task/${taskId}?phone=${phone}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

export async function deleteTaskById(phone, taskId) {
  const res = await fetch(`${API_URL}/task/${taskId}?phone=${phone}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to delete task");
  }

  return res.json();
}
