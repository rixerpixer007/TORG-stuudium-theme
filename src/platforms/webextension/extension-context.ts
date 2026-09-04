export function isExtensionContextInvalidatedError(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string" &&
    value.message.includes("Extension context invalidated")
  );
}
