export function chartCanvasWidth(pointCount, minWidth = 640, pointWidth = 56) {
  return Math.max(minWidth, Math.max(1, pointCount) * pointWidth);
}

export function createChartScrollPane(width, className = "chart-scroll-pane") {
  const pane = document.createElement("div");
  pane.className = className;
  pane.style.setProperty("--chart-canvas-width", `${width}px`);
  return pane;
}

export function createSvgNode(name, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  return node;
}

export function createChartTooltip(container) {
  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  tooltip.hidden = true;
  tooltip.setAttribute("role", "tooltip");
  container.append(tooltip);
  return tooltip;
}

function renderTooltipContent(tooltip, title, rows = []) {
  const titleElement = document.createElement("strong");
  titleElement.textContent = title;
  const rowElements = rows.map(([label, value]) => {
    const row = document.createElement("span");
    const labelElement = document.createElement("em");
    const valueElement = document.createElement("b");
    labelElement.textContent = label;
    valueElement.textContent = value;
    row.append(labelElement, valueElement);
    return row;
  });
  tooltip.replaceChildren(titleElement, ...rowElements);
}

function positionChartTooltip(container, tooltip, anchor) {
  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const safeInset = 12;
  const anchorCenter = anchorRect.left + anchorRect.width / 2 - containerRect.left;
  const left = Math.min(
    Math.max(anchorCenter, tooltipRect.width / 2 + safeInset),
    containerRect.width - tooltipRect.width / 2 - safeInset,
  );
  const top = Math.max(anchorRect.top - containerRect.top - 10, tooltipRect.height + safeInset);

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

export function attachChartTooltip({
  container,
  tooltip,
  target,
  activeElement = target,
  title,
  rows,
}) {
  function show() {
    renderTooltipContent(tooltip, title, rows);
    tooltip.hidden = false;
    tooltip.classList.add("is-visible");
    activeElement.classList.add("is-hovered");
    positionChartTooltip(container, tooltip, target);
  }

  function hide() {
    tooltip.classList.remove("is-visible");
    activeElement.classList.remove("is-hovered");
    window.setTimeout(() => {
      if (!tooltip.classList.contains("is-visible")) {
        tooltip.hidden = true;
      }
    }, 120);
  }

  target.addEventListener("mouseenter", show);
  target.addEventListener("mousemove", show);
  target.addEventListener("focus", show);
  target.addEventListener("mouseleave", hide);
  target.addEventListener("blur", hide);
}
