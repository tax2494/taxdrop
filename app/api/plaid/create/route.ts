import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from "plaid";

const plaid = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
        "PLAID-SECRET": process.env.PLAID_SECRET_SANDBOX!,
      },
    },
  })
);

export async function GET() {
  const { data } = await plaid.linkTokenCreate({
    user: { client_user_id: "user-1-test" },
    client_name: "TaxDrop",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  });

  return Response.json({ link_token: data.link_token });
}