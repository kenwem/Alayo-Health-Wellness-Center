export const siteId = "siteB";
export const siteAdminEmail = "osenialayo@gmail.com";
export const additionalAdminEmails = [];

export const isAdmin = (email: string | null | undefined) => {
  if (!email) return false;
  return email === siteAdminEmail || additionalAdminEmails.includes(email);
};
