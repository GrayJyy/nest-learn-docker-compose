import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

export default () => {
  const ENV_FILE = 'env.yaml';
  const data = readFileSync(join(process.cwd(), ENV_FILE), 'utf8');
  return yaml.load(data) as Record<string, any>;
};
