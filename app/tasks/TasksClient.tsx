"use client";

import useSWR from "swr";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TasksClient() {
  const { data, error, isLoading } = useSWR<Task[]>("/api/tasks", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Failed to load</div>;

  return (
    <ul className="space-y-2">
      {data.map((task) => (
        <li key={task.id} className="border p-3 rounded">
          <div className="font-medium">{task.title}</div>
          <div className="text-sm text-gray-600">
            Status: {task.status} / Priority: {task.priority}
          </div>
        </li>
      ))}
    </ul>
  );
}
