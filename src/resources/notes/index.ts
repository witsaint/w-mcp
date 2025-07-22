import { z } from 'zod';
import { createServerInstance } from '../../common/context.js';
import { packResource } from '../../common/resources.js';
import type { TResourceRequest } from '../../common/type.js';

// Notes resource

export const NOTES_RESOURCE = 'notes';

const notesResourceSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
});

export const notesResource = async (request: TResourceRequest) => {
  const { uri } = notesResourceSchema.parse(request.params);

  // 这里可以添加 resource 的具体逻辑
  // 例如：读取文件、获取数据库内容等

  return {
    contents: [
      {
        uri: uri,
        mimeType: 'text/plain',
        text: `Content for resource: ${uri}`,
      },
    ],
  };
};

const notesResourceDesc = `
    A resource for reading notes and documents.
This resource has the ability to:
1. Read note files from the filesystem
2. Retrieve document content from various sources
3. Provide formatted text content
4. Support different MIME types

When to use this resource:
1. When you need to read note files
2. When you want to access document content
3. When you need to retrieve formatted text
4. When you want to access file-based resources
`;

export const notesResourceInstance = packResource({
  description: notesResourceDesc,
  inputSchema: notesResourceSchema,
  handler: notesResource,
});
