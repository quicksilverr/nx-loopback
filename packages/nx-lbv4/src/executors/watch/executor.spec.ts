import { ServeWatchExecutorSchema } from './schema';
import executor from './executor';

const options: ServeWatchExecutorSchema = {};

describe('ServeWatch Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});