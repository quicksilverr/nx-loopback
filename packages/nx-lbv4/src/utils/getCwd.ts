import { ExecutorContext } from '@nrwl/devkit';

export function getCwd(context: ExecutorContext) {
  return context.workspace.projects[context.projectName].root;
}
