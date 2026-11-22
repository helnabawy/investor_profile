/** Re-mounts on every admin navigation, so each screen settles in with one short entrance. */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
