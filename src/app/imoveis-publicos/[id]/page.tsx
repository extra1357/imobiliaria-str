import { redirect } from 'next/navigation';

interface Props { params: { id: string } }

export default function ImovelPublicoRedirect({ params }: Props) {
  redirect('/imoveis/' + params.id);
}