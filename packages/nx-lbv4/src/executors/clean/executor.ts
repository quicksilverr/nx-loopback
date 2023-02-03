import { ExecutorContext } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { getCwd } from '../../utils/getCwd';
import { CleanExecutorSchema } from './schema';

export default async function runExecutor(
  options: CleanExecutorSchema,
  context: ExecutorContext
) {
  cleanLoopbackApp(options, context);
  return {
    success: true,
  };
}

const cleanLoopbackApp = (
  options: CleanExecutorSchema,
  context: ExecutorContext
) => {
  const command = 'lb-clean dist *.tsbuildinfo';
  execSync(command, {
    stdio: 'inherit',
    cwd: getCwd(context),
  });
};
