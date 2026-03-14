/* eslint-disable react/prop-types */
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ContactSidebar from "../components/ContactSidebar";

const MainLayout = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
      <Footer />
      <ContactSidebar/>
      <ScrollToTopButton />
    </div>
  );
};

export default MainLayout;
