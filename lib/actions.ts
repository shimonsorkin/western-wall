"use server";

import { EnvCheckResult, EnvCheckAction } from "@joycostudio/v0-setup";

export const checkEnvs: EnvCheckAction = async () => {
  // Only check environment variables in development
  if (process.env.NODE_ENV === 'production') {
    return {
      envs: [],
      allValid: true,
    };
  }

  const requiredEnvs = [
    { name: 'MAILCHIMP_API_KEY', label: 'Mailchimp API Key' },
    { name: 'MAILCHIMP_AUDIENCE_ID', label: 'Mailchimp Audience ID' },
  ];

  const envs: EnvCheckResult[] = requiredEnvs.map(env => ({
    name: env.name,
    label: env.label,
    isValid: Boolean(process.env[env.name]),
  }));

  const allValid = envs.every(env => env.isValid);

  return {
    envs,
    allValid,
  };
}
