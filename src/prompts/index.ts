import { registerPrompt } from '../common/prompt.js';
import { docPlanPromptInstance } from './doc/plan.js';

// Register all prompts
export function registerAllPrompts() {
  registerPrompt('doc_plan_prompt', docPlanPromptInstance);
}

// Export prompt instances
export { docPlanPromptInstance } from './doc/plan.js';
