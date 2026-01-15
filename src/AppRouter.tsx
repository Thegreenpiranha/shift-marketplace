import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Home from "./pages/Home";
import Search from "./pages/Search";
import Category from "./pages/Category";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import HowItWorks from "./pages/HowItWorks";
import Settings from "./pages/Settings";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/listing/:listingId" element={<ListingDetail />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile/:pubkey" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;