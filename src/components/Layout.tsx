'use client';
import React, { ReactNode, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  FaSchool,
  FaHospital,
  FaLeaf,
  FaFootballBall,
  FaTheaterMasks,
  FaShieldAlt,
  FaBolt,
  FaBus,
  FaUsers,
  FaCalendarAlt,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { FaSignsPost } from 'react-icons/fa6';

// Carrega o MapView somente no cliente, desabilitando SSR para evitar errors de "window is not defined"
const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface LayoutProps {
  children?: ReactNode;
}

const categories = [
  'Ensino', 'Saúde', 'Ambiental', 'Correios', 'Esportes',
  'Cultura', 'Segurança', 'Infraestrutura', 'Transporte', 'Comunidade', 'Eventos'
];

// Mapeamento de cada categoria para um ícone
export const iconMap: Record<string, IconType> = {
  Ensino: FaSchool,
  Saúde: FaHospital,
  Ambiental: FaLeaf,
  Correios: FaSignsPost,
  Esportes: FaFootballBall,
  Cultura: FaTheaterMasks,
  Segurança: FaShieldAlt,
  Infraestrutura: FaBolt,
  Transporte: FaBus,
  Comunidade: FaUsers,
  Eventos: FaCalendarAlt
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const allSelected = selectedCategories.length === categories.length;
  const handleSelectAll = () => {
    setSelectedCategories(prev => prev.length === categories.length ? [] : [...categories]);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="relative h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-gray-800 text-gray-100 shadow flex items-center px-4 z-30">
        <button
          className="mr-4 p-2 rounded hover:bg-gray-700"
          onClick={toggleSidebar}
        >
          ☰
        </button>
        <h1 className="text-xl font-semibold">Smart Citizen</h1>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-20 bottom-0 left-0 bg-gray-800 text-gray-200 overflow-hidden transition-all duration-300 ease-in-out z-20 ${sidebarOpen ? 'w-60 p-4' : 'w-0 p-0'}`}>  
        {sidebarOpen && (
          <form className="flex flex-col space-y-2">
            {/* Selecionar todos */}
            <label className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="form-checkbox h-4 w-4 text-blue-500 focus:ring-blue-400 mr-2"
              />
              <span className="select-none font-medium">Todos</span>
            </label>

            {/* Categorias individuais */}
            {categories.map(category => {
              const IconComponent = iconMap[category];
              return (
                <label
                  key={category}
                  className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    value={category}
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="form-checkbox h-4 w-4 text-blue-500 focus:ring-blue-400 mr-2"
                  />
                  <IconComponent className="mr-2 text-lg" />
                  <span className="select-none">{category}</span>
                </label>
              );
            })}
          </form>
        )}
      </aside>

      {/* Map Container */}
      <div className="fixed inset-0 z-0">
        <MapView categories={selectedCategories} />
      </div>
    </div>
  );
}
