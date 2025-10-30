export function toSentenceCase(str: string) {
    if (!str || typeof str !== "string") {
        return "";
    }

    // Convert the entire string to lowercase first
    let result = str.toLowerCase();

    // Capitalize the first letter of the string
    result = result.charAt(0).toUpperCase() + result.slice(1);

    // Capitalize the first letter after a period, exclamation mark, or question mark
    result = result.replace(/([.!?]\s*)(\w)/g, (match, p1, p2) => p1 + p2.toUpperCase());

    return result;
}
