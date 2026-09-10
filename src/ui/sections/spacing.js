/**
 * Spacing section — padding, margin, and flex/grid gap.
 *
 * Padding and margin are the same control rendered twice; the only thing that
 * differs is which SHORTHAND_GROUPS entry drives it.
 */

import { SHORTHAND_GROUPS } from '../../core/schema.js';
import {
  section,
  linkSwitch,
  fourSidedControl,
  bindFourSided,
  scrubControl,
  bindScrub,
  controlRow
} from './shared.js';

export const id = 'spacing';

const PADDING = SHORTHAND_GROUPS.find(group => group.name === 'padding');
const MARGIN = SHORTHAND_GROUPS.find(group => group.name === 'margin');

/** Panel id prefix for each group's inputs. */
const PREFIX = { padding: 'pad-input', margin: 'mar-input' };

export function render(item) {
  const gap = scrubControl({
    id: 'gap-input',
    testId: 'style_inspector_panel_gap_input',
    value: item.current.gap,
    min: 0,
    suffix: 'px'
  });

  return [
    section({
      title: 'Padding',
      action: linkSwitch(PADDING, item.linkPadding),
      body: fourSidedControl(PADDING, item, {
        idPrefix: PREFIX.padding,
        testId: 'style_inspector_panel_padding_input'
      })
    }),
    section({
      title: 'Margin',
      action: linkSwitch(MARGIN, item.linkMargin),
      body: fourSidedControl(MARGIN, item, {
        idPrefix: PREFIX.margin,
        testId: 'style_inspector_panel_margin_input'
      })
    }),
    section({ title: 'Gap (Flex / Grid)', body: controlRow('Gap', gap) })
  ].join('');
}

export function bind(context) {
  const { panel, state, item } = context;

  bindFourSided(PADDING, context, PREFIX.padding);
  bindFourSided(MARGIN, context, PREFIX.margin);

  bindScrub(panel, 'gap-input', { step: 1, min: 0 }, value => state.updateStyle(item.id, 'gap', value));
}
