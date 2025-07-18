import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export let serverContext: Server | undefined = undefined;

export const setServerContext = (server: Server) => {
  serverContext = server;
};

export const createServerInstance = () => {
  if (serverContext) return serverContext;
  const server = new Server(
    {
      name: 'tcfe',
      version: '0.1.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {},
      },
    }
  );
  setServerContext(server);
  return server;
};
