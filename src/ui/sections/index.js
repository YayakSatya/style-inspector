/**
 * Panel sections, in the order they are rendered.
 *
 * Content leads because a copy change is usually what prompted the inspection.
 * After that the order follows the question an inspection actually asks, from
 * the outside in: how big is it, how much room around it, how does it arrange
 * what's inside — then how it looks. The align rail is not in this list; it is
 * rendered above the sections by the panel itself.
 */

import * as content from './content.js';
import * as spacing from './spacing.js';
import * as typography from './typography.js';
import * as color from './color.js';
import * as border from './border.js';
import * as effects from './effects.js';
import * as size from './size.js';
import * as layout from './layout.js';

export const SECTIONS = [content, size, spacing, layout, typography, color, border, effects];
