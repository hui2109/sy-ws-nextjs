import {menuBar, MenuBarItem} from "@/configs/menuBar";

export function getFarthestURL(activeTopId: string): string | null {
    const topItem = menuBar.find((item) => item.id === activeTopId);
    if (!topItem) return null;

    function findDeepestPath(item: MenuBarItem): string | null {
        if (item.children?.[0]) {
            const childPath = findDeepestPath(item.children[0]);
            if (childPath) return childPath;
        }
        return item.path ?? null;
    }

    return findDeepestPath(topItem);
}

export function getNearestURL(activeTopId: string | null, activeSideId: string | null): string | null {
    const topItem = menuBar.find((item) => item.id === activeTopId);
    if (!topItem) return null;

    function findPathById(item: MenuBarItem, nearestAncestorPath: string | null): string | null {
        const currentPath = item.path ?? nearestAncestorPath;

        if (item.id === activeSideId) {
            return item.path ?? nearestAncestorPath;
        }
        if (item.children) {
            for (const child of item.children) {
                const found = findPathById(child, currentPath);
                if (found) return found;
            }
        }
        return null;
    }

    return findPathById(topItem, null) ?? topItem.path ?? null;
}