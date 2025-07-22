import { registerResource } from '../common/resources.js';
import { notesResourceInstance } from './notes/index.js';

// Register all resources
export function registerAllResources() {
  registerResource('notes', notesResourceInstance);
}

// Export resource instances
export { notesResourceInstance } from './notes/index.js';
