/** HashRouter deep link containing only the business identifier, with no customer query data. */
export function businessShareUrl(id: string, currentUrl: string): string {
  const url = new URL(currentUrl);
  url.search = '';
  url.hash = `/mall?business=${encodeURIComponent(id)}`;
  return url.toString();
}
