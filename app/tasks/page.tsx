import { dummyTasks } from "@/app/(data)/dummy";

export default function TasksPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Tasks</h1>
      <ul className="space-y-2">
        {dummyTasks.map(task => (
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
