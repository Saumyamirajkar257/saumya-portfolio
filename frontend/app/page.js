import { getContent } from "@/lib/content";
import LivePortfolio from "@/components/LivePortfolio";

export default async function Home() {
  const content = await getContent();

  return <LivePortfolio initialContent={content} />;
}
