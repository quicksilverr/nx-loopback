export interface AppGeneratorSchema {
  name: string;
  description?: string;
  applicationClassName?: string;
  applicationFeatures?: string[];
  features?: string[];
  appClassWithMixins?: string;
  tags?: string;
  directory?: string;
  packageManager?: string;
}
