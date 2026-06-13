export type Skill = {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  content?: string;
  tags?: string[];
  visibility?: "public" | "private";
  views?: number;
  downloads?: number;
  saves?: number;
  stars?: number;
  hasStarred?: boolean;
  version?: string;
  license?: string;
  authorName?: string;
  authorUsername?: string;
  authorRole?: string;
  authorBio?: string;
  authorAvatarColor?: string;
  level?: string;
}

export let SKILLS: Skill[] = [
  {
    id: "1",
    name: "Next.js Performance Optimization",
    description: "A comprehensive guide to optimize Next.js applications for better performance and user experience.",
    category: "Frontend",
    createdAt: "2024-05-10T10:00:00.000Z",
    updatedAt: "2024-05-12T10:30:00.000Z",
    content: `# Next.js Performance Optimization

This skill covers best practices and advanced techniques to improve the performance of your Next.js applications.

## 1. Image Optimization

Use the 'next/image' component for automatic image optimization.

\`\`\`tsx
import Image from 'next/image';
...
<Image
  src="/hero.png"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>
\`\`\`

## 2. Code Splitting

Use dynamic imports for large components.

\`\`\`tsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
\`\`\`
`,
    tags: ["Next.js", "Performance", "React", "Optimization"],
    visibility: "public",
    views: 2400,
    downloads: 843,
    saves: 256,
    stars: 128,
    version: "1.0.0",
    license: "MIT",
    authorName: "Ronak Shah",
    authorUsername: "ronakdev",
    authorBio: "Frontend developer specialized in React, Next.js and performance optimization.",
    authorRole: "Frontend Developer",
    authorAvatarColor: "from-blue-600 to-indigo-600",
  },
  {
    id: "2",
    name: "Kubernetes Orchestration & CLI Capability",
    description: "Allows agents to automatically containerize projects, compile Dockerfiles, write Kubernetes manifests, and manage deployments.",
    category: "DevOps",
    createdAt: "2024-06-01T12:00:00.000Z",
    updatedAt: "2024-06-02T15:30:00.000Z",
    content: `# Kubernetes Orchestration & CLI Capability

Learn how to construct Kubernetes deployment files and run basic CLI diagnostic commands.

## 1. Minimal Deployment Manifest

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: nginx:alpine
\`\`\`
`,
    tags: ["Kubernetes", "Docker", "DevOps", "Orchestration"],
    visibility: "public",
    views: 1250,
    downloads: 420,
    saves: 198,
    stars: 98,
    version: "1.1.0",
    license: "Apache-2.0",
    authorName: "Demo User",
    authorUsername: "demouser",
    authorBio: "Developer, systems architect, and automation enthusiast.",
    authorRole: "Member",
    authorAvatarColor: "from-pink-500 to-rose-500",
  }
];

export const Skill = SKILLS;

export async function getSkills() {
  await delay(800);
  return [...SKILLS];
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function addSkill(skill: Skill) {
  await delay(1000);
  SKILLS = [...SKILLS, skill];
  console.log('Skills updated', SKILLS);
  return getSkills();
}

export async function updateSkill(id: string, updated: Partial<Skill>) {
  await delay(800);
  SKILLS = SKILLS.map(s => s.id === id ? { ...s, ...updated, updatedAt: new Date().toISOString() } : s);
  console.log('Skill updated', id, updated);
  return getSkills();
}

export async function deleteSkill(id: string) {
  await delay(800);
  SKILLS = SKILLS.filter(s => s.id !== id);
  console.log('Skill deleted', id);
  return getSkills();
}