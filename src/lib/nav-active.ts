export interface ActivePathCandidate {
  path: string;
  activePaths?: string[];
}

export function isNamespaceMatch(candidatePath: string, currentPath: string): boolean {
  return currentPath === candidatePath || currentPath.startsWith(candidatePath + "/");
}

export function isItemActive(item: ActivePathCandidate, currentPath: string): boolean {
  if (currentPath === item.path) return true;
  if (item.activePaths) {
    for (const activePath of item.activePaths) {
      if (isNamespaceMatch(activePath, currentPath)) return true;
    }
  }
  return false;
}