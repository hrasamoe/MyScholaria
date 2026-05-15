import { Resend } from "resend";
import { ENV } from "../config/env";

export const resend = new Resend(ENV.RESEND_API_KEY);
