import type { Metadata } from "next";
import { buscarImoveis } from "@/lib/imoveis";
import ListaImoveisClient from "./components/ListaImoveisClient";
import Footer from "./components/Footer";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: { cidade?: string; tipo?: string; finalidade?: string };
}

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const cidade = searchParams?.cidade || "";
  const finalidade = searchParams?.finalidade || "";

  let title = "Imóveis em Salto, Itu, Indaiatuba e Região";
  let description = "Encontre casas, apartamentos, terrenos e imóveis comerciais em Salto, Itu, Indaiatuba, Sorocaba, Campinas e Porto Feliz.";

  if (cidade) {
    title = `Imóveis em ${cidade} | Imobiliária Perto`;
    description = `Encontre casas, apartamentos e terrenos em ${cidade}. Compra e aluguel com a Imobiliária Perto.`;
  } else if (finalidade === "venda") {
    title = "Imóveis à Venda | Salto, Itu, Indaiatuba e Região";
    description = "Casas, apartamentos e terrenos à venda em Salto, Itu, Indaiatuba, Sorocaba e região.";
  } else if (finalidade === "aluguel") {
    title = "Imóveis para Alugar | Salto, Itu, Indaiatuba e Região";
    description = "Casas e apartamentos para alugar em Salto, Itu, Indaiatuba, Sorocaba e região.";
  }

  return {
    title,
    description,
    alternates: { canonical: cidade ? `https://www.imobiliariaperto.com.br/?cidade=${cidade}` : "https://www.imobiliariaperto.com.br" },
    openGraph: { title, description, url: "https://www.imobiliariaperto.com.br", type: "website" },
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const cidade = searchParams?.cidade || "";
  const imoveis = await buscarImoveis(cidade || undefined);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ListaImoveisClient initialData={imoveis} cidadeAtual={cidade} />
      <Footer />
    </div>
  );
}