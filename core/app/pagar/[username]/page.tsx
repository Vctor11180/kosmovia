import { PayLink } from "../../../components/PayLink";

/** /pagar/<username>?monto=5&activo=USDC: the page a payment link or QR opens. */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { username } = await params;
  let decoded = username;
  try {
    decoded = decodeURIComponent(username);
  } catch {
    // A malformed link: PayLink shows it as invalid.
  }
  const query = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const activo = one(query.activo);
  return (
    <PayLink
      username={decoded.replace(/^@/, "").toLowerCase().slice(0, 30)}
      amount={one(query.monto)?.slice(0, 24)}
      asset={activo === "XLM" || activo === "USDC" ? activo : undefined}
    />
  );
}
