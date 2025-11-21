


export function createPageUrl(pageName: string) {
    if (!pageName) return '/';

    const [rawPath, query = ''] = pageName.split('?');
    const normalizedPath = rawPath.replace(/\s+/g, '');
    const normalizedQuery = query ? `?${query}` : '';

    return `/${normalizedPath}${normalizedQuery}`;
}