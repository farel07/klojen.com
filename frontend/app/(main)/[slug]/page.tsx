import DetailArtikel from "../../pages/detailArtikel";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  return <DetailArtikel slug={slug} />;
}
