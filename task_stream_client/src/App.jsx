import { Routes, Route } from "react-router-dom";
import TasksList from "./pages/TasksList";
import TasksCalendar from "./pages/TasksCalendar";
import TaskDetails from "./pages/TaskDetails";
import AddTask from "./pages/AddTask";
function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<TasksList />}
      />
      <Route
        path="/add"
        element={<AddTask />}
      />
      <Route
        path="/calendar"
        element={<TasksCalendar />}
      />
      <Route
        path="/task/:taskId"
        element={<TaskDetails />}
      />
    </Routes>
  );
}

export default App;
