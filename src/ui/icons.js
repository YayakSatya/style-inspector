import {
  createElement,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Maximize2,
  Minimize2,
  Palette,
  Pin,
  RotateCcw,
  Strikethrough,
  Underline,
  X,
  Zap,
} from 'lucide';

const iconNodes = {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Maximize2,
  Minimize2,
  Palette,
  Pin,
  RotateCcw,
  Strikethrough,
  Underline,
  X,
  Zap,
};

export function siIcon(name, size = 14) {
  const svg = createElement(iconNodes[name], {
    class: 'si-icon',
    width: size,
    height: size,
    'stroke-width': 2,
    'aria-hidden': 'true',
    focusable: 'false',
  });
  return svg.outerHTML;
}
