export function trimString(str: string, maxLength?: number): string {
  if (maxLength !== undefined && str.length > maxLength) {
    return str.substring(0, maxLength);
  }
  return str;
}
