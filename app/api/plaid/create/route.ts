import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

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
    products: ["transactions"],
    country_codes: ["US"],
    language: "en",
  });

  return Response.json({ link_token: data.link_token });
}
