import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Search, X, Atom } from 'lucide-react';

// Periodic Table Data
const elements = [
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal', group: 1, period: 1 },
  { number: 2, symbol: 'He', name: 'Helium', mass: 4.003, category: 'noble-gas', group: 18, period: 1 },
  { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.941, category: 'alkali-metal', group: 1, period: 2 },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.012, category: 'alkaline-earth', group: 2, period: 2 },
  { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid', group: 13, period: 2 },
  { number: 6, symbol: 'C', name: 'Carbon', mass: 12.01, category: 'nonmetal', group: 14, period: 2 },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.01, category: 'nonmetal', group: 15, period: 2 },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: 16.00, category: 'nonmetal', group: 16, period: 2 },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: 19.00, category: 'halogen', group: 17, period: 2 },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.18, category: 'noble-gas', group: 18, period: 2 },
  { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.99, category: 'alkali-metal', group: 1, period: 3 },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.31, category: 'alkaline-earth', group: 2, period: 3 },
  { number: 13, symbol: 'Al', name: 'Aluminum', mass: 26.98, category: 'post-transition', group: 13, period: 3 },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.09, category: 'metalloid', group: 14, period: 3 },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.97, category: 'nonmetal', group: 15, period: 3 },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.07, category: 'nonmetal', group: 16, period: 3 },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'halogen', group: 17, period: 3 },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.95, category: 'noble-gas', group: 18, period: 3 },
  { number: 19, symbol: 'K', name: 'Potassium', mass: 39.10, category: 'alkali-metal', group: 1, period: 4 },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.08, category: 'alkaline-earth', group: 2, period: 4 },
  { number: 21, symbol: 'Sc', name: 'Scandium', mass: 44.96, category: 'transition', group: 3, period: 4 },
  { number: 22, symbol: 'Ti', name: 'Titanium', mass: 47.87, category: 'transition', group: 4, period: 4 },
  { number: 23, symbol: 'V', name: 'Vanadium', mass: 50.94, category: 'transition', group: 5, period: 4 },
  { number: 24, symbol: 'Cr', name: 'Chromium', mass: 52.00, category: 'transition', group: 6, period: 4 },
  { number: 25, symbol: 'Mn', name: 'Manganese', mass: 54.94, category: 'transition', group: 7, period: 4 },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: 55.85, category: 'transition', group: 8, period: 4 },
  { number: 27, symbol: 'Co', name: 'Cobalt', mass: 58.93, category: 'transition', group: 9, period: 4 },
  { number: 28, symbol: 'Ni', name: 'Nickel', mass: 58.69, category: 'transition', group: 10, period: 4 },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: 63.55, category: 'transition', group: 11, period: 4 },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'transition', group: 12, period: 4 },
  { number: 31, symbol: 'Ga', name: 'Gallium', mass: 69.72, category: 'post-transition', group: 13, period: 4 },
  { number: 32, symbol: 'Ge', name: 'Germanium', mass: 72.63, category: 'metalloid', group: 14, period: 4 },
  { number: 33, symbol: 'As', name: 'Arsenic', mass: 74.92, category: 'metalloid', group: 15, period: 4 },
  { number: 34, symbol: 'Se', name: 'Selenium', mass: 78.97, category: 'nonmetal', group: 16, period: 4 },
  { number: 35, symbol: 'Br', name: 'Bromine', mass: 79.90, category: 'halogen', group: 17, period: 4 },
  { number: 36, symbol: 'Kr', name: 'Krypton', mass: 83.80, category: 'noble-gas', group: 18, period: 4 },
  { number: 37, symbol: 'Rb', name: 'Rubidium', mass: 85.47, category: 'alkali-metal', group: 1, period: 5 },
  { number: 38, symbol: 'Sr', name: 'Strontium', mass: 87.62, category: 'alkaline-earth', group: 2, period: 5 },
  { number: 39, symbol: 'Y', name: 'Yttrium', mass: 88.91, category: 'transition', group: 3, period: 5 },
  { number: 40, symbol: 'Zr', name: 'Zirconium', mass: 91.22, category: 'transition', group: 4, period: 5 },
  { number: 41, symbol: 'Nb', name: 'Niobium', mass: 92.91, category: 'transition', group: 5, period: 5 },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', mass: 95.95, category: 'transition', group: 6, period: 5 },
  { number: 43, symbol: 'Tc', name: 'Technetium', mass: 98, category: 'transition', group: 7, period: 5 },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', mass: 101.1, category: 'transition', group: 8, period: 5 },
  { number: 45, symbol: 'Rh', name: 'Rhodium', mass: 102.9, category: 'transition', group: 9, period: 5 },
  { number: 46, symbol: 'Pd', name: 'Palladium', mass: 106.4, category: 'transition', group: 10, period: 5 },
  { number: 47, symbol: 'Ag', name: 'Silver', mass: 107.9, category: 'transition', group: 11, period: 5 },
  { number: 48, symbol: 'Cd', name: 'Cadmium', mass: 112.4, category: 'transition', group: 12, period: 5 },
  { number: 49, symbol: 'In', name: 'Indium', mass: 114.8, category: 'post-transition', group: 13, period: 5 },
  { number: 50, symbol: 'Sn', name: 'Tin', mass: 118.7, category: 'post-transition', group: 14, period: 5 },
  { number: 51, symbol: 'Sb', name: 'Antimony', mass: 121.8, category: 'metalloid', group: 15, period: 5 },
  { number: 52, symbol: 'Te', name: 'Tellurium', mass: 127.6, category: 'metalloid', group: 16, period: 5 },
  { number: 53, symbol: 'I', name: 'Iodine', mass: 126.9, category: 'halogen', group: 17, period: 5 },
  { number: 54, symbol: 'Xe', name: 'Xenon', mass: 131.3, category: 'noble-gas', group: 18, period: 5 },
  { number: 55, symbol: 'Cs', name: 'Cesium', mass: 132.9, category: 'alkali-metal', group: 1, period: 6 },
  { number: 56, symbol: 'Ba', name: 'Barium', mass: 137.3, category: 'alkaline-earth', group: 2, period: 6 },
  { number: 72, symbol: 'Hf', name: 'Hafnium', mass: 178.5, category: 'transition', group: 4, period: 6 },
  { number: 73, symbol: 'Ta', name: 'Tantalum', mass: 180.9, category: 'transition', group: 5, period: 6 },
  { number: 74, symbol: 'W', name: 'Tungsten', mass: 183.8, category: 'transition', group: 6, period: 6 },
  { number: 75, symbol: 'Re', name: 'Rhenium', mass: 186.2, category: 'transition', group: 7, period: 6 },
  { number: 76, symbol: 'Os', name: 'Osmium', mass: 190.2, category: 'transition', group: 8, period: 6 },
  { number: 77, symbol: 'Ir', name: 'Iridium', mass: 192.2, category: 'transition', group: 9, period: 6 },
  { number: 78, symbol: 'Pt', name: 'Platinum', mass: 195.1, category: 'transition', group: 10, period: 6 },
  { number: 79, symbol: 'Au', name: 'Gold', mass: 197.0, category: 'transition', group: 11, period: 6 },
  { number: 80, symbol: 'Hg', name: 'Mercury', mass: 200.6, category: 'transition', group: 12, period: 6 },
  { number: 81, symbol: 'Tl', name: 'Thallium', mass: 204.4, category: 'post-transition', group: 13, period: 6 },
  { number: 82, symbol: 'Pb', name: 'Lead', mass: 207.2, category: 'post-transition', group: 14, period: 6 },
  { number: 83, symbol: 'Bi', name: 'Bismuth', mass: 209.0, category: 'post-transition', group: 15, period: 6 },
  { number: 84, symbol: 'Po', name: 'Polonium', mass: 209, category: 'metalloid', group: 16, period: 6 },
  { number: 85, symbol: 'At', name: 'Astatine', mass: 210, category: 'halogen', group: 17, period: 6 },
  { number: 86, symbol: 'Rn', name: 'Radon', mass: 222, category: 'noble-gas', group: 18, period: 6 },
  { number: 87, symbol: 'Fr', name: 'Francium', mass: 223, category: 'alkali-metal', group: 1, period: 7 },
  { number: 88, symbol: 'Ra', name: 'Radium', mass: 226, category: 'alkaline-earth', group: 2, period: 7 },
  { number: 104, symbol: 'Rf', name: 'Rutherfordium', mass: 267, category: 'transition', group: 4, period: 7 },
  { number: 105, symbol: 'Db', name: 'Dubnium', mass: 268, category: 'transition', group: 5, period: 7 },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', mass: 269, category: 'transition', group: 6, period: 7 },
  { number: 107, symbol: 'Bh', name: 'Bohrium', mass: 270, category: 'transition', group: 7, period: 7 },
  { number: 108, symbol: 'Hs', name: 'Hassium', mass: 277, category: 'transition', group: 8, period: 7 },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', mass: 278, category: 'transition', group: 9, period: 7 },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', mass: 281, category: 'transition', group: 10, period: 7 },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', mass: 282, category: 'transition', group: 11, period: 7 },
  { number: 112, symbol: 'Cn', name: 'Copernicium', mass: 285, category: 'transition', group: 12, period: 7 },
  { number: 113, symbol: 'Nh', name: 'Nihonium', mass: 286, category: 'post-transition', group: 13, period: 7 },
  { number: 114, symbol: 'Fl', name: 'Flerovium', mass: 289, category: 'post-transition', group: 14, period: 7 },
  { number: 115, symbol: 'Mc', name: 'Moscovium', mass: 290, category: 'post-transition', group: 15, period: 7 },
  { number: 116, symbol: 'Lv', name: 'Livermorium', mass: 293, category: 'post-transition', group: 16, period: 7 },
  { number: 117, symbol: 'Ts', name: 'Tennessine', mass: 294, category: 'halogen', group: 17, period: 7 },
  { number: 118, symbol: 'Og', name: 'Oganesson', mass: 294, category: 'noble-gas', group: 18, period: 7 },
  // Lanthanides
  { number: 57, symbol: 'La', name: 'Lanthanum', mass: 138.9, category: 'lanthanide', group: 3, period: 6 },
  { number: 58, symbol: 'Ce', name: 'Cerium', mass: 140.1, category: 'lanthanide', group: 3, period: 6 },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', mass: 140.9, category: 'lanthanide', group: 3, period: 6 },
  { number: 60, symbol: 'Nd', name: 'Neodymium', mass: 144.2, category: 'lanthanide', group: 3, period: 6 },
  { number: 61, symbol: 'Pm', name: 'Promethium', mass: 145, category: 'lanthanide', group: 3, period: 6 },
  { number: 62, symbol: 'Sm', name: 'Samarium', mass: 150.4, category: 'lanthanide', group: 3, period: 6 },
  { number: 63, symbol: 'Eu', name: 'Europium', mass: 152.0, category: 'lanthanide', group: 3, period: 6 },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', mass: 157.3, category: 'lanthanide', group: 3, period: 6 },
  { number: 65, symbol: 'Tb', name: 'Terbium', mass: 158.9, category: 'lanthanide', group: 3, period: 6 },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', mass: 162.5, category: 'lanthanide', group: 3, period: 6 },
  { number: 67, symbol: 'Ho', name: 'Holmium', mass: 164.9, category: 'lanthanide', group: 3, period: 6 },
  { number: 68, symbol: 'Er', name: 'Erbium', mass: 167.3, category: 'lanthanide', group: 3, period: 6 },
  { number: 69, symbol: 'Tm', name: 'Thulium', mass: 168.9, category: 'lanthanide', group: 3, period: 6 },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', mass: 173.0, category: 'lanthanide', group: 3, period: 6 },
  { number: 71, symbol: 'Lu', name: 'Lutetium', mass: 175.0, category: 'lanthanide', group: 3, period: 6 },
  // Actinides
  { number: 89, symbol: 'Ac', name: 'Actinium', mass: 227, category: 'actinide', group: 3, period: 7 },
  { number: 90, symbol: 'Th', name: 'Thorium', mass: 232.0, category: 'actinide', group: 3, period: 7 },
  { number: 91, symbol: 'Pa', name: 'Protactinium', mass: 231.0, category: 'actinide', group: 3, period: 7 },
  { number: 92, symbol: 'U', name: 'Uranium', mass: 238.0, category: 'actinide', group: 3, period: 7 },
  { number: 93, symbol: 'Np', name: 'Neptunium', mass: 237, category: 'actinide', group: 3, period: 7 },
  { number: 94, symbol: 'Pu', name: 'Plutonium', mass: 244, category: 'actinide', group: 3, period: 7 },
  { number: 95, symbol: 'Am', name: 'Americium', mass: 243, category: 'actinide', group: 3, period: 7 },
  { number: 96, symbol: 'Cm', name: 'Curium', mass: 247, category: 'actinide', group: 3, period: 7 },
  { number: 97, symbol: 'Bk', name: 'Berkelium', mass: 247, category: 'actinide', group: 3, period: 7 },
  { number: 98, symbol: 'Cf', name: 'Californium', mass: 251, category: 'actinide', group: 3, period: 7 },
  { number: 99, symbol: 'Es', name: 'Einsteinium', mass: 252, category: 'actinide', group: 3, period: 7 },
  { number: 100, symbol: 'Fm', name: 'Fermium', mass: 257, category: 'actinide', group: 3, period: 7 },
  { number: 101, symbol: 'Md', name: 'Mendelevium', mass: 258, category: 'actinide', group: 3, period: 7 },
  { number: 102, symbol: 'No', name: 'Nobelium', mass: 259, category: 'actinide', group: 3, period: 7 },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', mass: 266, category: 'actinide', group: 3, period: 7 },
];

const categoryColors = {
  'alkali-metal': 'bg-red-100 hover:bg-red-200 border-red-300 text-red-800',
  'alkaline-earth': 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800',
  'transition': 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800',
  'post-transition': 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800',
  'metalloid': 'bg-teal-100 hover:bg-teal-200 border-teal-300 text-teal-800',
  'nonmetal': 'bg-sky-100 hover:bg-sky-200 border-sky-300 text-sky-800',
  'halogen': 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300 text-indigo-800',
  'noble-gas': 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800',
  'lanthanide': 'bg-pink-100 hover:bg-pink-200 border-pink-300 text-pink-800',
  'actinide': 'bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-800',
};

const categoryLabels = {
  'alkali-metal': 'Alkali Metals',
  'alkaline-earth': 'Alkaline Earth Metals',
  'transition': 'Transition Metals',
  'post-transition': 'Post-Transition Metals',
  'metalloid': 'Metalloids',
  'nonmetal': 'Nonmetals',
  'halogen': 'Halogens',
  'noble-gas': 'Noble Gases',
  'lanthanide': 'Lanthanides',
  'actinide': 'Actinides',
};

const ElementCell = ({ element, onClick, isHighlighted }) => {
  if (!element) return <div className="w-12 h-14" />;
  
  return (
    <button
      onClick={() => onClick(element)}
      className={`w-12 h-14 p-1 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer
        ${categoryColors[element.category] || 'bg-gray-100 border-gray-300'}
        ${isHighlighted ? 'ring-2 ring-indigo-500 scale-110 shadow-lg z-10' : ''}
        hover:scale-105 hover:shadow-md
      `}
    >
      <span className="text-[10px] opacity-60">{element.number}</span>
      <span className="text-sm font-bold leading-tight">{element.symbol}</span>
      <span className="text-[8px] opacity-70 truncate w-full">{element.mass.toFixed(1)}</span>
    </button>
  );
};

const ElementDetail = ({ element, onClose }) => {
  if (!element) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-md shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${categoryColors[element.category]}`}>
                {element.symbol}
              </div>
              <div>
                <CardTitle className="text-2xl">{element.name}</CardTitle>
                <p className="text-sm text-slate-500">Atomic Number: {element.number}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Atomic Mass</p>
              <p className="text-lg font-semibold text-slate-900">{element.mass} u</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Category</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">{element.category.replace('-', ' ')}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Group</p>
              <p className="text-lg font-semibold text-slate-900">{element.group}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Period</p>
              <p className="text-lg font-semibold text-slate-900">{element.period}</p>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${categoryColors[element.category]}`}>
            <p className="text-sm font-medium">{categoryLabels[element.category]}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PeriodicTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [highlightedCategory, setHighlightedCategory] = useState(null);

  const getElementByPosition = (period, group) => {
    // Handle lanthanides and actinides separately
    if (period === 6 && group === 3) return null; // Placeholder for lanthanides
    if (period === 7 && group === 3) return null; // Placeholder for actinides
    
    return elements.find(e => 
      e.period === period && 
      e.group === group && 
      e.category !== 'lanthanide' && 
      e.category !== 'actinide'
    );
  };

  const getLanthanide = (index) => {
    return elements.filter(e => e.category === 'lanthanide')[index];
  };

  const getActinide = (index) => {
    return elements.filter(e => e.category === 'actinide')[index];
  };

  const filteredElements = searchTerm 
    ? elements.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.number.toString() === searchTerm
      )
    : [];

  const isHighlighted = (element) => {
    if (!element) return false;
    if (highlightedCategory && element.category === highlightedCategory) return true;
    if (searchTerm && filteredElements.some(e => e.number === element.number)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Atom className="h-8 w-8 text-indigo-600" />
            Periodic Table
          </h1>
          <p className="text-slate-500">Interactive periodic table of elements for chemistry study.</p>
        </div>
      </div>

      {/* Search and Legend */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, symbol, or number..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setHighlightedCategory(highlightedCategory === key ? null : key)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${categoryColors[key]} ${highlightedCategory === key ? 'ring-2 ring-indigo-500' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-x-auto">
        <CardContent className="p-6">
          <div className="min-w-[900px]">
            {/* Main Table Grid */}
            <div className="space-y-1">
              {[1, 2, 3, 4, 5, 6, 7].map(period => (
                <div key={period} className="flex gap-1 items-center">
                  <span className="w-6 text-xs text-slate-400 font-medium">{period}</span>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(group => {
                    // Handle gaps in the table
                    if (period === 1 && group > 1 && group < 18) return <div key={group} className="w-12 h-14" />;
                    if (period <= 3 && group > 2 && group < 13) return <div key={group} className="w-12 h-14" />;
                    
                    const element = getElementByPosition(period, group);
                    return (
                      <ElementCell
                        key={group}
                        element={element}
                        onClick={setSelectedElement}
                        isHighlighted={isHighlighted(element)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Lanthanides & Actinides */}
            <div className="mt-6 space-y-1">
              <div className="flex gap-1 items-center">
                <span className="w-6 text-xs text-slate-400 font-medium">La</span>
                <div className="w-12 h-14" />
                <div className="w-12 h-14" />
                {Array.from({ length: 15 }).map((_, i) => (
                  <ElementCell
                    key={i}
                    element={getLanthanide(i)}
                    onClick={setSelectedElement}
                    isHighlighted={isHighlighted(getLanthanide(i))}
                  />
                ))}
              </div>
              <div className="flex gap-1 items-center">
                <span className="w-6 text-xs text-slate-400 font-medium">Ac</span>
                <div className="w-12 h-14" />
                <div className="w-12 h-14" />
                {Array.from({ length: 15 }).map((_, i) => (
                  <ElementCell
                    key={i}
                    element={getActinide(i)}
                    onClick={setSelectedElement}
                    isHighlighted={isHighlighted(getActinide(i))}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Element Detail Modal */}
      {selectedElement && (
        <ElementDetail element={selectedElement} onClose={() => setSelectedElement(null)} />
      )}
    </div>
  );
};

export default PeriodicTable;
