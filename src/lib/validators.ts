export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

export function isValidPhone(phone: string): boolean {
  return /^(\+255|0)[67]\d{8}$/.test(phone)
}
