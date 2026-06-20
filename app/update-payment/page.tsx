import UpdateCardScreen from "../update-card/UpdateCardScreen";

export default async function UpdatePaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <UpdateCardScreen token={token} />;
}
