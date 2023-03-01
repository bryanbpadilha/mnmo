// Input masking inspired by https://github.com/alpinejs/alpine/blob/main/packages/mask/src/index.js
const backspaceMask = (value: string) => {
  const isLastCharValid =
    value.length == 0 || /[0-9a-zA-Z]/.test(value[value.length - 1]);

  if (!isLastCharValid) {
    return backspaceMask(value.slice(0, value.length - 1));
  } else {
    return value;
  }
};

const stripDown = (value: string, mask: string) => {
  let inputToBeStripped = value;
  let output = "";
  let regexes = {
    "9": /[0-9]/,
    a: /[a-zA-Z]/,
    "*": /[a-zA-Z0-9]/,
  };

  let wildcardTemplate = "";

  // Strip away non wildcard template characters.
  for (let i = 0; i < mask.length; i++) {
    if (["9", "a", "*"].includes(mask[i])) {
      wildcardTemplate += mask[i];
      continue;
    }

    for (let j = 0; j < inputToBeStripped.length; j++) {
      if (inputToBeStripped[j] === mask[i]) {
        inputToBeStripped =
          inputToBeStripped.slice(0, j) + inputToBeStripped.slice(j + 1);

        break;
      }
    }
  }

  for (let i = 0; i < wildcardTemplate.length; i++) {
    let found = false;

    for (let j = 0; j < inputToBeStripped.length; j++) {
      if (regexes[wildcardTemplate[i]].test(inputToBeStripped[j])) {
        output += inputToBeStripped[j];
        inputToBeStripped =
          inputToBeStripped.slice(0, j) + inputToBeStripped.slice(j + 1);

        found = true;
        break;
      }
    }

    if (!found) break;
  }

  return output;
};

const buildUp = (value: string, mask: string) => {
  const strippedValue = stripDown(value, mask);
  let clean = Array.from(strippedValue);
  let output = "";

  for (let i = 0; i < mask.length; i++) {
    if (!["9", "a", "*"].includes(mask[i])) {
      output += mask[i];
      continue;
    }

    if (clean.length === 0) break;

    output += clean.shift();
  }

  return output;
};

export const restoreCursorPosition = (
  value: string,
  mask: string,
  event: InputEvent,
  callback: Function
) => {
  const target = event.target as HTMLInputElement;
  let cursorPosition = target.selectionStart;
  let unformattedValue = target.value;

  callback();

  let beforeLeftOfCursorBeforeFormatting = unformattedValue.slice(
    0,
    cursorPosition ?? undefined
  );

  let newPosition = buildUp(
    stripDown(beforeLeftOfCursorBeforeFormatting, mask),
    mask
  ).length;

  target.setSelectionRange(newPosition, newPosition);
};

export const maskValue = (value: string, mask: string, event?: InputEvent) => {
  let output = buildUp(value, mask);

  if (event?.inputType.includes("delete")) {
    output = backspaceMask(value);
  }

  return output;
};
