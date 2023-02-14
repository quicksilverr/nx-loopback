import { BuildExecutorSchema } from './schema';
import { ExecutorContext, createPackageJson } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { writeJsonFile } from '@nrwl/devkit';
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
    console.log(`\n> nx run ${projectName}:build ${getCwd(context)}`);
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
  if (options.generatePackageJson) {
    const packageJson = createPackageJson(
      context.projectName,
      context.projectGraph,
      {
        root: context.root,
      }
    );
    writeJsonFile(`${getCwd(context)}/dist/package.json`, packageJson, {
      appendNewLine: true,
      spaces: 2,
    });
  }
};
