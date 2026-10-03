const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

export const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(digest);
};

export const generateInviteToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
};
