import { redirect } from 'next/navigation';

// La experiencia completa vive en public para conservar el audio autocontenido.
export default function Visita() {
  redirect('/visita.html');
}
