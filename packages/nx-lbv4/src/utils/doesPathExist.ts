import { accessSync, constants } from 'fs';

export const doesPathExist = async (path: string) => {
  try {
    accessSync(path, constants.R_OK);
    return true;
  } catch (e) {
    return false;
  }
};
