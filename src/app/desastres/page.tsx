import type { Metadata } from 'next';
import Radar from './radar';
import './radar.css';
export const metadata: Metadata = { title:'Disaster Radar · Observatorio de desastres | VANGUARD', description:'Observatorio de eventos naturales con fuentes NASA EONET y USGS. No sustituye a las alertas oficiales.' };
export default function Desastres() { return <Radar/>; }
