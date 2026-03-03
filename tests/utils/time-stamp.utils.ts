/*
* Utility function to get the current timestamp in a specific format.
* The format is ISO string with colons and dots replaced by hyphens, and 'T' replaced by an underscore.
* This is useful for creating unique filenames for screenshots, videos, or logs.
*/

export function getCurrentTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
}