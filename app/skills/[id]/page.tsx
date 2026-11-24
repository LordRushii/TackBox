import { fetchSkillById } from "@/features/skills/actions";
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

  return <SkillDetailView initialSkill={skill} />;
}
