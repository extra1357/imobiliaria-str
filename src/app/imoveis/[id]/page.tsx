import type { Metadata } from "next";
import { buscarImovelPorId } from "@/lib/imoveis";
import ImovelDetalhes from "./ImovelDetalhes";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const imovel = await buscarImovelPorId(params.id);
  if (!imovel) return { title: "Imóvel não encontrado" };

  const titulo = `${imovel.type} em ${imovel.addr?.split(",")[1]?.trim() || "Região"}`;
  const descricao = `${imovel.type} ${imovel.finalidade === "aluguel" ? "para alugar" : "à venda"} em ${imovel.addr}.${imovel.quartos ? ` ${imovel.quartos} quartos.` : ""}${imovel.metragem ? ` ${imovel.metragem}m².` : ""} R$ ${new Intl.NumberFormat("pt-BR").format(imovel.price)}.`;
  const url = `https://www.imobiliariaperto.com.br/imoveis/${params.id}`;
  const imagem = imovel.imagens?.[0] || "/og-image.jpg";

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      title: `${titulo} | Imobiliária Perto`,
      description: descricao,
      url,
      type: "website",
      images: [{ url: imagem, width: 1200, height: 630, alt: titulo }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: descricao, images: [imagem] },
  };
}

export default async function ImovelPage({ params }: PageProps) {
  const imovel = await buscarImovelPorId(params.id);
  if (!imovel) notFound();
  return <ImovelDetalhes imovel={imovel} />;
}