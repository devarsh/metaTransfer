export const checkForPrecondition = (newFields, viewFields, editFields) => {
  if (
    !(
      Array.isArray(newFields) ||
      Array.isArray(viewFields) ||
      Array.isArray(editFields)
    )
  ) {
    console.log("not array Field");
    return false;
  }
  if (
    newFields.length === viewFields.length &&
    viewFields.length === editFields.length
  ) {
    let trueCount = 0;
    for (let i = 0; i < newFields.length; i++) {
      if (
        newFields[i].name === viewFields[i].name &&
        viewFields[i].name === editFields[i].name
      ) {
        if (
          newFields[i]?.render?.componentType === "arrayField" &&
          viewFields[i]?.render?.componentType === "arrayField" &&
          editFields[i]?.render?.componentType === "arrayField"
        ) {
          let result = checkForPrecondition(
            newFields[i]._fields,
            viewFields[i]._fields,
            editFields[i]._fields
          );
          if (result === false) {
            return false;
          }
        }
        trueCount++;
      } else {
        console.log({
          newName: newFields[i].name,
          viewName: viewFields[i].name,
          editName: editFields[i].name,
        });
      }
    }
    if (trueCount === newFields.length) {
      return true;
    } else {
      return false;
    }
  } else {
    console.log("fields length mismatch-", {
      newFields: newFields.length,
      viewFields: viewFields.length,
      editFields: editFields.length,
    });
    let maxLength = newFields.length;
    if (maxLength < viewFields.length) {
      maxLength = viewFields.length;
    }
    if (maxLength < editFields.length) {
      maxLength = editFields.length;
    }
    for (let i = 0; i < maxLength; i++) {
      if (
        newFields?.[i]?.name !== viewFields?.[i]?.name ||
        viewFields?.[i]?.name !== editFields[i]?.name
      ) {
        console.log({
          newName: newFields?.[i]?.name,
          editName: editFields[i]?.name,
          viewName: viewFields?.[i]?.name,
        });
      }
    }
    return false;
  }
};
