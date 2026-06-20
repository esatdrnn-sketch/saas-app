import UpdateCardScreen from "./UpdateCardScreen";

export default async function UpdateCardPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <UpdateCardScreen token={token} />;
}
