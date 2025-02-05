export function generateId(): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomArray = new Uint8Array(12);
  crypto.getRandomValues(randomArray);

  return Array.from(randomArray)
    .map((x) => charset[x % charset.length])
    .join('');
}
