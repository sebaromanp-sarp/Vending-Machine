export const PHONE = '+56 9 9558 4166';
export const PHONE_HREF = 'tel:+56995584166';
export const EMAIL = 'contacto@puntomatica.cl';
export const FORM_ENDPOINT = 'https://formsubmit.co/ajax/seba.romanp@gmail.com';

export const NAV = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Por dentro', href: '#por-dentro' },
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Máquinas', href: '#maquinas' },
];

export const STATS = [
  { value: '$0', label: 'Costo e inversión para la comunidad' },
  { value: '24/7', label: 'Disponibilidad de abarrotes y snacks' },
  { value: '<24h', label: 'Soporte técnico presencial' },
];

export const BENEFITS = [
  {
    icon: 'dollar',
    title: 'Cero Costo e Inversión',
    desc: 'Instalación, consumo eléctrico, reposición y soporte técnico corren 100% por nuestra cuenta.',
  },
  {
    icon: 'coins',
    title: 'Aporte a la Comunidad',
    desc: 'Aportamos un porcentaje de las ventas o un monto fijo mensual al Fondo de Reserva del edificio.',
  },
  {
    icon: 'door',
    title: 'Descongestión en Conserjería',
    desc: 'Disminuye el flujo de repartidores externos al contar con alimentos y snacks a pasos del ascensor.',
  },
  {
    icon: 'pin',
    title: 'Soporte Local en Concepción',
    desc: 'Monitoreo remoto de stock y atención técnica presencial en menos de 24 horas.',
  },
] as const;

export const CATS = [
  {
    key: 'abarrotes',
    label: 'Abarrotes Esenciales',
    desc: 'Lo que se acaba justo a la hora de cocinar, disponible sin salir del edificio.',
    items: ['Aceite', 'Tallarines', 'Crema de leche', 'Mayonesa', 'Aderezos', 'Conservas (atún, jurel)', 'Jamón de pavo/cerdo', 'Queso laminado'],
  },
  {
    key: 'snacks',
    label: 'Snacks e Impulso',
    desc: 'El antojo de la tarde y la reunión improvisada, resueltos a pasos del ascensor.',
    items: ['Papas fritas', 'Doritos', 'Frutos secos', 'Barras de chocolate', 'Galletas', 'Golosinas'],
  },
  {
    key: 'bebidas',
    label: 'Bebidas Frías',
    desc: 'Refrigeración permanente para bebidas a temperatura ideal las 24 horas.',
    items: ['Refrescos en lata', 'Aguas', 'Isotónicas', 'Energéticas'],
  },
  {
    key: 'mascotas',
    label: 'Mascotas',
    desc: 'Porque el gato y el perro del departamento también son vecinos.',
    items: ['Churu / sachets para gatos', 'Snacks para perros'],
  },
];

export const SERVICES = [
  {
    icon: 'truck',
    title: 'Instalación Sin Costo',
    desc: 'Llevamos, instalamos y conectamos la máquina sin cobrar nada a la comunidad.',
  },
  {
    icon: 'package',
    title: 'Reposición y Monitoreo Remoto',
    desc: 'Controlamos el stock a distancia para que nunca falten productos.',
  },
  {
    icon: 'wrench',
    title: 'Soporte Técnico <24h',
    desc: 'Ante cualquier falla, un técnico local responde en menos de un día.',
  },
] as const;

export const MACHINES = [
  {
    name: 'Modelo Slim / Estándar',
    desc: 'Ideal para conserjería, formato compacto.',
    img: '/assets/maquina-slim.png',
  },
  {
    name: 'Modelo Máxima Capacidad',
    desc: 'Multiproducto, mayor stock.',
    img: '/assets/maquina-maxima.png',
  },
];

export const BRANDS = [
  { name: 'Coca-Cola', img: '/assets/logo-coca-cola.png', h: 44 },
  { name: 'Cachantún', img: '/assets/logo-cachantun.webp', h: 44 },
  { name: 'Kraft', img: '/assets/logo-kraft.jpg', h: 58 },
  { name: 'Costa', img: '/assets/logo-costa.jpg', h: 58 },
  { name: 'PF — Productos Fernández', img: '/assets/logo-pf.png', h: 56 },
];

export const COMUNAS = ['Concepción', 'San Pedro de la Paz', 'Talcahuano', 'Chiguayante'];
