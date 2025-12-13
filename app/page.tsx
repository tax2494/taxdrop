"use client";
import { usePlaidLink } from "react-plaid-link";
import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState("");

  useEffect(() => {
    fetch("/api/plaid/create")
      .then((r) => r.json())
      .then((d) => setToken(d.link_token));
  }, []);

  const { open, ready } = usePlaidLink({
    token,
    onSuccess: (public_token, metadata) => {
      fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token, accounts: metadata.accounts }),
      }).then(() => alert("Bank linked!"));
    },
  });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Link your business account</h1>
      <button
        onClick={() => open()}
        disabled={!ready}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Connect with Plaid
      </button>
    </main>
  );
}