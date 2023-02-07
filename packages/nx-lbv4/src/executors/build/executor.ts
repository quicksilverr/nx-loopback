import { BuildExecutorSchema } from './schema';
import { ExecutorContext, Tree } from '@nrwl/devkit';
import { execSync } from 'child_process';
import clean from '../clean/executor';
import { getCwd } from '../../utils/getCwd';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  const projectName = context.projectName;
  if (options.clean) {
    console.log(`\n> nx run ${projectName}:clean`);
    const result = await clean({}, context);
    if (result.success) {
      console.log(`\n> nx run ${projectName}:build`);
      buildLoopbackApp(options, context);
      return { success: true };
    }
  } else {
    console.log(`\n> nx run ${projectName}:build`);
    buildLoopbackApp(options, context);
    return { success: true };
  }
}

const buildLoopbackApp = (
  options: BuildExecutorSchema,
  context: ExecutorContext
) => {
  const command = 'lb-tsc';
  const env = Object(process.env);
  const NODE_ENV = options.nodeEnvironment;
  execSync(command, {
    stdio: 'inherit',
    cwd: getCwd(context),
    env: {
      ...env,
      NODE_ENV,
    },
  });
};
