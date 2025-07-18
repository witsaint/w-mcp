#!/usr/bin/env node
import{StdioServerTransport as l}from"@modelcontextprotocol/sdk/server/stdio.js";import{Server as d}from"@modelcontextprotocol/sdk/server/index.js";import{zodToJsonSchema as p}from"zod-to-json-schema";import{ListPromptsRequestSchema as h,GetPromptRequestSchema as f,ListToolsRequestSchema as g,CallToolRequestSchema as y}from"@modelcontextprotocol/sdk/types.js";import{z as o}from"zod";let c;const w=e=>{c=e},m=()=>{if(c)return c;const e=new d({name:"tcfe",version:"0.1.0"},{capabilities:{resources:{},tools:{},prompts:{}}});return w(e),e},s=new Map;function S(e,t){if(s.has(e))throw new Error(`Prompt ${e} already registered`);s.set(e,t)}async function P(){return{prompts:Array.from(s.keys()).map(e=>{const{description:t,schema:n}=s.get(e);return{name:e,description:t,inputSchema:n}})}}async function T(e){const{name:t}=e.params;if(!s.has(t))throw new Error(`Prompt ${t} not found`);const{handler:n}=s.get(t);return await n(e)}function v(e){e.setRequestHandler(h,P),e.setRequestHandler(f,T)}function q(e){const{description:t,inputSchema:n,handler:r}=e;return{description:t,schema:p(n),handler:r}}const u=o.object({title:o.string().min(1,"Title is required"),content:o.string().min(1,"Content is required")}),x=async e=>{const{title:t,content:n}=u.parse(e.params.arguments);return{content:[{type:"text",text:`Generated document plan for "${t}":

${n}`}]}},b=`
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
`,$=q({description:b,inputSchema:u,handler:x});function A(){S("doc_plan_prompt",$)}const a=new Map;function R(e,t){if(a.has(e))throw new Error(`Tool ${e} already registered`);a.set(e,t)}async function j(){return{tools:Array.from(a.keys()).map(e=>{const{description:t,schema:n}=a.get(e);return{name:e,description:t,inputSchema:n}})}}async function z(e){const{name:t}=e.params;if(!a.has(t))throw new Error(`Tool ${t} not found`);const{handler:n}=a.get(t);return await n(e)}function k(e){e.setRequestHandler(g,j),e.setRequestHandler(y,z)}function C(e){const{description:t,inputSchema:n,handler:r}=e;return{description:t,schema:p(n),handler:r}}const W="doc_plan",E=o.object({title:o.string().min(1,"Title is required"),content:o.string().min(1,"Content is required")}),G=async e=>{const{title:t,content:n}=E.parse(e.params.arguments),r=await m().createMessage({messages:[{role:"user",content:{type:"text",text:`Please summarize the following text concisely:

${n}`}}],maxTokens:500});return{content:[{type:"text",text:r.content.type==="text"?r.content.text:"Unable to generate summary"}]}},H=`
    A tool for generating document plans based on the current project plan.
This tool has the ability to plan steps, propose plans, and requirements.
When to use this tool:
1: The user wants to generate a project introduction and usage document based on the current project
2: Generate analysis documents based on project code, able to quickly explain content
3: Analyze the modules, architecture, and relationships of the code
`,_=C({description:H,inputSchema:o.object({}),handler:G});function L(e){R(W,_),k(e)}const i=m();L(i),A(),v(i);async function M(){const e=new l;await i.connect(e)}M().catch(e=>{console.error("Server error:",e),process.exit(1)});
