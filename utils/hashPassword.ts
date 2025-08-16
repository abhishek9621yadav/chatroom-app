import bcrypt from "bcryptjs";

export async function HashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}
export async function VerifyPassword(password: string, DBPassword: string) {
  const isValid = await bcrypt.compare(password, DBPassword);
  return isValid;
}
