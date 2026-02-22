/**
 * CSV Export Utility
 * Converts an array of objects to a CSV file and triggers a download.
 */

export function downloadCSV(data: Record<string, string | number>[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);

    const csvContent = [
        headers.map(escapeCSVField).join(','),
        ...data.map(row =>
            headers.map(h => escapeCSVField(String(row[h] ?? ''))).join(',')
        ),
    ].join('\n');

    // Add BOM for Excel compatibility with unicode
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeCSVField(field: string): string {
    // If the field contains commas, quotes, or newlines, wrap in quotes and escape inner quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}
