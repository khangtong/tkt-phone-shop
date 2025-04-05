import Header from './components/Header';
import { Routes, Route } from 'react-router-dom'; // Xóa BrowserRouter
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Footer from './components/Footer';
import Order from './pages/Order';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import ProductDashboard from './components/dashboard/Product/ProductDashboard';
import { AdminRoute, UserRoute } from './components/PrivateRoute';
import CreateProduct from './components/dashboard/Product/CreateProduct';
import Product from './pages/Product';
import CategoryDashboard from './components/dashboard/Category/CategoryDashboard';
import UpdateProduct from './components/dashboard/Product/UpdateProduct';
import UpdateVariation from './components/dashboard/Variation/UpdateVariation';
import CreateVariation from './components/dashboard/Variation/CreateVariation';
import VariationDashboard from './components/dashboard/Variation/VariationDashboard';
import CreateCategory from './components/dashboard/Category/CreateCategory';
import UpdateCategory from './components/dashboard/Category/UpdateCategory';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateDiscount from './components/dashboard/Discount/CreateDiscount';
import DiscountDashboard from './components/dashboard/Discount/DiscountDashboard';
import UpdateDiscount from './components/dashboard/Discount/UpdateDiscount';
import AddToVariationDashboard from './components/dashboard/Discount/AddToVariationDashboard';
import AddToVariation from './components/dashboard/Discount/AddToVariation';
import CategoryPage from './components/CategoryPage';
import Orderdashboard from './components/dashboard/Order/Orderdashboard';
import DiscountProduct from './components/DiscountProduct';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Search from './pages/Search';
import Revenue from './components/dashboard/Revenue/Revenue';
import OrderDetail from './components/dashboard/Order/OrderDetail';
import OrderDetailUS from './pages/OrderDetailUS';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/product/discount" element={<DiscountProduct />} />

        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/payment-success/:paymentId"
          element={<PaymentSuccess />}
        />
        <Route path="/search" element={<Search />} />
        <Route element={<UserRoute />}>
          <Route path="/profile/order" element={<Order />} />
          <Route path="/profile/order/:id" element={<OrderDetailUS />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route
            path="/admin/dashboard/product"
            element={<ProductDashboard />}
          />
          <Route path="/admin/dashboard/order" element={<Orderdashboard />} />
          <Route
            path="/admin/dashboard/order/orderdetail/:id"
            element={<OrderDetail />}
          />

          <Route
            path="/admin/dashboard/product/add"
            element={<CreateProduct />}
          />
          <Route
            path="/admin/dashboard/product/update/:id"
            element={<UpdateProduct />}
          />
          <Route
            path="/admin/dashboard/category"
            element={<CategoryDashboard />}
          />
          <Route
            path="/admin/dashboard/category/add"
            element={<CreateCategory />}
          />
          <Route
            path="/admin/dashboard/category/update/:id"
            element={<UpdateCategory />}
          />
          <Route
            path="/admin/dashboard/variation/"
            element={<VariationDashboard />}
          />
          <Route
            path="/admin/dashboard/variation/add"
            element={<CreateVariation />}
          />
          <Route
            path="/admin/dashboard/variation/update/:id"
            element={<UpdateVariation />}
          />
          <Route
            path="/admin/dashboard/discount"
            element={<DiscountDashboard />}
          />
          <Route
            path="/admin/dashboard/discount/add"
            element={<CreateDiscount />}
          />
          <Route
            path="/admin/dashboard/discount/update/:id"
            element={<UpdateDiscount />}
          />
          <Route
            path="/admin/dashboard/discount/variation"
            element={<AddToVariationDashboard />}
          />
          <Route
            path="/admin/dashboard/discount/variation/add"
            element={<AddToVariation />}
          />
          <Route path="/admin/dashboard/revenue" element={<Revenue />} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
