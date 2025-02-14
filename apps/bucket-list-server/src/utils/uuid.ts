import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)

export function getUuid() {
  return nanoid();
}

export function getLowercaseUuid() {
  return nanoid().toLowerCase();
}

const nanoid_number = customAlphabet('1234567890', 8)
export function getNumberUuid() {
  return Number(nanoid_number())
}