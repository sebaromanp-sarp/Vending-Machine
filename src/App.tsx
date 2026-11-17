import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BuildingDescent from './components/BuildingDescent';
import ExplodedMachine from './components/ExplodedMachine';
import { Benefits, Catalog, Footer, Machines, Services, Stats } from './components/Sections';
import Contact from './components/Contact';

export default function App() {
  return (
    <div className="bg-black text-white font-sans">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <BuildingDescent />
        <ExplodedMachine />
        <Benefits />
        <Catalog />
        <Services />
        <Machines />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
