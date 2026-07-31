export function cleanBankCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function bicFormatPass(value: string) {
  return /^[A-Z0-9]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(
    cleanBankCode(value),
  );
}

export function ibanChecksumPass(value: string) {
  const iban = cleanBankCode(value);
  const moved = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let remainder = 0;

  for (const character of moved) {
    const numeric = /[A-Z]/.test(character)
      ? String(character.charCodeAt(0) - 55)
      : character;
    for (const digit of numeric) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder === 1;
}

export function abaChecksumPass(value: string) {
  const routingNumber = value.replace(/\D/g, "");
  if (!/^\d{9}$/.test(routingNumber)) return false;
  const digits = [...routingNumber].map(Number);
  const total =
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    digits[2] + digits[5] + digits[8];
  return total % 10 === 0;
}
