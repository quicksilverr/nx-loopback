import { ExecutorContext } from '@nrwl/devkit';
import { ServeWatchExecutorSchema } from './schema';
import { TscWatchClient } from 'tsc-watch/client';
import { getCwd } from '../../utils/getCwd';
const readline = require('readline');

enum W {
  STARTED = 'started',
  FIRST_SUCCESS = 'first_success',
  SUCCESS = 'success',
  ERR = 'compile_errors',
}

export default async function runExecutor(
  options: ServeWatchExecutorSchema,
  context: ExecutorContext
) {
  const watch = new TscWatchClient();

  await runWatchNode(watch, context);
  return {
    success: true,
  };
}

const runWatchNode = (stream: TscWatchClient, context: ExecutorContext) => {
  const projectCwd = getCwd(context);
  return new Promise((resolve, reject) => {
    stream.on(W.STARTED, (args) => {
      console.log('\ncompilation started');
    });

    stream.on(W.FIRST_SUCCESS, () => {
      console.log('\nInteractive mode');
      console.log(
        '\n Press "r" to re-run the onSuccess command, esc to exit.\n'
      );
    });

    stream.on(W.SUCCESS, () => {
      console.log('successful');
    });

    stream.on(W.ERR, (err) => {
      console.log('err', err);
      reject('something went wrong');
    });

    readline.emitKeypressEvents(process.stdin);

    process.stdin.on('keypress', (str, key) => {
      if (key.name == 'escape' || (key && key.ctrl && key.name == 'c')) {
        stream.kill();
        process.stdin.pause();
        resolve('process complete');
        process.exit();
      } else {
        if (str && str.toLowerCase() === 'r') {
          stream.runOnSuccessCommand();
        }
      }
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();

    const tsConfigPath = `${projectCwd}/tsconfig.json`;
    const onSuccess = `node -r source-map-support/register ${projectCwd}/dist/index.js`;
    const lbtscPath = `${context.cwd}/node_modules/.bin/lb-tsc`;

    stream.start(
      '--compiler',
      lbtscPath,
      '--project',
      tsConfigPath,
      '--onSuccess',
      onSuccess,
      '--noClear'
    );
  });
};
