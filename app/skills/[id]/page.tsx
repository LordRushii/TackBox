import { fetchSkillById } from "@/app/actions/skills";
import { getCurrentUserAction } from "@/app/actions/auth";
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

  const user = await getCurrentUserAction();
  const isOwner = !!(user && (skill as any).authorId === user.id);

  return <SkillDetailView initialSkill={skill} isOwner={isOwner} />;
}
