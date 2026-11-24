import { fetchSkillById } from "@/features/skills/actions";
import { getViewer } from "@/features/auth/server";
import { notFound } from "next/navigation";
import SkillDetailView from "@/components/SkillDetailView";

type SkillPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SkillPage({ params }: SkillPageProps) {
  const { id } = await params;
  const skill = await fetchSkillById(id);

  if (!skill) {
    notFound();
  }

  const user = await getViewer();
  const isOwner = !!(user && skill.authorId === user.id);

  return <SkillDetailView initialSkill={skill} isOwner={isOwner} />;
}

