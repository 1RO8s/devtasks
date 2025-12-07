// app/tasks/page.tsx
type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
};

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch("http://localhost:3000/api/tasks", {
    // SSRの場合: リクエストごとに最新を取得する
    cache: "no-store",
    // ISRの場合: 10秒ごとに静的ページを作り直す
    // next: { revalidate: 10 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return res.json();
}

export default async function TasksPage() {
  const tasks = await fetchTasks();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Tasks</h1>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="border p-3 rounded">
            <div className="font-medium">{task.title}</div>
            <div className="text-sm text-gray-600">
              Status: {task.status} / Priority: {task.priority}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
