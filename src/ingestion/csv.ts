/**
 * Parses comma-separated values, including quoted commas, escaped quotes, and
 * line breaks embedded inside a quoted cell. Empty trailing rows are omitted.
 */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (inQuotes) {
      if (character === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        inQuotes = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      inQuotes = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      row.push(field);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      field = '';
      if (character === '\r' && next === '\n') index += 1;
    } else {
      field += character;
    }
  }

  if (inQuotes) throw new Error('CSV ended inside a quoted field.');
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  }

  return rows;
}
