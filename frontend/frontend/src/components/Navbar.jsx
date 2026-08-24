import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PlusCircle } from "lucide-react";
import { LiaCartArrowDownSolid } from "react-icons/lia";
import axios from "axios";
import logo from '../assets/logo.svg'
import {
  MapPin,
  Search,
  ShoppingBag,
  ChevronDown,
  User,
  LogOut,
  Package,
  Menu,
  X,
} from "lucide-react";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData ,cartItems} = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef(null);
  const {currCity}=useSelector(state=>state.user)

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = userData?.fullName
    ? userData.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = async() => {
    if(!searchValue.trim()){
      dispatch(setSearchItems(null))
       return;
    }
    try {
      const result=await axios.get(`${serverUrl}/item/searchitems?query=${searchValue.trim()}&city=${currCity}`,{withCredentials:true})
      console.log(result.data.data)
      dispatch(setSearchItems(result.data.data))
    } catch (error) {
      console.log(error?.message)
    }
  };
  const handleSearchSubmit=(e)=>{
    e.preventDefault();
    handleSearch();
  }
useEffect(() => {
    const timeout = setTimeout(() => {
        handleSearch()
    }, 350)
    return () => clearTimeout(timeout)
}, [searchValue, currCity])

  return (
    <header className="sticky top-0 z-2000 bg-white/95 backdrop-blur-sm border-b border-orange-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left side */}
          <div className="flex justify-center items-center gap-5">
            {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo}/>
            <span className="font-extrabold text-xl text-gray-800 tracking-tight">
              Hunger<span className="text-orange-500">Hop</span>
            </span>
          </Link>

          {/* Location — desktop */}
          <button className="hidden lg:flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 transition shrink-0">
            <MapPin size={16} className="text-orange-500" />
            <span className="font-medium">{currCity}</span>
            <ChevronDown size={14} />
          </button>

          {/* Search — desktop */}
          {userData?.role=="customer"&&
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 min-w-sm max-w-md relative border border-orange-100 rounded-full"
          >
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search restaurants or dishes"
              className="w-full pl-10 pr-4 py-2 bg-orange-50/70 border border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white transition"
            />
          </form>}
          </div>


          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Cart */}
            {userData?.role=="customer"&&<Link
              to="/cart"
              className="relative flex items-center gap-1.5 text-gray-700 hover:text-orange-500 transition p-2"
            >
              <ShoppingBag size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>}
            {userData?.role=="restaurant"&&<>
            {myShopData&&<Link
              to="/add-item"
              className="relative flex items-center gap-1.5 text-gray-700 hover:text-orange-500 transition p-2 bg-orange-400/10 rounded-full"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium">Add Item</span>
            </Link>}
            <Link
              to="/orders"
              className="relative flex items-center gap-1.5 text-gray-700 hover:text-orange-500 transition p-2"
            >
              <LiaCartArrowDownSolid size={32} />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link></>}

            {/* Profile / Auth */}
            {userData ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-orange-50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`hidden sm:block text-gray-500 transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {userData.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition"
                    >
                      <User size={16} /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition"
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-orange-500 transition px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2 transition"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            {userData?.role=="customer"&&<button
              onClick={() => setMobileOpen((m) => !m)}
              className="md:hidden text-gray-700 p-1"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>}
          </div>
        </div>

        {/* Mobile search + menu */}
        {mobileOpen &&userData?.role=="customer"&& (
          <div className="md:hidden pb-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search restaurants or dishes"
                className="w-full pl-10 pr-4 py-2.5 bg-orange-50/70 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </form>

            <button className="flex items-center gap-1.5 text-sm text-gray-600 px-1">
              <MapPin size={16} className="text-orange-500" />
              <span className="font-medium">{currCity}</span>
              <ChevronDown size={14} />
            </button>

            {!userData && (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-sm font-medium border border-orange-300 text-orange-600 rounded-full py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-sm font-medium bg-orange-500 text-white rounded-full py-2"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;