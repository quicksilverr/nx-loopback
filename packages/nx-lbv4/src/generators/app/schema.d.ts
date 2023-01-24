export interface AppGeneratorSchema {
  name: string;
  description?: string;
  applicationClassName?: string;
  applicationFeatures?: {
    value: string;
    label: string;
  }[];
  features?: string[];
  appClassWithMixins?: string;
  tags?: string;
  directory?: string;
  packageManager?: string;
}
