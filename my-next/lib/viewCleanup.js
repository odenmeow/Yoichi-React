export const normalizeAppInteraction = () => {
  const oldLocks = Array.from(document.querySelectorAll("body *")).filter((el) => {
    const text = (el.textContent || "").trim();
    return text.includes("請輸入密碼觀看歷史紀錄") || text === "解鎖";
  });

  oldLocks.forEach((node) => {
    const wrap = node.closest("form, section, div");
    if (wrap) wrap.remove();
  });

  document.body.classList.remove("modal-open");
  document.documentElement.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("pointer-events");
  document.body.style.removeProperty("filter");

  const appRoot = document.getElementById("__next");
  if (appRoot) {
    appRoot.style.filter = "none";
    appRoot.style.pointerEvents = "auto";
    appRoot.style.opacity = "1";
  }

  document.querySelectorAll("main, header, nav, section, .presentation-Area, .presentation-Area.date-block").forEach((el) => {
    el.style.filter = "none";
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  });

  document.querySelectorAll("body *").forEach((el) => {
    const style = window.getComputedStyle(el);
    const fixedLike = style.position === "fixed" || style.position === "absolute";
    const huge = el.offsetWidth >= window.innerWidth * 0.9 && el.offsetHeight >= window.innerHeight * 0.9;
    const blocker = fixedLike && huge && el.id !== "__next";
    if (blocker) {
      el.style.pointerEvents = "none";
      el.style.background = "transparent";
      el.style.backdropFilter = "none";
      el.style.filter = "none";
    }
  });
};
