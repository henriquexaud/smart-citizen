import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { iconMap } from './Layout';

interface POI {
  id: number;
  lat: number;
  lon: number;
  category: string;
  tags: Record<string, string>;
}

interface MapViewProps {
  categories: string[];
}

// Corrige ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function MapView({ categories }: MapViewProps) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categories.length) return setPois([]);

    const tagMap: Record<string, string> = {
      Ensino: 'school', Saúde: 'hospital', Ambiental: 'natural', Correios: 'office',
      Esportes: 'sports_centre', Cultura: 'theatre', Segurança: 'police',
      Infraestrutura: 'power', Transporte: 'bus_station', Comunidade: 'community_centre',
      Eventos: 'festival'
    };

    const fetchAll = async () => {
      setLoading(true);
      const allResults: POI[] = [];

      await Promise.all(categories.map(async cat => {
        const tag = tagMap[cat] || cat;
        const query = `[
          out:json];
          area[name="São José dos Campos"]->.area;
          (
            node[amenity~"${tag}"](area.area);
          );
          out center;`;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          data.elements.forEach((el: any) => {
            allResults.push({
              id: el.id,
              lat: el.lat || el.center?.lat,
              lon: el.lon || el.center?.lon,
              category: cat,
              tags: el.tags || {}
            });
          });
        } catch (e) {
          console.error('Erro em categoria', cat, e);
        }
      }));

      setPois(allResults);
      setLoading(false);
    };

    fetchAll();
  }, [categories]);

  const createIcon = (category: string) => {
    const IconComponent = iconMap[category];
    const html = ReactDOMServer.renderToStaticMarkup(
      <IconComponent style={{ fontSize: '24px', color: '#0074D9' }} />
    );
    return L.divIcon({ html, className: 'custom-marker', iconSize: [24, 24] });
  };

  return (
    <MapContainer
      center={[-23.2237, -45.9009] as [number, number]}
      zoom={13}
      scrollWheelZoom
      className="w-full h-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {!loading && pois.map(poi => (
        <Marker
          key={poi.id}
          position={[poi.lat, poi.lon]}
          icon={createIcon(poi.category)}
        >
          <Popup>
            <strong>{poi.tags.name || poi.category}</strong><br />
            {Object.entries(poi.tags).map(([k, v]) => (
              <div key={k}><em>{k}</em>: {v}</div>
            ))}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
