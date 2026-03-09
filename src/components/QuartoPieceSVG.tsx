import React from 'react';

interface QuartoPieceSVGProps {
  color: 'light' | 'dark';
  size: 'small' | 'large';
  shape: 'round' | 'square';
  top: 'hollow' | 'solid';
  className?: string;
  variant?: 'classic' | 'modern';
}

interface Palette {
  top: string;
  front: string;
  side: string;
  inner: string;
  stroke: string;
  highlight: string;
  shadow: string;
}

const FLOOR_Y = 74;
const VIEWBOX_SIZE = 100;
const SHADOW_BOTTOM_GAP = 12;

const lightPalette: Palette = {
  top: '#dfc27a',
  front: '#c59b4e',
  side: '#ab7f39',
  inner: '#8a6028',
  stroke: '#6b4c22',
  highlight: '#fff3c6',
  shadow: '#00000018',
};

const darkPalette: Palette = {
  top: '#818da0',
  front: '#4f5b70',
  side: '#313c4d',
  inner: '#111924',
  stroke: '#121824',
  highlight: '#dfe7f4',
  shadow: '#0000001b',
};

const shadowEllipse = (cx: number, rx: number, ry: number, fill: string) => (
  <ellipse cx={cx} cy={VIEWBOX_SIZE - SHADOW_BOTTOM_GAP - ry} rx={rx} ry={ry} fill={fill} />
);

const modernShadow = (cx: number, rx: number, ry: number, isLarge: boolean) => (
  <>
    {shadowEllipse(cx, rx, ry, isLarge ? '#0000003a' : '#0000002a')}
    {shadowEllipse(cx, rx * 0.72, ry * 0.72, isLarge ? '#00000026' : '#0000001c')}
  </>
);

const roundMetrics = (size: 'small' | 'large') =>
  size === 'large'
    ? { cx: 49, topY: 22, bodyBottomY: 70, rx: 16.5, ry: 6.8, shadowRx: 17, shadowRy: 4.7 }
    : { cx: 49, topY: 36, bodyBottomY: 70, rx: 11.5, ry: 4.8, shadowRx: 11.8, shadowRy: 3.4 };

const squareMetrics = (size: 'small' | 'large') =>
  size === 'large'
    ? { x: 28, topY: 28, w: 27, h: 38, dx: 13, dy: 10, shadowRx: 17, shadowRy: 4.6 }
    : { x: 35, topY: 42, w: 17, h: 22, dx: 9, dy: 7, shadowRx: 11.6, shadowRy: 3.4 };

const RoundPiece = ({
  palette,
  top,
  size,
}: {
  palette: Palette;
  top: 'hollow' | 'solid';
  size: 'small' | 'large';
}) => {
  const m = roundMetrics(size);
  const leftX = m.cx - m.rx;
  const rightX = m.cx + m.rx;
  const bodyBottomY = m.bodyBottomY;

  return (
    <>
      {shadowEllipse(m.cx + 1.5, m.shadowRx, m.shadowRy, palette.shadow)}

      <path
        d={`M ${leftX} ${m.topY}
            L ${leftX} ${bodyBottomY - m.ry}
            Q ${m.cx} ${FLOOR_Y} ${rightX} ${bodyBottomY - m.ry}
            L ${rightX} ${m.topY}
            Q ${m.cx} ${m.topY + m.ry * 1.15} ${leftX} ${m.topY}
            Z`}
        fill={palette.front}
        stroke={palette.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d={`M ${m.cx} ${m.topY + 0.2}
            Q ${rightX} ${m.topY + m.ry * 0.35} ${rightX} ${m.topY + m.ry}
            L ${rightX} ${bodyBottomY - m.ry}
            Q ${m.cx + m.rx * 0.7} ${FLOOR_Y - 1.2} ${m.cx} ${bodyBottomY - m.ry * 0.4}
            Z`}
        fill={palette.side}
        stroke={palette.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <ellipse
        cx={m.cx}
        cy={m.topY}
        rx={m.rx}
        ry={m.ry}
        fill={palette.top}
        stroke={palette.stroke}
        strokeWidth="2"
      />

      {top === 'hollow' ? (
        <>
          <ellipse
            cx={m.cx}
            cy={m.topY}
            rx={m.rx * 0.56}
            ry={m.ry * 0.56}
            fill={palette.inner}
            stroke={palette.stroke}
            strokeWidth="1.6"
          />
          <ellipse
            cx={m.cx}
            cy={m.topY}
            rx={m.rx * 0.3}
            ry={m.ry * 0.3}
            fill="#00000018"
          />
        </>
      ) : (
        <path
          d={`M ${m.cx - m.rx * 0.68} ${m.topY + 0.1}
              Q ${m.cx - m.rx * 0.16} ${m.topY - m.ry * 0.86} ${m.cx + m.rx * 0.38} ${m.topY - m.ry * 0.04}`}
          fill="none"
          stroke={palette.highlight}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.92"
        />
      )}

      <path
        d={`M ${leftX + 1.7} ${m.topY + m.ry * 1.25} L ${leftX + 1.7} ${bodyBottomY - m.ry * 1.7}`}
        stroke={palette.highlight}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.24"
      />
    </>
  );
};

const SquarePiece = ({
  palette,
  top,
  size,
}: {
  palette: Palette;
  top: 'hollow' | 'solid';
  size: 'small' | 'large';
}) => {
  const m = squareMetrics(size);
  const y2 = m.topY + m.h;
  const x2 = m.x + m.w;
  const topLeftX = m.x + m.dx;
  const topLeftY = m.topY - m.dy;
  const topRightX = x2 + m.dx;
  const topRightY = m.topY - m.dy;

  return (
    <>
      {shadowEllipse(m.x + m.w * 0.68, m.shadowRx, m.shadowRy, palette.shadow)}

      <polygon
        points={`${m.x},${m.topY} ${x2},${m.topY} ${x2},${y2} ${m.x},${y2}`}
        fill={palette.front}
        stroke={palette.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <polygon
        points={`${x2},${m.topY} ${topRightX},${topRightY} ${topRightX},${y2 - m.dy} ${x2},${y2}`}
        fill={palette.side}
        stroke={palette.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <polygon
        points={`${m.x},${m.topY} ${x2},${m.topY} ${topRightX},${topRightY} ${topLeftX},${topLeftY}`}
        fill={palette.top}
        stroke={palette.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {top === 'hollow' ? (
        <>
          <rect
            x={m.x + m.w * 0.18}
            y={m.topY + m.h * 0.18}
            width={m.w * 0.5}
            height={m.h * 0.48}
            fill="#ebe2d3"
            stroke={palette.stroke}
            strokeWidth="1.6"
          />
          <path
            d={`M ${m.x + m.w * 0.18} ${m.topY + m.h * 0.18}
                L ${m.x + m.w * 0.18 + m.dx * 0.56} ${m.topY + m.h * 0.18 - m.dy * 0.45}
                L ${m.x + m.w * 0.68 + m.dx * 0.56} ${m.topY + m.h * 0.18 - m.dy * 0.45}
                L ${m.x + m.w * 0.68} ${m.topY + m.h * 0.18}`}
            fill="#f8f1e2"
            stroke={palette.stroke}
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <path
          d={`M ${m.x + m.w * 0.14} ${m.topY + 1.4}
              L ${m.x + m.w * 0.38} ${m.topY - m.dy * 0.4}
              L ${m.x + m.w * 0.7} ${m.topY - m.dy * 0.06}`}
          fill="none"
          stroke={palette.highlight}
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.92"
        />
      )}

      <path
        d={`M ${m.x + 1.6} ${m.topY + 2.2} L ${m.x + 1.6} ${y2 - 2.2}`}
        stroke={palette.highlight}
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.23"
      />
    </>
  );
};

const ModernRoundPiece = ({
  palette,
  top,
  size,
}: {
  palette: Palette;
  top: 'hollow' | 'solid';
  size: 'small' | 'large';
}) => {
  const isLarge = size === 'large';
  const cx = 50;
  const baseBottomY = 68;
  const radius = isLarge ? 20 : 11;
  const cy = baseBottomY - radius;
  const ringRadius = isLarge ? 8.2 : 4.6;
  const innerRadius = isLarge ? 14.5 : 8.1;

  return (
    <>
      {modernShadow(cx, isLarge ? 17.5 : 9.6, isLarge ? 5.1 : 2.9, isLarge)}
      <circle cx={cx} cy={cy} r={radius} fill={palette.front} stroke={palette.stroke} strokeWidth="2.4" />
      <circle cx={cx} cy={cy} r={innerRadius} fill={palette.top} opacity="0.94" />
      {top === 'hollow' ? (
        <>
          <circle cx={cx} cy={cy} r={ringRadius} fill={palette.inner} stroke={palette.stroke} strokeWidth="1.8" />
          <circle cx={cx} cy={cy} r={ringRadius * 0.46} fill="#00000022" />
        </>
      ) : null}
      <path
        d={`M ${cx - radius * 0.48} ${cy - radius * 0.36}
            L ${cx - radius * 0.14} ${cy - radius * 0.58}
            L ${cx + radius * 0.18} ${cy - radius * 0.2}`}
        fill="none"
        stroke={palette.highlight}
        strokeWidth={isLarge ? 1.7 : 1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.34"
      />
    </>
  );
};

const ModernSquarePiece = ({
  palette,
  top,
  size,
}: {
  palette: Palette;
  top: 'hollow' | 'solid';
  size: 'small' | 'large';
}) => {
  const isLarge = size === 'large';
  const side = isLarge ? 40 : 21;
  const x = 50 - side / 2;
  const y = 68 - side;
  const innerPad = isLarge ? 11 : 6;
  const radius = isLarge ? 10 : 5;

  return (
    <>
      {modernShadow(50, isLarge ? 16.8 : 9.4, isLarge ? 4.9 : 2.9, isLarge)}
      <rect x={x} y={y} width={side} height={side} rx={radius} fill={palette.front} stroke={palette.stroke} strokeWidth="2.4" />
      <rect
        x={x + 3}
        y={y + 3}
        width={side - 6}
        height={side - 6}
        rx={Math.max(3, radius - 2)}
        fill={palette.top}
        opacity="0.9"
      />
      {top === 'hollow' ? (
        <>
          <rect
            x={x + innerPad}
            y={y + innerPad}
            width={side - innerPad * 2}
            height={side - innerPad * 2}
            rx={isLarge ? 6 : 3}
            fill={palette.inner}
            stroke={palette.stroke}
            strokeWidth="1.6"
          />
          <rect
            x={x + innerPad + (isLarge ? 5 : 3)}
            y={y + innerPad + (isLarge ? 5 : 3)}
            width={side - (innerPad + (isLarge ? 5 : 3)) * 2}
            height={side - (innerPad + (isLarge ? 5 : 3)) * 2}
            rx={isLarge ? 3 : 2}
            fill="#00000018"
          />
        </>
      ) : null}
      <path
        d={`M ${x + side * 0.18} ${y + side * 0.2}
            L ${x + side * 0.42} ${y + side * 0.08}
            L ${x + side * 0.62} ${y + side * 0.26}`}
        fill="none"
        stroke={palette.highlight}
        strokeWidth={isLarge ? 1.7 : 1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.34"
      />
    </>
  );
};

export const QuartoPieceSVG: React.FC<QuartoPieceSVGProps> = ({
  color,
  size,
  shape,
  top,
  className = '',
  variant = 'classic',
}) => {
  const palette = color === 'light' ? lightPalette : darkPalette;

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" className={className} aria-hidden="true">
      {variant === 'modern'
        ? shape === 'round'
          ? <ModernRoundPiece palette={palette} top={top} size={size} />
          : <ModernSquarePiece palette={palette} top={top} size={size} />
        : shape === 'round'
          ? <RoundPiece palette={palette} top={top} size={size} />
          : <SquarePiece palette={palette} top={top} size={size} />
      }
    </svg>
  );
};
