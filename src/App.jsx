import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Placeholder from './pages/Placeholder.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<Placeholder title="Events" />} />
      <Route path="/gallery" element={<Placeholder title="Gallery" />} />
      <Route path="/culture" element={<Placeholder title="Our Culture and Values" />} />
      <Route path="/team" element={<Placeholder title="Team" />} />
      <Route path="/contact" element={<Placeholder title="Contact" />} />
    </Routes>
  );
}

export default App;
