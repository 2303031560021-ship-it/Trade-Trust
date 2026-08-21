import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Homepage from './pages/Homepage';
import CheckType from './pages/CheckType';
import SecondHand from './pages/SecondHand';
import LaptopSecondHand from "./pages/LaptopSecondHand";
import TabletSecondHand from "./pages/TabletSecondHand";
import TvSecondHand from "./pages/TvSecondHand";
import WatchSecondHand from "./pages/WatchSecondHand";
import WashingSecondHand from "./pages/WashingSecondHand";
import HeadphoneSecondHand from "./pages/HeadphoneSecondHand";
import AnalysisLoading from './pages/AnalysisLoading';
import ResultPage from './pages/ResultPage';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MobileSecondHand from './pages/SecondHand';
import BrandSelection from "./pages/BrandSelection";
import { Toaster } from "react-hot-toast";
import SavedResults from "./pages/SavedResults";
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">

        <Navbar />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4500,
            style: {
              background: "#1f1f1f",
              color: "#fff",
              border: "1px solid #333"
            }
          }}
        />

        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/check" element={<CheckType />} />

          <Route path="/second-hand" element={<SecondHand />} />
          <Route path="/second-hand/mobile" element={<MobileSecondHand />} />
          <Route path="/second-hand/laptop" element={<LaptopSecondHand />} />
          <Route path="/tablet-second-hand" element={<TabletSecondHand />} />
          <Route path="/second-hand/tv" element={<TvSecondHand />} />
          <Route path="/second-hand/watch" element={<WatchSecondHand />} />
          <Route path="/second-hand/washing" element={<WashingSecondHand />} />
          <Route path="/second-hand/headphone" element={<HeadphoneSecondHand />} />

          <Route path="/brand" element={<BrandSelection />} />
          <Route path="/analysis" element={<AnalysisLoading />} />
          <Route path="/result" element={<ResultPage />} />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/saved-results" element={<SavedResults />} />

        </Routes>

      </div>
    </Router>
  );
}

export default App;