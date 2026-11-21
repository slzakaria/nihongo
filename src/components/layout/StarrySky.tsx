// Scattered twinkling dots behind every page, dark theme only (see .starry-sky in globals.css).
// Fixed to the viewport, rendered once in the root layout, so it stays put behind all content
// instead of scrolling away with the page.
export function StarrySky() {
  return <div aria-hidden="true" className="starry-sky pointer-events-none fixed inset-0 -z-10" />
}
