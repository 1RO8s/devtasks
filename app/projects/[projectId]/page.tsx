interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;
  return (
    <div>
      <h1 className="text-xl font-semibold">Project: {projectId}</h1>
    </div>
  );
}
