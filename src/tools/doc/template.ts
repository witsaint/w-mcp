import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { packTool } from '../../common/tools.js';
import type { TToolRequest } from '../../common/type.js';

// 改进的模板目录路径解析
function getTemplateDir(): string {
  return path.join(new URL(import.meta.url).pathname, '../templates');
}

const TEMPLATE_DIR = getTemplateDir();

export const CREATE_DOCS_TEMPLATE = 'create_docs_template';

const createDocsTemplateSchema = z.object({
  targetPath: z.string().min(1, 'Target path is required'),
  projectName: z.string().optional(),
  githubUrl: z.string().optional(),
});

export const createDocsTemplate = async (request: TToolRequest) => {
  const {
    targetPath,
    projectName = 'My Documentation',
    githubUrl,
  } = createDocsTemplateSchema.parse(request.params.arguments);

  try {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    // Copy template files recursively
    await copyTemplateFiles(TEMPLATE_DIR, targetPath);

    // // Customize the template files
    await customizeTemplate(targetPath, projectName, githubUrl);
    return {
      content: [
        {
          type: 'text',
          text: TEMPLATE_DIR,
        },
      ],
    };
    // return {
    //   content: [
    //     {
    //       type: 'text',
    //       text: `Successfully created Nextra documentation template at: ${targetPath}
    //         install the dependencies: yarn
    //         then do the next task planning
    //       `,
    //     },
    //   ],
    // };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error creating documentation template: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};

export const createDocsTemplateTool = packTool({
  description:
    'After doc_gen_begin，An Step for gen doc。Create a Nextra documentation site template at the specified location, targetPath is the .doc folder, eg: /your/project/.doc',
  inputSchema: z.object({
    targetPath: z.string().min(1, 'Target path is required'),
    projectName: z.string().optional(),
    githubUrl: z.string().optional(),
  }),
  handler: createDocsTemplate,
});

async function copyTemplateFiles(sourceDir: string, targetDir: string) {
  const items = fs.readdirSync(sourceDir);

  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      await copyTemplateFiles(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

async function customizeTemplate(
  targetPath: string,
  projectName: string,
  githubUrl?: string
) {
  // Update theme.config.tsx
  const themeConfigPath = path.join(targetPath, 'theme.config.tsx');
  if (fs.existsSync(themeConfigPath)) {
    let themeConfig = fs.readFileSync(themeConfigPath, 'utf-8');

    // Replace project name
    themeConfig = themeConfig.replace('My Documentation', projectName);

    // Replace GitHub URL if provided
    if (githubUrl) {
      themeConfig = themeConfig.replace(
        'https://github.com/your-username/your-repo',
        githubUrl
      );
      themeConfig = themeConfig.replace(
        'https://github.com/your-username/your-repo/tree/main',
        `${githubUrl}/tree/main`
      );
    }

    fs.writeFileSync(themeConfigPath, themeConfig);
  }

  // Update package.json name
  const packageJsonPath = path.join(targetPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.name = projectName.toLowerCase().replace(/\s+/g, '-');
    packageJson.description = `${projectName} documentation`;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}
