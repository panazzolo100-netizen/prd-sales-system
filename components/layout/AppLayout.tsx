/**
 * Compatibility boundary for pages migrated to the persistent protected
 * layout. It deliberately renders no shell and can be removed incrementally.
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
