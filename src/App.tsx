import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PanierProvider } from './contexts/PanierContext';
import { FavorisProvider } from './contexts/FavorisContext';
import { ToastProvider } from './components/ui/Toast';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CookieBanner } from './components/CookieBanner';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Catalogue } from './pages/Catalogue';
import { ProduitDetail } from './pages/ProduitDetail';
import { Profile } from './pages/Profile';
import { Addresses } from './pages/Addresses';
import { Panier } from './pages/Panier';
import { Checkout } from './pages/Checkout';
import { CommandeConfirmation } from './pages/CommandeConfirmation';
import { MesCommandes } from './pages/MesCommandes';
import { Confidentialite } from './pages/Confidentialite';
import { Cgu } from './pages/Cgu';
import { NotFound } from './pages/NotFound';
import { Favoris } from './pages/Favoris';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProduits } from './pages/admin/AdminProduits';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminStocks } from './pages/admin/AdminStocks';
import { AdminCommandes } from './pages/admin/AdminCommandes';
import { AdminUtilisateurs } from './pages/admin/AdminUtilisateurs';
import { AccountLayout } from './layouts/AccountLayout';
import { FocusLayout } from './layouts/FocusLayout';
import { MotDePasseOublie } from './pages/MotDePasseOublie';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PanierProvider>
          <FavorisProvider>
            <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/produits/:id" element={<ProduitDetail />} />
                <Route path="/panier" element={<Panier />} />
                <Route path="/confidentialite" element={<Confidentialite />} />
                <Route path="/cgu" element={<Cgu />} />

                <Route element={<AccountLayout />}>
                  <Route path="/favoris" element={<Favoris />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profil" element={<Profile />} />
                    <Route path="/adresses" element={<Addresses />} />
                    <Route path="/mes-commandes" element={<MesCommandes />} />
                  </Route>
                </Route>

              </Route>

              {/* Pages « focus » : header minimal, sans navigation boutique */}
              <Route element={<FocusLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/commande-confirmation" element={<CommandeConfirmation />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute adminOnly />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/produits" element={<AdminProduits />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/stocks" element={<AdminStocks />} />
                  <Route path="/admin/commandes" element={<AdminCommandes />} />
                  <Route path="/admin/utilisateurs" element={<AdminUtilisateurs />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieBanner />
          </BrowserRouter>
        </FavorisProvider>
        </PanierProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;