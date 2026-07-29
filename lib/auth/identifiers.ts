const RESTAURANT_ACCOUNT_DOMAIN =
  "accounts.cordoba.online";

const USERNAME_PATTERN =
  /^[a-z0-9][a-z0-9._-]{2,39}$/;

export function normalizeLoginIdentifier(
  value: string,
) {
  return value.trim().toLowerCase();
}

export function isEmailIdentifier(
  identifier: string,
) {
  return identifier.includes("@");
}

export function isValidRestaurantUsername(
  username: string,
) {
  return USERNAME_PATTERN.test(username);
}

export function usernameToInternalEmail(
  username: string,
) {
  const normalizedUsername =
    normalizeLoginIdentifier(username);

  if (
    !isValidRestaurantUsername(
      normalizedUsername,
    )
  ) {
    throw new Error(
      "El nombre de usuario no es válido.",
    );
  }

  return `${normalizedUsername}@${RESTAURANT_ACCOUNT_DOMAIN}`;
}

export function loginIdentifierToEmail(
  value: string,
) {
  const identifier =
    normalizeLoginIdentifier(value);

  if (isEmailIdentifier(identifier)) {
    return identifier;
  }

  return usernameToInternalEmail(identifier);
}