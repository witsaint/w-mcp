#!/usr/bin/env node
import{StdioServerTransport as h}from"@modelcontextprotocol/sdk/server/stdio.js";import{Server as f}from"@modelcontextprotocol/sdk/server/index.js";import{zodToJsonSchema as u}from"zod-to-json-schema";import{ListPromptsRequestSchema as y,GetPromptRequestSchema as g,ListResourcesRequestSchema as w,ReadResourceRequestSchema as R,ListToolsRequestSchema as S,CallToolRequestSchema as v}from"@modelcontextprotocol/sdk/types.js";import{z as o}from"zod";let m;const T=e=>{m=e},d=()=>{if(m)return m;const e=new f({name:"tcfe",version:"0.1.0"},{capabilities:{resources:{},tools:{},prompts:{}}});return T(e),e},s=new Map;function P(e,t){if(s.has(e))throw new Error(`Prompt ${e} already registered`);s.set(e,t)}async function q(){return{prompts:Array.from(s.keys()).map(e=>{const{description:t,schema:n}=s.get(e);return{name:e,description:t,inputSchema:n}})}}async function x(e){const{name:t}=e.params;if(!s.has(t))throw new Error(`Prompt ${t} not found`);const{handler:n}=s.get(t);return await n(e)}function b(e){e.setRequestHandler(y,q),e.setRequestHandler(g,x)}function $(e){const{description:t,inputSchema:n,handler:r}=e;return{description:t,schema:u(n),handler:r}}const c=new Map;function A(e,t){if(c.has(e))throw new Error(`Resource ${e} already registered`);c.set(e,t)}async function W(){return{resources:Array.from(c.keys()).map(e=>{const{description:t,schema:n}=c.get(e);return{name:e,description:t,inputSchema:n}})}}async function j(e){const{uri:t}=e.params;if(!c.has(t))throw new Error(`Resource ${t} not found`);const{handler:n}=c.get(t);return await n(e)}function k(e){e.setRequestHandler(w,W),e.setRequestHandler(R,j)}function z(e){const{description:t,inputSchema:n,handler:r}=e;return{description:t,schema:u(n),handler:r}}const p=o.object({title:o.string().min(1,"Title is required"),content:o.string().min(1,"Content is required")}),C=async e=>{const{title:t,content:n}=p.parse(e.params.arguments);return{content:[{type:"text",text:`Generated document plan for "${t}":

${n}`}]}},E=`
    A prompt for generating document plans based on the provided title and content.
This prompt has the ability to:
1. Analyze the provided content and generate structured document plans
2. Suggest document sections and organization
3. Provide recommendations for content improvement
4. Generate outlines and summaries

When to use this prompt:
1. When you need to create a structured document plan
2. When you want to organize content into logical sections
3. When you need guidance on document structure and flow
`,H=$({description:E,inputSchema:p,handler:C});function M(){P("doc_plan_prompt",H)}const l=o.object({uri:o.string().min(1,"URI is required")}),I=async e=>{const{uri:t}=l.parse(e.params);return{contents:[{uri:t,mimeType:"text/plain",text:`Content for resource: ${t}`}]}},G=`
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
`,L=z({description:G,inputSchema:l,handler:I});function _(){A("notes",L)}const a=new Map;function U(e,t){if(a.has(e))throw new Error(`Tool ${e} already registered`);a.set(e,t)}async function D(){return{tools:Array.from(a.keys()).map(e=>{const{description:t,schema:n}=a.get(e);return{name:e,description:t,inputSchema:n}})}}async function J(e){const{name:t}=e.params;if(!a.has(t))throw new Error(`Tool ${t} not found`);const{handler:n}=a.get(t);return await n(e)}function N(e){e.setRequestHandler(S,D),e.setRequestHandler(v,J)}function O(e){const{description:t,inputSchema:n,handler:r}=e;return{description:t,schema:u(n),handler:r}}const B="doc_plan",F=o.object({title:o.string().min(1,"Title is required"),content:o.string().min(1,"Content is required")}),K=async e=>{const{title:t,content:n}=F.parse(e.params.arguments),r=await d().createMessage({messages:[{role:"user",content:{type:"text",text:`Please summarize the following text concisely:

${n}`}}],maxTokens:500});return{content:[{type:"text",text:r.content.type==="text"?r.content.text:"Unable to generate summary"}]}},Q=`
    A tool for generating document plans based on the current project plan.
This tool has the ability to plan steps, propose plans, and requirements.
When to use this tool:
1: The user wants to generate a project introduction and usage document based on the current project
2: Generate analysis documents based on project code, able to quickly explain content
3: Analyze the modules, architecture, and relationships of the code
`,V=O({description:Q,inputSchema:o.object({}),handler:K});function X(e){U(B,V),N(e)}const i=d();X(i),M(),b(i),_(),k(i);async function Y(){const e=new h;await i.connect(e)}Y().catch(e=>{console.error("Server error:",e),process.exit(1)});
