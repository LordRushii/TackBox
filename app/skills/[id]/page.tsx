import { getSkills } from "../skills";
import { notFound } from "next/navigation";
import SkillDetailView from "@/components/SkillDetailView";

type SkillPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SkillPage({ params }: SkillPageProps) {
  const { id } = await params;
  const allSkills = await getSkills();
  const skill = allSkills.find((s) => s.id === id);

  if (!skill) {
    notFound();
  }

  return <SkillDetailView initialSkill={skill} />;
}
