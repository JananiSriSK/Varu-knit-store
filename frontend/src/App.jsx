import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Body from "./pages/Body.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./pages/Login.jsx";
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Body />} />
            <Route path="/login" element={<Login />} />

            {/* Future routes like ProductDetails, Cart, etc. */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
