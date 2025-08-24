import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  detectPackageManager,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { AppGeneratorSchema } from './schema';

interface NormalizedSchema extends AppGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: AppGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  let applicationClassName = '';
  if (options.applicationClassName) {
    applicationClassName = names(options.applicationClassName).className;
  } else {
    applicationClassName = `${names(options.name).className}Application`;
  }
  const appClassWithMixins = buildAppClassMixins(options);
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];
  const packageManager = detectPackageManager();

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    applicationClassName,
    packageManager,
    appClassWithMixins,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    ejs: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

const addDependencies = (tree: Tree) => {
  const dependencies = {
    '@loopback/boot': '^5.0.7',
    '@loopback/core': '^4.0.7',
    '@loopback/repository': '^5.1.2',
    '@loopback/rest': '^12.0.7',
    '@loopback/rest-explorer': '^5.0.7',
    '@loopback/service-proxy': '^5.0.7',
    tslib: '^2.0.0',
  };
  const devDependencies = {
    '@loopback/build': '^9.0.7',
    'source-map-support': '^0.5.21',
    '@loopback/testlab': '^5.0.7',
    '@types/node': '^14.18.36',
    '@loopback/eslint-config': '^13.0.7',
    'tsc-watch': '6.0.0',
    eslint: '^8.30.0',
    typescript: '~4.9.4',
  };
  addDependenciesToPackageJson(tree, dependencies, devDependencies);
};

const buildAppClassMixins = (options: AppGeneratorSchema) => {
  const features = options.applicationFeatures;
  if (!features.includes('repositories') && !features.includes('services'))
    return;

  let appClassWithMixins = 'RestApplication';
  if (features.includes('repositories')) {
    appClassWithMixins = `RepositoryMixin(${appClassWithMixins})`;
  }
  if (features.includes('services')) {
    appClassWithMixins = `ServiceMixin(${appClassWithMixins})`;
  }

  return appClassWithMixins;
};

const deleteFiles = (tree: Tree, options: NormalizedSchema) => {
  if (!options.applicationFeatures.includes('docker')) {
    tree.delete(joinPathFragments(options.projectRoot, 'Dockerfile'));
    tree.delete(joinPathFragments(options.projectRoot, '.dockerignore'));
  }
  if (!options.applicationFeatures.includes('repositories')) {
    tree.delete(joinPathFragments('src/migrate.ts.ejs'));
  }
};

export default async function (tree: Tree, options: AppGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'library',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: `nx-loopback:build`,
      },
      serve: {
        executor: `nx-loopback:serve`,
      },
      clean: {
        executor: `nx-loopback:clean`,
      },
      watch: {
        executor: `nx-loopback:watch`,
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  addDependencies(tree);
  addFiles(tree, normalizedOptions);
  deleteFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
