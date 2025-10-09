import { randomInt } from "node:crypto";

export const generateRandomOTP = () => {
  return randomInt(100000, 1000000);
};
