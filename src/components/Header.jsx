import logo from "/pet.png";
import { useState, useEffect, useRef } from "react";
import "./component.scss";
import { FaCaretDown, FaPhone } from "react-icons/fa6";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaShoppingBag,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoMdMenu, IoIosClose } from "react-icons/io";
import { RiMenu3Fill, RiAdminFill } from "react-icons/ri";
import { MdDashboardCustomize } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import PopupMenu from "./PopupMenu";
import HoverPopupMenu from "./HoverPopupMenu";
import LoadingOverlay from "./LoadingOverlay";
import { useSelector } from "react-redux";
import DialogCart from "./DialogCart";
import axiosInstance from "../utils/axiosInstance";
import PopupSearch from "./PopupSearch";
import axios from "axios";
import CartButton from "./CartButton";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const Header = () => {
  const { fetchCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState({
    name: "",
    avatar: "",
    role: "",
    id: "",
  });
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopupSearch, setShowPopupSearch] = useState(false);
  const searchRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); 

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const convertBase64ToImage = (base64) => {
    if (!base64) return "/avatar.png";
    return `data:image/jpeg;base64,${base64}`;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosInstance.get("/api/categories");
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        try {
          const { data } = await axiosInstance.get(`/api/users/${user._id}`);
          const userData = data;

          userData.avatar = convertBase64ToImage(userData.avatar);
          setUser({
            name: userData.fullName,
            avatar: userData.avatar,
            role: userData.role,
            id: userData._id,
          });

          if (userData.role === "admin") {
            setIsAdmin(true);
          }

          setLoggedIn(true);
        } catch (err) {
          console.error("API Error:", err.response?.data || err.message);
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchCart(user.id);
    }
  }, [user?.id, fetchCart]);

  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await axiosInstance.get(
        `/api/products/search?q=${query}`
      );
      setSearchResults(response.data);
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchSearchResults(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse search history:", error);
        localStorage.removeItem("searchHistory");
      }
    }
  }, []);

  const saveToHistory = (term) => {
    if (!term.trim()) return;

    const newHistory = [
      term,
      ...searchHistory.filter((item) => item !== term),
    ].slice(0, 5);

    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    localStorage.removeItem("searchHistory");
    setSearchHistory([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        !event.target.closest(".popup-search-container")
      ) {
        setShowPopupSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData._id) {
        await axiosInstance.post("/api/users/logout", { userId: userData._id });
      }

      localStorage.removeItem("user");
      setUser({ name: "", avatar: "", role: "", id: "" });
      setLoggedIn(false);
      setIsAdmin(false);

      setTimeout(() => {
        toast.success("Đăng xuất thành công!"); 
        navigate("/");
        setIsLoggingOut(false);
      }, 700);
    } catch (err) {
      console.error("Logout Error:", err.response?.data || err.message);
      toast.error("Đăng xuất thất bại. Vui lòng thử lại!");
      setIsLoggingOut(false);
    }
  };

  const handleSearch = (term) => {
    if (!term.trim()) return;

    saveToHistory(term);
    setSearchTerm(term);
    setShowPopupSearch(false);
    navigate(`/search?q=${term}`);
  };

  const handleSearchResultClick = (result) => {
    if (!result) return;

    if (result.name) {
      saveToHistory(result.name);
      setSearchTerm(result.name);
    }

    if (
      result.price !== undefined ||
      (result.images && result.images.length > 0)
    ) {
      navigate(`/product/${result.slug}`);
    } else if (result.category_id && result.category_id.slug) {
      navigate(`/categories/${result.category_id.slug}`);
    } else if (result.slug) {
      navigate(`/categories/${result.slug}`);
    }

    setShowPopupSearch(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      handleSearch(searchTerm);
    }
  };

  const handleHistoryItemClick = (term) => {
    setSearchTerm(term);
    fetchSearchResults(term);
  };

  const menuOptionsCategories = categories.map((category) => ({
    label: category.name,
    href: `/categories/${category.slug}`,
  }));

  const menuOptionsCategoriesCat = categories
    .filter((category) => category.type === "SHOP CHO MÈO")
    .map((category) => ({
      label: category.name,
      href: `/categories/${category.slug}`,
    }));

  const menuOptionsCategoriesDog = categories
    .filter((category) => category.type === "SHOP CHO CÚN")
    .map((category) => ({
      label: category.name,
      href: `/categories/${category.slug}`,
    }));

  const menuOptionsUser = [
    {
      label: "Tài khoản của bạn",
      icon: <FaUser className="mr-2" />,
      href: `/userProfile/`,
    },
    {
      label: "Đăng xuất",
      icon: <FaSignOutAlt className="mr-2" />,
      onClick: handleLogout,
    },
  ];

  const menuOptionsAdmin = [
    {
      label: "Tài khoản của bạn",
      icon: <FaUser className="mr-2" />,
      href: `/userProfile/`,
    },
    {
      label: "Thống kê",
      icon: <MdDashboardCustomize className="mr-2" />,
      href: `/dashboard/`,
    },

    {
      label: "Quản lý người dùng",
      icon: <RiAdminFill className="mr-2" />,
      href: `/user-management`,
    },
    {
      label: "Đăng xuất",
      icon: <FaSignOutAlt className="mr-2" />,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      className={`bg-white shadow-md sticky top-0 z-25 transition-all duration-300 ${
        isScrolled ? "h-[60px] overflow-hidden" : "h-auto"
      }`}
      ref={headerRef}
    >
      <LoadingOverlay isVisible={isLoggingOut} />
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? "-translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-evenly py-2 px-4 md:px-8 lg:px-16">
          {/* logo */}
          <div className="flex items-center space-x-3">
            <Link to="/">
              <img
                src={logo}
                alt="Logo Pet Shop"
                className="h-17 w-17 object-cover"
              />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                PET STATION SHOP
              </h1>
              <p className="text-sm text-brown mx-4">The happy store for pet</p>
            </div>
          </div>

          {/* mobile menu button & cart */}
          <div className="flex items-center space-x-4 md:hidden ml-auto">
            <CartButton idUser={user.id} />
            <button
              className="md:hidden text-gray-700 focus:outline-none ml-auto cursor-pointer relative"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <RiMenu3Fill className="text-2xl" />
            </button>
          </div>

          {/* search bar & links */}
          {!isMobile && (
            <>
              <div
                className="flex items-center w-full max-w-md lg:max-w-lg relative"
                ref={searchRef}
                style={{ position: "relative" }}
              >
                <input
                  type="text"
                  placeholder="Nhập từ khóa tìm kiếm"
                  className="w-full px-4 py-2 border-brown rounded-l-full focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => setShowPopupSearch(true)}
                />
                <Link to="/search" className="">
                  <button
                    className="bg-brown px-4 py-2 text-white rounded-full focus:outline-none w-14 h-13 relative -left-4 flex items-center justify-center cursor-pointer"
                    onClick={() => handleSearch(searchTerm)}
                  >
                    <FaSearch className="text-lg" />
                  </button>
                </Link>
              </div>

              {/* user */}
              <div className="flex items-center space-x-4 cursor-pointer">
                {loggedIn ? (
                  isAdmin ? (
                    <PopupMenu
                      trigger={
                        <div className="flex items-center space-x-2 cursor-pointer">
                          <img
                            src={user.avatar}
                            alt="User avatar"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span
                            className="text-gray-700 text-sm font-medium text-brown-hover"
                            style={{ fontSize: "1.1rem" }}
                          >
                            {user.name}
                          </span>
                        </div>
                      }
                      options={menuOptionsAdmin}
                      menuType="menuOptionsUser"
                    />
                  ) : (
                    <PopupMenu
                      trigger={
                        <div className="flex items-center space-x-2 cursor-pointer">
                          <img
                            src={user.avatar}
                            alt="User avatar"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span
                            className="text-gray-700 text-sm font-medium text-brown-hover"
                            style={{ fontSize: "1.1rem" }}
                          >
                            {user.name}
                          </span>
                        </div>
                      }
                      options={menuOptionsUser}
                      menuType="menuOptionsUser"
                    />
                  )
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="text-gray-700 text-sm text-brown-hover"
                    >
                      ĐĂNG KÝ
                    </Link>
                    <span className="text-brown mb-1">|</span>
                    <Link
                      to="/login"
                      className="text-gray-700 text-sm text-brown-hover"
                    >
                      ĐĂNG NHẬP
                    </Link>
                  </>
                )}
                <CartButton idUser={user.id} />
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className={`transition-all duration-300 ${
          isScrolled ? "fixed top-0 left-0 right-0 bg-white shadow-md" : ""
        }`}
      >
        {/* nav bar */}
        <nav className={`border-none ${isMobile ? "hidden" : ""}`}>
          <div className="container mx-auto flex flex-wrap items-center justify-evenly px-4 py-2 lg:px-16">
            <div className="relative group">
              <PopupMenu
                trigger={
                  <button className="flex items-center space-x-3 bg-brown w-65 h-12 text-white px-5 rounded-lg focus:outline-none cursor-pointer">
                    <IoMdMenu className="text-2xl" />
                    <span className="font-semibold text-2sm">
                      DANH MỤC SẢN PHẨM
                    </span>
                  </button>
                }
                options={menuOptionsCategories}
                menuType="menuOptionsCategories"
              />
            </div>

            <div className="hidden lg:flex space-x-8">
              <HoverPopupMenu
                trigger={
                  <a
                    href="#"
                    className="text-gray-700 flex items-center text-brown-hover"
                  >
                    SHOP CHO CÚN
                    <FaCaretDown className="ml-2 text-lg " />
                  </a>
                }
                options={menuOptionsCategoriesDog}
                menuType="menuOptionsDog"
              />

              <HoverPopupMenu
                trigger={
                  <a
                    href="#"
                    className="text-gray-700 flex items-center text-brown-hover"
                  >
                    SHOP CHO MÈO
                    <FaCaretDown className="ml-2 text-lg" />
                  </a>
                }
                options={menuOptionsCategoriesCat}
                menuType="menuOptionsCat"
              />
              <a href="/blogs/news" className="text-gray-700 text-brown-hover">
                TIN TỨC
              </a>
              <Link to="/contactus" className="text-gray-700 text-brown-hover">
                VỀ CHÚNG TÔI
              </Link>
            </div>

            <div className="flex items-center space-x-2 mt-4 lg:mt-0">
              <FaPhone className="text-lg text-brown" />
              <span className="font-medium">
                Hotline:
                <span className="text-red text-brown-hover cursor-pointer">
                  {" "}
                  0915020903
                </span>
              </span>
            </div>
          </div>
        </nav>
      </div>

      {showPopupSearch && (
        <PopupSearch
          searchResults={searchResults}
          searchHistory={searchHistory}
          onSearch={handleSearchResultClick}
          onHistoryItemClick={handleHistoryItemClick}
          onClearHistory={handleClearHistory}
        />
      )}

      {/* overlay */}
      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* mobile hidden menu */}
      <div className={`hidden-menu ${menuOpen ? "open" : ""}`}>
        <div className="flex justify-end mt-2">
          <button
            onClick={() => setMenuOpen(false)}
            className="text-gray-700 text-xl focus:outline-none cursor-pointer"
          >
            <IoIosClose className="text-4xl" />
          </button>
        </div>
        <ul>
          <li
            className="flex items-center w-full relative pb-4"
            ref={searchRef}
          >
            <div className="flex w-full relative">
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm"
                className="w-full px-4 py-2 border-brown rounded-l-full focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setShowPopupSearch(true)}
              />
              <button
                className="bg-brown px-4 py-2 text-white rounded-full focus:outline-none w-14 h-10 relative -left-4 flex items-center justify-center cursor-pointer"
                onClick={() => handleSearch(searchTerm)}
              >
                <FaSearch className="text-lg" />
              </button>
            </div>
            {showPopupSearch && (
              <PopupSearch
                searchResults={searchResults}
                searchHistory={searchHistory}
                onSearch={handleSearchResultClick}
                onHistoryItemClick={handleHistoryItemClick}
                onClearHistory={handleClearHistory}
              />
            )}
          </li>
          {loggedIn ? (
            <PopupMenu
              trigger={
                <div className="flex items-center space-x-2 cursor-pointer">
                  <img
                    src={user.avatar}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    className="text-gray-700 text-sm font-medium text-brown-hover"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {user.name}
                  </span>
                </div>
              }
              options={menuOptionsUser}
              menuType="menuOptionsUser"
            />
          ) : (
            <>
              <li className="py-3">
                <Link
                  to="/register"
                  className="block text-gray-700 text-sm text-brown-hover"
                >
                  ĐĂNG KÝ
                </Link>
              </li>
              <li className="py-3">
                <Link
                  to="/login"
                  className="block text-gray-700 text-sm text-brown-hover"
                >
                  ĐĂNG NHẬP
                </Link>
              </li>
            </>
          )}

          <li className="pt-5">
            <Link
              href="#"
              className="text-gray-700 flex items-center text-brown-hover"
            >
              SHOP CHO CÚN
              <FaCaretDown className="ml-2 text-lg" />
            </Link>
          </li>
          <li className="py-1">
            <Link
              href="#"
              className="text-gray-700 flex items-center text-brown-hover"
            >
              SHOP CHO MÈO
              <FaCaretDown className="ml-2 text-lg" />
            </Link>
          </li>
          <li className="py-1">
            <Link
              href="/blogs/news"
              className="block text-gray-700 text-sm text-brown-hover"
            >
              TIN TỨC
            </Link>
          </li>
          <li className="py-1">
            <Link
              href="/contactus"
              className="block text-gray-700 text-sm text-brown-hover"
            >
              VỀ CHÚNG TÔI
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
