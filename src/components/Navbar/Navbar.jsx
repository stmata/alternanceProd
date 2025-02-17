import { useState, useEffect, useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faMapMarkerAlt,
  faSignOutAlt,
  faSearch,
  faGraduationCap,
  faLightbulb,
  faCog,
  faPalette,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import logo_dark from "../../assets/logo_dark.png"
import { AppContext } from "../../AppContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { t } = useTranslation();
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const burgerMenuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    email,
    region,
    setRegion,
    searchTerm,
    setSearchTerm,
    firstVisitRegion,
    setFirstVisitRegion,
    isFirstVisitSmartMatching,
    setIsFirstVisitSmartMatching,
    theme, 
    setTheme,
    etudeLevel,
    setEtudeLevel,
    dbHelper,
    resetStates
  } = useContext(AppContext);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    sessionStorage.setItem("theme", newTheme);
    document.body.classList.toggle("dark-mode", newTheme === "dark");
  };
  
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(null);
  const levelButtonRef = useRef(null);
  const menuRef = useRef(null);
  const initialsRef = useRef(null); // Ref for initials circle
  const initialsDropdownRef = useRef(null); // Ref for dropdown menu

  // Correction : Création des refs pour les menus déroulants
  const locationDropdownRef = useRef(null);
  const levelDropdownRef = useRef(null);

  const getInitials = () => {
      const parts = email.split('@');
      const usernamePart = parts[0];
    
      if (usernamePart.includes('.')) {
          const initials = usernamePart.split('.').map(part => part[0]).join('');
          return initials.toUpperCase();
      } else {
          return usernamePart.slice(0, 2).toUpperCase();
      }
  };

  const handleLogout =async() => {
    // Reset all context and session storage
    resetStates();

    try {
      await dbHelper.clearAllData();  
    } catch (error) {
      //console.error("Erreur lors de la déconnexion avec dbHelper:", error);
    }
    navigate("/");
  };
 

  const handleRegionSelect = (region) => {
    setRegion(region);
    setLocationDropdownOpen(false);
    setFirstVisitRegion(false);
  };

  const handleLevelSelect = (level) => {
    setEtudeLevel(level);
    setLevelDropdownOpen(false);
    setIsFirstVisitSmartMatching(false);
  };

  const toggleLevelDropdown = () => {
    setLevelDropdownOpen((prev) => !prev);
    setLocationDropdownOpen(false);
  };


  const toggleLocationDropdown = () => {
    setLocationDropdownOpen((prev) => !prev);
    setLevelDropdownOpen(false);
  };

  const handleMouseLeaveDropdown = () => {
    setLocationDropdownOpen(false);
    setLevelDropdownOpen(false);
  };
  
  const [initialsDropdownOpen, setInitialsDropdownOpen] = useState(false);

  const toggleInitialsDropdown = () => {
    setInitialsDropdownOpen((prev) => !prev);
  };

  const handleMouseLeaveInitialsDropdown = () => {
    setInitialsDropdownOpen(false);
  };

    const levelDisplay = {
      "Bac+4": "BBA",
      "Master": "Master",
      "Bac+3": "Bac+3"
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    
    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
    
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getRegionDisplay = (region) => {
      const baseDisplay = {
        "ile_de_france": "Île-de-France",
        "hauts_de_france": "Hauts-de-France",
        "alpes_cote_dazur": location.pathname === "/PlatformPage" && windowWidth >= 1005 && windowWidth <= 1060 
          ? "Alpes-Côte d'Azur"
          : "Provence-Alpes-Côte d'Azur",
        "Others": t("others_region")
      };
    
      return baseDisplay[region] || region;
    };
    
    const regionDisplay = {
      "ile_de_france": "Île-de-France",
      "hauts_de_france": "Hauts-de-France",
      "alpes_cote_dazur": "Provence-Alpes-Côte d'Azur",
      "Others": t("others_region")
    };
    

  // Correction : Ajout d'un useEffect pour gérer les clics en dehors des menus déroulants
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {

      if (
        levelDropdownOpen &&
        levelDropdownRef.current &&
        !levelDropdownRef.current.contains(event.target) &&
        !levelButtonRef.current.contains(event.target)
      ) {
        setLevelDropdownOpen(false);
      }

      if (
        locationDropdownOpen &&
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target) &&
        !locationRef.current.contains(event.target)
      ) {
        setLocationDropdownOpen(false);
      }

      if (
        initialsDropdownOpen &&
        initialsDropdownRef.current &&
        !initialsDropdownRef.current.contains(event.target) &&
        !initialsRef.current.contains(event.target)
      ) {
        setInitialsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, [ locationDropdownOpen, initialsDropdownOpen, levelDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        burgerMenuRef.current &&
        !menuRef.current.contains(event.target) &&
        !burgerMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
    <div 
  ref={burgerMenuRef} // Attach the ref here
  className={`burger-menu ${isMenuOpen ? "active" : ""}`} 
  onClick={(e) => { 
    e.stopPropagation(); // Prevent the event from bubbling up
    toggleMenu(); 
  }}
></div>
    <div 
  ref={burgerMenuRef}
  className={`burger-menu ${isMenuOpen ? "active" : ""}`} 
  onClick={toggleMenu}
>
  <div 
    className={`burger-bar top ${isMenuOpen ? "transform" : ""}`} 
    style={{ backgroundColor: theme === "dark" ? "#ffffff" : "#171C3F" }} 
  />
  <div 
    className={`burger-bar middle ${isMenuOpen ? "hide" : ""}`} 
    style={{ backgroundColor: theme === "dark" ? "#ffffff" : "#171C3F" }}
  />
  <div 
    className={`burger-bar bottom ${isMenuOpen ? "transform" : ""}`} 
    style={{ backgroundColor: theme === "dark" ? "#ffffff" : "#171C3F" }}
  />
</div>

    {/* Menu qui s'ouvre et se ferme */}
    <nav className={`navbar ${isMenuOpen ? "active" : ""} ${theme === "dark" ? "dark-mode" : ""}`} ref={menuRef}>

        <div className="logo">
          <Link to="/">
          <img src={theme === "dark" ? logo_dark : logo} alt="Logo" />
          </Link>
        </div>

        {location.pathname !== "/historyRslts" && (
          <>
            <div
              ref={locationRef}
              className={`dropdownRegion ${
                locationDropdownOpen ? "active" : ""
              }`}
              onClick={toggleLocationDropdown}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} color = {theme === "dark" ? "#ffffff" : "#171C3F"} />
              <span>{firstVisitRegion ? t("title_region") :  (getRegionDisplay(region) || region)}</span>
              {locationDropdownOpen && (
                <ul
                  className="dropdown-menu regions"
                  onMouseLeave={handleMouseLeaveDropdown}
                  // Correction : Attachement du ref au menu déroulant
                  ref={locationDropdownRef}
                >
                  <li
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRegionSelect("ile_de_france")}
                  >
                    Île-de-France
                  </li>
                  <li
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRegionSelect("hauts_de_france")}
                  >
                    Hauts-de-France
                  </li>
                  <li
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRegionSelect("alpes_cote_dazur")}
                  >
                    Provence-Alpes-Côte d'Azur
                  </li>
                  <li
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRegionSelect("Others")}
                  >
                    { t("others_region") }
                  </li>
                </ul>
              )}
            </div>

            {(location.pathname === "/SmartMatching" || location.pathname === "/PlatformPage" || location.pathname === "/rslts00") && (
              <>
                <div
                  ref={levelButtonRef}
                  className={`dropdownPlatform ${levelDropdownOpen ? "active" : ""}`}
                  onClick={toggleLevelDropdown}
                >
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    color = {theme === "dark" ? "#ffffff" : "#171C3F"}
                  />
                  <span>{isFirstVisitSmartMatching ? t("title_level") : (levelDisplay[etudeLevel] || etudeLevel)}</span>
                  {levelDropdownOpen && (
                    <ul
                      className="dropdown-menu niveau"
                      onMouseLeave={handleMouseLeaveDropdown}
                      ref={levelDropdownRef}
                    >
                      <li
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleLevelSelect("Bac+3")}
                      >
                        Bac+3
                      </li>
                      <li
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleLevelSelect("Bac+4")}
                      >
                        BBA
                      </li>
                      <li
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleLevelSelect("Master")}
                      >
                        Master
                      </li>
                    </ul>
                  )}
                </div>
              </>
            )}

            {location.pathname === "/PlatformPage" && (
              <div className="job-input">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="input-icon"
                  color = {theme === "dark" ? "#ffffff" : "#171C3F"}
                />
                <input
                  type="text"
                  placeholder={t("input_search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            {(location.pathname === "/PlatformPage" ||
              location.pathname === "/ListOfLikes") && (
              <Link to="/ListOfLikes" className="dropdownRegion">
                <FontAwesomeIcon
                  icon={faHeart}
                  className="heart-icon"
                  color = {theme === "dark" ? "#ffffff" : "#171C3F"}
                />
                <span>{t("title_favoris")}</span>
              </Link>
            )}

            <div className="smart-matching">
              <button
                className="smart-btn"
                onClick={() => {
                  if (location.pathname === "/PlatformPage") {
                    navigate("/SmartMatching");
                  } else if (location.pathname === "/ListOfLikes") {
                    navigate("/PlatformPage");
                  } else {
                    navigate("/PlatformPage");
                  }
                }}
              >
                <FontAwesomeIcon
                  icon={
                    location.pathname === "/PlatformPage" ? faLightbulb : faCog
                  }
                  className="lightbulb-icon"
                  color = {theme === "dark" ? "#ffffff" : "#171C3F"}
                />
                <span className="matching-text">
                  {location.pathname === "/PlatformPage"
                    ? t("btn_SM")
                    : location.pathname === "/ListOfLikes"
                    ? t("btn_MM")
                    : t("btn_MM")}
                </span>
              </button>
            </div>
          </>
        )}


        {location.pathname === "/historyRslts" && (
          <>
            <div className="smart-matching">
              <button
                className="smart-btn"
                onClick={() => navigate("/SmartMatching")}
              >
                <FontAwesomeIcon
                  icon={faLightbulb}
                  className="lightbulb-icon"
                  color = {theme === "dark" ? "#ffffff" : "#171C3F"}
                />
                <span className="matching-text">{t("btn_SM")}</span>
              </button>
            </div>

            <div className="smart-matching">
              <button
                className="smart-btn"
                onClick={() => navigate("/PlatformPage")}
              >
                <FontAwesomeIcon
                  icon={faCog}
                  className="lightbulb-icon"
                  color = {theme === "dark" ? "#ffffff" : "#171C3F"}
                />
                <span className="matching-text">{t("btn_MM")}</span>
              </button>
            </div>
          </>
        )}

        {/* Initials Dropdown */}
        <div className="dropdownInitials">
          <div
            ref={initialsRef}
            className="initials-circle"
            onClick={toggleInitialsDropdown}
          >
            {getInitials()}
          </div>

          {initialsDropdownOpen && (
            <ul
              className="dropdown-menu"
              ref={initialsDropdownRef}
              onMouseLeave={handleMouseLeaveInitialsDropdown}
            >
              <li
                className="dropdown-itemm"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() => {
                  handleThemeToggle();
                }}
                
              >
                {t("theme")} <FontAwesomeIcon icon={faPalette} />
              </li> 
              <li
                className="dropdown-itemm"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={handleLogout}
              >
                {t("logout")} <FontAwesomeIcon icon={faSignOutAlt} />
              </li>
            </ul>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
