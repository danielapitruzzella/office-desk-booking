import { Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import IdentityModal from "./components/IdentityModal";
import Header from "./components/Header";
import OfficePicker from "./pages/OfficePicker";
import FloorPicker from "./pages/FloorPicker";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";

export default function App() {
  return (
    <UserProvider>
      <IdentityModal />
      <Header />
      <Routes>
        <Route path="/" element={<OfficePicker />} />
        <Route path="/offices/:id" element={<FloorPicker />} />
        <Route path="/offices/:id/floors/:floorId" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  );
}
