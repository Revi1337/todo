export type ChartTooltipProps = {
  active?: boolean
  payload?: ReadonlyArray<{ value?: number | string; payload: Record<string, string> }>
}

export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: '16px',
  border: '1px solid rgba(128,128,128,0.2)',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.15)',
  background: 'var(--color-card)',
  color: 'var(--color-card-foreground)',
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 600,
}
