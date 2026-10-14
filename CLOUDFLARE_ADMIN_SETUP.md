# Cloudflare Access setup for the survey admin

This branch replaces the original ChatGPT Sites sign-in dependency for the survey admin with Cloudflare Access.

1. In Cloudflare Zero Trust > Access > Applications, create a **Self-hosted** application on the Worker hostname. Protect **two** paths: `/admin*` and `/api/admin/*`. Configure two applications if the dashboard does not permit both paths in one.
2. Add an **Allow** policy including only these two emails:
   - haladalloul42@gmail.com
   - banany2007k@gmail.com
3. Use an email one-time PIN or another identity provider, and ensure Access checks the exact email addresses.
4. Keep the public homepage `/` and `POST /api/responses` *outside* the Access application. The latter is how students submit survey responses.
5. In Worker Settings > Variables and Secrets set:
   - `CF_ACCESS_TEAM_DOMAIN` to your **exact** Access team domain URL, such as `https://your-team.cloudflareaccess.com` (without trailing slash).
   - `CF_ACCESS_AUD` to the **Application Audience (AUD)** value shown by Cloudflare Access. If using separate Access applications for the two paths, use the same audience for both (prefer one app with both paths); otherwise extend the validation to recognize both distinct audiences securely.
   - `SURVEY_ADMIN_EMAILS` to `haladalloul42@gmail.com,banany2007k@gmail.com`.
6. Deploy only once both routes are protected by Access. These changes fail closed (403) if the identity is unverified or config is missing.
7. Test: guests can submit the public form; unauthenticated visitors cannot read `/api/admin/responses`; only either authorized account can visit `/admin` and export CSV.

The server checks the **RSA signature** of the Access JWT against Cloudflare's published JWKS, as well as issuer, audience, expiration, and email allowlist. Client-controlled email headers are not trusted.

**Security:** If a public `/api/admin/responses` request contains a forged JWT, it must still be denied. The Access application needs to cover both admin routes. No keys or account tokens should be committed to GitHub.
