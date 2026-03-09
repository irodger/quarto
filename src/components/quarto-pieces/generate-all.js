// Генератор всех 16 фигур Quarto
import { writeFileSync } from 'fs';

const pieceConfigs = [
  // 1001: short light round hollow
  { code: '1001', color: '#f5deb3', hole: '#d2b48c', height: 'short', shape: 'round', hollow: true },
  // 1002: short light round solid
  { code: '1002', color: '#f5deb3', height: 'short', shape: 'round', hollow: false },
  // 1003: short light square hollow
  { code: '1003', color: '#f5deb3', hole: '#d2b48c', height: 'short', shape: 'square', hollow: true },
  // 1004: short light square solid
  { code: '1004', color: '#f5deb3', height: 'short', shape: 'square', hollow: false },
  // 1005: short dark round hollow
  { code: '1005', color: '#696969', hole: '#4a4a4a', height: 'short', shape: 'round', hollow: true },
  // 1006: short dark round solid
  { code: '1006', color: '#696969', height: 'short', shape: 'round', hollow: false },
  // 1007: short dark square hollow
  { code: '1007', color: '#696969', hole: '#4a4a4a', height: 'short', shape: 'square', hollow: true },
  // 1008: short dark square solid
  { code: '1008', color: '#696969', height: 'short', shape: 'square', hollow: false },
  // 1009: tall light round hollow
  { code: '1009', color: '#f5deb3', hole: '#d2b48c', height: 'tall', shape: 'round', hollow: true },
  // 1010: tall light round solid
  { code: '1010', color: '#f5deb3', height: 'tall', shape: 'round', hollow: false },
  // 1011: tall light square hollow
  { code: '1011', color: '#f5deb3', hole: '#d2b48c', height: 'tall', shape: 'square', hollow: true },
  // 1012: tall light square solid
  { code: '1012', color: '#f5deb3', height: 'tall', shape: 'square', hollow: false },
  // 1013: tall dark round hollow
  { code: '1013', color: '#696969', hole: '#4a4a4a', height: 'tall', shape: 'round', hollow: true },
  // 1014: tall dark round solid
  { code: '1014', color: '#696969', height: 'tall', shape: 'round', hollow: false },
  // 1015: tall dark square hollow
  { code: '1015', color: '#696969', hole: '#4a4a4a', height: 'tall', shape: 'square', hollow: true },
  // 1016: tall dark square solid
  { code: '1016', color: '#696969', height: 'tall', shape: 'square', hollow: false },
];

function createPalette(pieceColor, hole) {
  if (pieceColor === '#f5deb3') {
    return {
      top: '#f7e0a8',
      left: '#d8b56d',
      right: '#c5944d',
      front: '#e7c780',
      inner: hole ?? '#b88b47',
      stroke: '#5c4325',
      strokeSoft: '#7a5b34',
      highlight: '#fff7d4',
      shadow: '#8d6432',
    };
  }

  return {
    top: '#6d7787',
    left: '#3b4351',
    right: '#262d39',
    front: '#56606f',
    inner: hole ?? '#1b212b',
    stroke: '#131821',
    strokeSoft: '#27303d',
    highlight: '#aeb8c7',
    shadow: '#0f131a',
  };
}

function createRoundSVG(metrics, hollow, palette) {
  const { topY, height, radiusX, radiusY } = metrics;
  const heightOffset = height;
  const bottomY = topY + heightOffset;

  return `
  <path d="M ${50 - radiusX} ${topY}
           C ${50 - radiusX} ${topY + heightOffset * 0.55}, ${50 - radiusX * 0.92} ${bottomY - radiusY}, 50 ${bottomY - radiusY}
           C ${50 + radiusX * 0.92} ${bottomY - radiusY}, ${50 + radiusX} ${topY + heightOffset * 0.55}, ${50 + radiusX} ${topY}
           Z"
        fill="${palette.left}" stroke="${palette.stroke}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M 50 ${topY}
           C ${50 + radiusX * 0.58} ${topY + radiusY * 0.2}, ${50 + radiusX * 0.94} ${topY + radiusY * 0.9}, ${50 + radiusX} ${topY + heightOffset * 0.72}
           C ${50 + radiusX * 0.98} ${bottomY - radiusY * 0.1}, ${50 + radiusX * 0.5} ${bottomY + radiusY * 0.15}, 50 ${bottomY + radiusY * 0.05}
           Z"
        fill="${palette.right}" stroke="${palette.stroke}" stroke-width="2" stroke-linejoin="round"/>
  <ellipse cx="50" cy="${topY}" rx="${radiusX}" ry="${radiusY}" fill="${palette.top}" stroke="${palette.stroke}" stroke-width="2"/>
  <path d="M ${50 - radiusX} ${bottomY} A ${radiusX} ${radiusY} 0 0 0 ${50 + radiusX} ${bottomY}"
        fill="none" stroke="${palette.strokeSoft}" stroke-width="2" stroke-linecap="round"/>${
          hollow
            ? `
  <ellipse cx="50" cy="${topY}" rx="${radiusX * 0.42}" ry="${radiusY * 0.42}" fill="${palette.inner}" stroke="${palette.stroke}" stroke-width="1.5"/>
  <path d="M ${50 - radiusX * 0.22} ${topY + 1}
           L ${50 - radiusX * 0.1} ${topY + heightOffset * 0.22}
           C ${50 + radiusX * 0.02} ${topY + heightOffset * 0.28}, ${50 + radiusX * 0.14} ${topY + heightOffset * 0.28}, ${50 + radiusX * 0.22} ${topY + 2}"
        fill="none" stroke="${palette.shadow}" stroke-width="1.5" stroke-linecap="round"/>`
            : `
  <path d="M ${50 - radiusX * 0.56} ${topY - radiusY * 0.15}
           C ${50 - radiusX * 0.18} ${topY - radiusY * 0.48}, ${50 + radiusX * 0.08} ${topY - radiusY * 0.5}, ${50 + radiusX * 0.34} ${topY - radiusY * 0.12}"
        fill="none" stroke="${palette.highlight}" stroke-width="2.2" stroke-linecap="round" opacity="0.9"/>`
        }`;
}

function createSquareSVG(metrics, hollow, palette) {
  const { topY: topFrontY, height: heightOffset, halfWidth, depthX, depthY } = metrics;
  const leftX = 50 - halfWidth;
  const rightX = 50 + halfWidth;
  const topLeftX = leftX + depthX;
  const topRightX = rightX + depthX;
  const topBackY = topFrontY - depthY;
  const bottomFrontY = topFrontY + heightOffset;
  const bottomBackY = topBackY + heightOffset;

  return `
  <polygon points="${leftX},${topFrontY} ${rightX},${topFrontY} ${topRightX},${topBackY} ${topLeftX},${topBackY}"
           fill="${palette.top}" stroke="${palette.stroke}" stroke-width="2" stroke-linejoin="round"/>
  <polygon points="${leftX},${topFrontY} ${topLeftX},${topBackY} ${topLeftX},${bottomBackY} ${leftX},${bottomFrontY}"
           fill="${palette.left}" stroke="${palette.stroke}" stroke-width="2" stroke-linejoin="round"/>
  <polygon points="${rightX},${topFrontY} ${topRightX},${topBackY} ${topRightX},${bottomBackY} ${rightX},${bottomFrontY}"
           fill="${palette.right}" stroke="${palette.stroke}" stroke-width="2" stroke-linejoin="round"/>
  <polygon points="${leftX},${bottomFrontY} ${rightX},${bottomFrontY} ${topRightX},${bottomBackY} ${topLeftX},${bottomBackY}"
           fill="${palette.front}" stroke="${palette.stroke}" stroke-width="2" stroke-linejoin="round"/>${
             hollow
               ? `
  <polygon points="${50 - halfWidth * 0.34},${topFrontY - depthY * 0.12} ${50 + halfWidth * 0.18},${topFrontY - depthY * 0.12} ${50 + halfWidth * 0.38},${topFrontY - depthY * 0.58} ${50 - halfWidth * 0.14},${topFrontY - depthY * 0.58}"
           fill="${palette.inner}" stroke="${palette.stroke}" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M ${50 - halfWidth * 0.16} ${topFrontY}
           L ${50 - halfWidth * 0.1} ${topFrontY + heightOffset * 0.24}
           L ${50 + halfWidth * 0.15} ${topFrontY + heightOffset * 0.1}
           L ${50 + halfWidth * 0.19} ${topFrontY - depthY * 0.15}"
        fill="none" stroke="${palette.shadow}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
               : `
  <path d="M ${leftX + halfWidth * 0.3} ${topFrontY - depthY * 0.25}
           L ${leftX + halfWidth * 0.92} ${topFrontY - depthY * 0.5}
           L ${leftX + halfWidth * 1.12} ${topFrontY - depthY * 0.92}"
        fill="none" stroke="${palette.highlight}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`
           }`;
}

function createQuartoSVG(config) {
  const { color, hole, height, shape, hollow } = config;
  const palette = createPalette(color, hole);
  const roundMetrics = height === 'tall'
    ? { topY: 16, height: 42, radiusX: 18, radiusY: 7, shadowRx: 24, shadowRy: 7 }
    : { topY: 34, height: 20, radiusX: 11, radiusY: 4.5, shadowRx: 15, shadowRy: 4.5 };
  const squareMetrics = height === 'tall'
    ? { topY: 20, height: 40, halfWidth: 16, depthX: 9, depthY: 8, shadowRx: 24, shadowRy: 7 }
    : { topY: 37, height: 18, halfWidth: 10, depthX: 6, depthY: 5, shadowRx: 15, shadowRy: 4.5 };
  const metrics = shape === 'round' ? roundMetrics : squareMetrics;

  return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="54" cy="88" rx="${metrics.shadowRx}" ry="${metrics.shadowRy}" fill="#00000024"/>
  ${shape === 'round'
    ? createRoundSVG(roundMetrics, hollow, palette)
    : createSquareSVG(squareMetrics, hollow, palette)}
</svg>`;
}

// Создадим все 16 файлов
pieceConfigs.forEach(config => {
  const svg = createQuartoSVG(config);
  writeFileSync(`/Users/rdvoryanov/reps/oc-ai/quarto-game/src/components/quarto-pieces/${config.code}.svg`, svg);
});

console.log('All 16 Quarto pieces created successfully!');
