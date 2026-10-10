/** Whether the dashboard header should collapse links behind Menu. */

export function navNeedsMenu(input: {
  headerWidth: number;
  padding: number;
  gap: number;
  gaps: number;
  brand: number;
  links: number;
  chip: number;
  wallet: number;
  side?: number;
}): boolean {
  const side = input.side ?? 0;
  const needed =
    input.padding + input.brand + input.links + input.chip + input.wallet + side + input.gap * input.gaps;
  return needed > input.headerWidth;
}
