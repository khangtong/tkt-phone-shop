// import { useState } from "react";
import Header from './components/Header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Footer from './components/Footer';
UpdateProduct;
import Order from './pages/Order';
import Profile from './pages/Profile';
import ProductDashboard from './components/dashboard/Product/ProductDashboard';

import { AdminRoute } from './components/PrivateRoute';
import CreateProduct from './components/dashboard/Product/CreateProduct';
import Product from './pages/Product';
import CategoryDashboard from './components/dashboard/Category/CategoryDashboard';
import UpdateProduct from './components/dashboard/Product/UpdateProduct';
import UpdateVariation from './components/dashboard/Variation/UpdateVariation';
import CreateVariation from './components/dashboard/Variation/CreateVariation';
import VariationDashboard from './components/dashboard/Variation/VariationDashboard';
import CreateCategory from './components/dashboard/Category/CreateCategory';
import UpdateCategory from './components/dashboard/Category/UpdateCategory';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/order" element={<Order />} />
        <Route element={<AdminRoute />}>
          <Route
            path="/admin/dashboard/product"
            element={<ProductDashboard />}
          />
          <Route path="/admin/dashboard/product/:id" element={<Product />} />
          <Route
            path="/admin/dashboard/category"
            element={<CategoryDashboard />}
          />
          <Route
            path="/admin/dashboard/category/add"
            element={<CreateCategory />}
          />
          <Route
            path="/admin/dashboard/product/add"
            element={<CreateProduct />}
          />
        </Route>
        <Route
          path="/admin/dashboard/product/update/:id"
          element={<UpdateProduct />}
        ></Route>
        <Route
          path="/admin/dashboard/category/update/:id"
          element={<UpdateCategory />}
        ></Route>
        <Route
          path="/admin/dashboard/variation/"
          element={<VariationDashboard />}
        ></Route>
        <Route
          path="/admin/dashboard/variation/add"
          element={<CreateVariation />}
        ></Route>
        <Route
          path="/admin/dashboard/variation/update/:id"
          element={<UpdateVariation />}
        ></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
