export const applyPickerStyles = () => {
  const styleId = "picker-reset-style";
  if (typeof document !== "undefined" && !document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `select { appearance: none; -webkit-appearance: none; background: transparent; border: none; }`;
    document.head.appendChild(style);
  }
};
