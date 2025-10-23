export function getParamId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('id');
}

export function formatLink(prefix, username) {
    if (!username) return "";
    username = username.trim();
    if (username.startsWith("http")) return username;
    return `${prefix}${username.replace(/^@/, "")}`;
}