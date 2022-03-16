import React from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { AuthProvider } from "../contexts/AuthContext";

const AuthDefault = ({ children }) => (
  <>
    <Header navPosition="right" className="reveal-from-bottom" />
    <AuthProvider>
      <main className="site-content">{children}</main>
    </AuthProvider>
    <Footer />
  </>
);

export default AuthDefault;  