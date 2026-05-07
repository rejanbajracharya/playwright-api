import CryptoJS from "crypto-js";

class RapidAuthSignature {
  private readonly baseUrl?: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl;
  }

  generateAuthHeaderEncodedUserSignature(
    requestUrl: string | URL,
    username: string,
    privateKey: string,
    body?: unknown
  ): string {
    const parsedUrl = this.parseUrl(requestUrl);
    const signatureContent = generateSignatureContent(
      parsedUrl.pathname,
      parsedUrl.searchParams,
      body
    );

    const hmacSha1Signature = getHmacSha1SignatureFromStringContent(
      signatureContent,
      privateKey
    );

    const authSignature = `user ${username}:${hmacSha1Signature}`;

    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authSignature));
  }

  private parseUrl(requestUrl: string | URL): URL {
    if (requestUrl instanceof URL) {
      return requestUrl;
    }

    if (requestUrl.startsWith("http://") || requestUrl.startsWith("https://")) {
      return new URL(requestUrl);
    }

    if (!this.baseUrl) {
      return new URL(requestUrl);
    }

    return new URL(requestUrl, this.baseUrl);
  }
}

const generateSignatureContent = (
  pathName: string,
  query: URLSearchParams,
  body?: unknown
): string => {
  const normalizedPath = pathName || "/";
  let signatureContent = normalizedPath;
  const queryString = query.toString();

  if (queryString.length > 0) {
    signatureContent += `?${queryString}`;
  }

  const bodyString =
    typeof body === "string" ? body : body ? JSON.stringify(body) : "";

  if (bodyString) {
    const trimmedBody = bodyString.replace(/\s+/g, "");
    signatureContent += signatureContent.includes("?")
      ? `&${trimmedBody}`
      : `?${trimmedBody}`;
  }

  return signatureContent;
};

const getHmacSha1SignatureFromStringContent = (
  signatureContent: string,
  privateKey: string
): string => {
  const hash = CryptoJS.HmacSHA1(
    CryptoJS.enc.Utf8.parse(signatureContent),
    CryptoJS.enc.Utf8.parse(privateKey)
  );

  return CryptoJS.enc.Base64.stringify(hash);
};

export { RapidAuthSignature };