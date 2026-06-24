import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { z } from "zod";

/**
 * Validation schema for skill data
 * Ensures all required fields are present and properly formatted
 */
const SkillSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().optional(),
});

const RequestBodySchema = z.object({
  skill: SkillSchema,
});

type SkillData = z.infer<typeof SkillSchema>;

/**
 * GET handler - Health check endpoint
 * Returns service status and verifies environment configuration
 */
export async function GET() {
  const hasToken = !!process.env.GITHUB_TOKEN;
  const hasOwner = !!process.env.GITHUB_OWNER;
  const hasRepo = !!process.env.GITHUB_REPO;
  const envReady = hasToken && hasOwner && hasRepo;

  return NextResponse.json({
    message: envReady
      ? "GitHub publish service is ready. Environment variables for GitHub access token are uploaded."
      : "GitHub publish service is ready, but environment variables (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO) are not fully configured.",
    status: envReady ? "operational" : "configuration_incomplete",
    config: {
      hasToken,
      hasOwner,
      hasRepo,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST handler - Publish skill to GitHub repository
 *
 * Accepts a skill object and creates/updates a SKILL.md file in the GitHub repository
 * at the path: skills/${slug}/SKILL.md
 *
 * @param request - NextRequest containing skill data in JSON body
 * @returns JSON response with success status and file path, or error message
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = RequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "[GitHub Publish] Validation error:",
        validationResult.error.format(),
      );
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { skill } = validationResult.data;

    // Validate required environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;

    if (!githubToken || !githubOwner || !githubRepo) {
      console.error("[GitHub Publish] Missing required environment variables");
      return NextResponse.json(
        {
          error:
            "GitHub configuration is incomplete. Please contact administrator.",
        },
        { status: 500 },
      );
    }

    // Extract owner and repo from URL if necessary
    let owner = githubOwner;
    let repo = githubRepo;

    if (githubRepo.includes("/")) {
      try {
        // Handle full URLs like https://github.com/owner/repo or owner/repo
        const cleanRepo = githubRepo.replace(/\/$/, "").replace(/\.git$/, "");
        if (cleanRepo.startsWith("http://") || cleanRepo.startsWith("https://")) {
          const url = new URL(cleanRepo);
          const parts = url.pathname.split("/").filter(Boolean);
          if (parts.length >= 2) {
            owner = parts[0];
            repo = parts[1];
          } else if (parts.length === 1) {
            repo = parts[0];
          }
        } else {
          const parts = cleanRepo.split("/");
          owner = parts[0];
          repo = parts[1];
        }
      } catch (e) {
        console.warn("[GitHub Publish] Error parsing GITHUB_REPO URL:", e);
      }
    }

    // Initialize Octokit client with authentication
    const octokit = new Octokit({
      auth: githubToken,
    });

    // Construct file path and content
    const filePath = `skills/${skill.slug}/SKILL.md`;
    const fileContent = formatSkillContent(skill);

    console.log(
      `[GitHub Publish] Publishing skill "${skill.name}" to ${filePath} (Owner: ${owner}, Repo: ${repo})`,
    );

    // Check if file already exists (to determine if we're creating or updating)
    let sha: string | undefined;
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
      });

      // If file exists, we need the SHA to update it
      if ("sha" in existingFile) {
        sha = existingFile.sha;
        console.log(`[GitHub Publish] File exists, will update (SHA: ${sha})`);
      }
    } catch (error) {
      // 404 means file doesn't exist, which is fine - we'll create it
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status !== 404
      ) {
        throw error;
      }
      console.log("[GitHub Publish] File does not exist, will create new file");
    }

    // Create or update the file
    // GitHub automatically creates intermediate directories (skills/ and skills/${slug}/)
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: sha
        ? `Update skill: ${skill.name}`
        : `Add new skill: ${skill.name}`,
      content: Buffer.from(fileContent, "utf-8").toString("base64"),
      sha, // Include SHA if updating existing file
    });

    console.log(`[GitHub Publish] Successfully published to ${filePath}`);

    // Return success response with file details
    return NextResponse.json({
      success: true,
      path: filePath,
      url: data.content?.html_url,
      commit: {
        sha: data.commit.sha,
        url: data.commit.html_url,
      },
    });
  } catch (error) {
    console.error("[GitHub Publish] Error:", error);

    // Handle specific GitHub API errors
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 401
    ) {
      return NextResponse.json(
        { error: "GitHub authentication failed. Invalid token." },
        { status: 401 },
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return NextResponse.json(
        {
          error: "GitHub repository not found. Check GITHUB_OWNER and GITHUB_REPO settings.",
        },
        { status: 404 },
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 403
    ) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded or permission denied." },
        { status: 403 },
      );
    }

    // Generic error response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to publish skill to GitHub",
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}

/**
 * Format skill data into markdown content for SKILL.md file.
 *
 * Produces a file with YAML frontmatter at the top, which is required by
 * the `npx skills` installer to detect and parse valid skills.
 *
 * @param skill - Validated skill data
 * @returns Formatted markdown string with YAML frontmatter
 */
function formatSkillContent(skill: SkillData): string {
  // Build YAML frontmatter lines
  const frontmatterLines = [
    "---",
    `name: ${skill.slug}`,
    `description: ${skill.description ?? skill.name}`,
    "mode: subagent",
    "temperature: 0.1",
    "tools:",
    "  write: false",
    "  edit: false",
  ];

  if (skill.author) {
    frontmatterLines.push(`author: ${skill.author}`);
  }

  frontmatterLines.push("---");

  // Combine frontmatter with the actual skill instructions
  return [...frontmatterLines, "", skill.content].join("\n");
}
