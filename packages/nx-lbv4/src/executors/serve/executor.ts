import { ExecutorContext } from '@nrwl/devkit';
import { fork } from 'child_process';
import { lastValueFrom, Observable } from 'rxjs';
import { ServeExecutorSchema } from './schema';
import build from '../build/executor';
import { getCwd } from '../../utils/getCwd';

export default async function runExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext
) {
  const projectName = context.projectName;
  const buildResult = await build(
    { clean: true, nodeEnvironment: options.nodeEnvironment },
    context
  );
  if (buildResult.success) {
    console.log(`\n> nx run ${projectName}:serve`);
    await runNode(context, options);
    return { success: true };
  }
}

const runNode = (context: ExecutorContext, options: ServeExecutorSchema) => {
  const observable = new Observable<any>((observer) => {
    const pid = runProcess(context, options);
    if (pid !== undefined) return observer.next({ success: true });

    return observer.next({ success: false });
  });

  return lastValueFrom(observable);
};

const runProcess = (context: ExecutorContext, options: ServeExecutorSchema) => {
  const env = Object(process.env);
  const NODE_ENV = options.nodeEnvironment;

  const command = ['-r', 'source-map-support/register', 'dist/index.js'];

  const child = fork(getCwd(context), {
    cwd: getCwd(context),
    execArgv: command,
    env: {
      ...env,
      NODE_ENV,
    },
  });

  return child.pid;
};
