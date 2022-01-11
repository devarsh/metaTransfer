import { getIn, setIn } from '../others';
import { checkForPrecondition } from './preconditionCheck';
import { toPath } from 'lodash';

export const metaDataDiffGenerator = (newMeta, viewMeta, editMeta) => {
  if (checkForPrecondition(newMeta.fields, viewMeta.fields, editMeta.fields)) {
    let newMetaKeys = JSONWalker(newMeta.fields, '');
    let viewMetaKeys = JSONWalker(viewMeta.fields, '');
    let editMetaKeys = JSONWalker(editMeta.fields, '');

    let allKeys = new Map();
    addKeysToMap(allKeys, newMetaKeys);
    addKeysToMap(allKeys, viewMetaKeys);
    addKeysToMap(allKeys, editMetaKeys);
    let allMetaKeys = Array.from(allKeys.keys());
    let result = generateDiffMetaData(allMetaKeys, newMeta, viewMeta, editMeta);
    let newResult = { form: newMeta.form, fields: result };
    return newResult;
  } else {
    console.log('cannot merge - precondition failed');
  }
};

const JSONWalker = (currentObj: any, currentPath: string = '') => {
  let accum: any[] = [];
  if (typeof currentObj === 'object' && currentObj !== null) {
    for (const [key, val] of Object.entries(currentObj)) {
      const path = Boolean(currentPath) ? `${currentPath}.${key}` : `${key}`;
      let result = JSONWalker(val, path);
      accum = [...accum, ...result];
    }
    return accum;
  } else if (Array.isArray(currentObj)) {
    currentObj.forEach((value, index) => {
      const path = Boolean(currentPath) ? `${currentPath}.${index}` : `${index}`;
      let result = JSONWalker(value, path);
      accum = [...accum, ...result];
    });
    return accum;
  } else {
    accum.push(currentPath);
    return accum;
  }
};

const addKeysToMap = (map: Map<any, any>, obj: any[]) => {
  for (const one of obj) {
    if (!map.has(one)) {
      map.set(one, true);
    }
  }
};

const generateDiffMetaData = (allMetaKeys, newObj, viewObj, editObj) => {
  let finalObj = [];
  for (const one of allMetaKeys) {
    let valN = getIn(newObj.fields, one, '__NOT_EXIST__');
    let valV = getIn(viewObj.fields, one, '__NOT_EXIST__');
    let valE = getIn(editObj.fields, one, '__NOT_EXIST__');
    if (valN === valV && valV === valE && valN !== '__NOT_EXIST__') {
      finalObj = setIn(finalObj, one, valN);
    } else {
      let viewPath = getLastPath(allMetaKeys, one, '__VIEW__');
      let editPath = getLastPath(allMetaKeys, one, '__EDIT__');
      let newPath = getLastPath(allMetaKeys, one, '__NEW__');
      if (viewPath !== '' && valV !== '__NOT_EXIST__') {
        finalObj = setIn(finalObj, viewPath, valV);
      }
      if (editPath !== '' && valE !== '__NOT_EXIST__') {
        finalObj = setIn(finalObj, editPath, valE);
      }
      if (newPath !== '' && valN !== '__NOT_EXIST__') {
        finalObj = setIn(finalObj, newPath, valN);
      }
      //@add componentType with newObj value (since it is required field for our logic)
      let splitter = one.split('.');
      if (splitter[splitter.length - 1] === 'componentType') {
        finalObj = setIn(finalObj, one, valN);
      }
    }
  }
  return finalObj;
};

const getLastPath = (keys, path, viewArg) => {
  let splitPath = toPath(path);
  for (let i = splitPath.length - 1; i >= 0; --i) {
    if (!isNaN(Number(splitPath[i]))) {
      let preSplit = splitPath.slice(0, i + 1);
      let postSplit = splitPath.slice(i + 1);
      let interestedKey = `${preSplit.join('.')}.render.componentType`;
      if (keys.indexOf(interestedKey) >= 0) {
        let newKey = `${preSplit.join('.')}.${viewArg}.${postSplit.join('.')}`;
        return newKey;
      }
    }
  }
  return '';
};
