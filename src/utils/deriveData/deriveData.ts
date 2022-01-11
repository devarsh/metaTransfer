import { merge } from "lodash-es";

export const extractMetaData = (metaData, mode) => {
  let newFields = deriveData(metaData.fields, mode);
  let newForm = deriveFormData(metaData.form, mode);
  return { form: newForm, fields: newFields };
};

export const deriveFormData = (form, mode) => {
  const { __VIEW__, __EDIT__, __NEW__, ...others } = form;
  let newFormObj = others;
  if (mode === "new") {
    newFormObj = merge({}, others, __NEW__);
  } else if (mode === "edit") {
    newFormObj = merge({}, others, __EDIT__);
  } else if (mode === "view") {
    newFormObj = merge({}, others, __VIEW__);
  }
  return newFormObj;
};

export const deriveData = (fields, mode) => {
  if (!Array.isArray(fields)) {
    return fields;
  }
  return fields.map((one) => {
    const { __VIEW__, __EDIT__, __NEW__, ...fieldObj } = one;
    try {
      if (fieldObj.render.componentType === "arrayField") {
        let newField = deriveData(fieldObj._fields, mode);
        fieldObj._fields = newField;
      } else if (fieldObj.render.componentType === "dataTable") {
        let newField = deriveData(fieldObj._column, mode);
        fieldObj._column = newField;
      }
    } catch (e) {
      console.log(one);
    }
    let newFieldObj = fieldObj;
    if (mode === "new") {
      newFieldObj = merge({}, fieldObj, __NEW__);
    } else if (mode === "edit") {
      newFieldObj = merge({}, fieldObj, __EDIT__);
    } else if (mode === "view") {
      newFieldObj = merge({}, fieldObj, __VIEW__);
    }
    return newFieldObj;
  });
};
