import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppContext";
import CircularProgress from '@mui/material/CircularProgress';
import WarningIcon from "@mui/icons-material/Warning";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  TablePagination,
} from "@mui/material";
import "./PlatformPage.css";
import JobDetails from "../JobDetails/JobDetails";
import { useTranslation } from 'react-i18next';


const PlatformPage = () => {
  const { platform, region, searchTerm, dbHelper, theme, etudeLevel} = useContext(AppContext);
  const [data, setData] = useState(null);  // Initialiser data à null
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const { t } = useTranslation();

  // États pour gérer la responsivité
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const baseUrl = window._env_?.VITE_APP_BASE_URL || import.meta.env.VITE_APP_BASE_URL;
  
  
  /**
   * Fetches platform data either from the cache or by making an API call to the backend.
   * If the data is already available in the cache, it returns the cached data.
   * If not, it fetches the data from the backend, caches it, and then returns it.
   *
   * @param {string} platformToFetch - The platform name or identifier for which data is being fetched.
   * @returns {Array} - The data associated with the specified platform. An empty array is returned if there is an error or no data is found.
   *
   * @throws {Error} - Throws an error if there is an issue with fetching or saving data.
   */
  const fetchDataWithCache = async (platformToFetch) => {
    try {
      const cachedData = await dbHelper.getPlatformData(platformToFetch);
      if (cachedData) {
        return cachedData;
      }
  
      console.log("Fetching data from the backend");
      const response = await fetch(`${baseUrl}/retrieval/file-with-summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: platformToFetch,
          region: 'france',
        })
      });
  
      const result = await response.json();
      const datas = result.content || [];
      await dbHelper.savePlatformData(platformToFetch, datas);
      return datas; 
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };
  
  /**
   * Filters the given data to return only the items that match the specified region and education level.
   * The comparison is case-insensitive to ensure consistency in filtering.
   *
   * @param {Array} data - The array of data objects to be filtered. Each object should contain a 'Region' and 'Level' property.
   * @param {string} normalizedRegion - The region to filter by. The comparison will be case-insensitive.
   * @returns {Array} - A filtered array of data objects that match the specified region and education level.
   *
   * This function first filters the data by region, and then further filters the results based on the provided education level ('etudeLevel').
   * The levels for each education stage are pre-defined in the 'levels' object, where higher education levels include all lower levels.
   */
  const filterDataByRegionAndLevel = (data, normalizedRegion) => {
    const levels = {
      "Bac+2": ["Bac+2", "No level Required"],
      "Bac+3": ["Bac+3", "Bac+2", "No level Required"],
      "Bac+4": ["Bac+4", "Bac+3", "Bac+2", "No level Required"],
      "Master": ["Master", "Bac+4", "Bac+3", "Bac+2", "No level Required"],
    };

    const filteredByRegion = data.filter(
      (item) => item.Region.toLowerCase() === normalizedRegion.toLowerCase()
    );

    const filteredByLevel = filteredByRegion.filter(
      (item) => levels[etudeLevel].includes(item.Level)
    );

    return filteredByLevel
  };


  /**
 * Loads data asynchronously when the component mounts or when `platform` or `region` changes.
 * The data is fetched from the backend (or from cache if available), filtered by region, 
 * and then set to the component's state. While the data is loading, a loading state is displayed.
 * If an error occurs during the data fetching process, the component's data state is cleared.
 * Once the data is successfully fetched and filtered, it updates the component's state and makes the table visible.
 *
 * This effect depends on the `platform`, `dbHelper`, and `region` variables. 
 * The `loadData` function is triggered whenever any of these dependencies change.
 * 
 * @returns {void}
 */

  useEffect(() => {
    const loadData = async () => {
      if (!dbHelper) {
        console.error("dbHelper n'est pas encore initialisé.");
        return;
      }
      
      setLoading(true);
      try {
        const normalizedPlatform = normalizeString(platform);
        const normalizedRegion = normalizeString(region);
        
        const datas = await fetchDataWithCache(normalizedPlatform);
        const filteredDatas = filterDataByRegionAndLevel(datas, normalizedRegion); 
        setData(filteredDatas); 
        setSelectedJob(null);
        setIsTableVisible(true);
      } catch (error) {
        console.error("Erreur de récupération des données:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [platform, region, dbHelper, etudeLevel]); 
  
  
  
  
  const normalizeString = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/-/g, "_");
  };

  // Gestion de la responsivité
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
      if (window.innerWidth > 900) {
        setIsTableVisible(true); // Afficher le tableau sur les grands écrans
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Modification ici pour s'assurer que filteredData est toujours un tableau
  const filteredData = data
    ? searchTerm
      ? data.filter(
          (job) =>
            job.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.Company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.Location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.Level.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job["Publication Date"]
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      : data
    : [];

  const handleRowClick = (job) => {
    setSelectedJob(job);
    if (isMobile) {
      setIsTableVisible(false); // Masquer le tableau sur mobile
    }
  };

  const handleBackToTable = () => {
    setIsTableVisible(true);
    setSelectedJob(null);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  return (
    <Box
      display="flex"
      className={`split-view-container ${theme === "dark" ? "dark-mode" : ""}`}
      padding="20px"
      width="100%"
    >
      {loading || data === null ? (
        <div className="spinner-container">
          <CircularProgress sx={{ color: theme === "dark" ? "#e0e0e0" : "#171C3F" }} />
        </div>
      ) : data.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
          className={`Warning ${theme === "dark" ? "dark-mode" : ""}`}
          sx={{
            backgroundColor: theme === "dark" ? "rgba(255, 255, 0, 0.1)" : "#fff3cd",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <WarningIcon sx={{ color: "#856404", fontSize: 50 }} />
          <Typography variant="h6" sx={{ color: "#856404", fontWeight: "bold", mt: 2 }}>
            {t("warning_!Data")}
          </Typography>
        </Box>
      ) : filteredData.length === 0 ? (
        // Afficher le message lorsque filteredData est vide
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
          className={`Warning ${theme === "dark" ? "dark-mode" : ""}`}
          sx={{
            backgroundColor: theme === "dark" ? "rgba(255, 255, 0, 0.1)" : "#fff3cd",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <WarningIcon sx={{ color: "#856404", fontSize: 50 }} />
          <Typography variant="h6" sx={{ color: "#856404", fontWeight: "bold", mt: 2 }}>
            {t("warning_!Data")}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} className={`table-container ${!isTableVisible ? "hide" : ""} ${
          theme === "dark" ? "dark-mode" : ""
        }`} sx={{ width: "100%" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("title_company")}</TableCell>
                <TableCell>{t("title_title")}</TableCell>
                <TableCell>{t("title_location")}</TableCell>
                <TableCell>{t("title_date")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((job, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleRowClick(job)}
                  hover
                  style={{ cursor: "pointer" }}
                >
                  <TableCell className="elmTab" data-label={t("title_company")}>{job.Company}</TableCell>
                  <TableCell className="elmTab" data-label={t("title_title")}>{job.Title}</TableCell>
                  <TableCell className="elmTab" data-label={t("title_location")}>{job.Location}</TableCell>
                  <TableCell className="elmTab" data-label={t("title_date")}>{job["Publication Date"]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            labelRowsPerPage={null}
            showFirstButton={false}
            showLastButton={false}
            nextIconButtonProps={{
              "aria-label": "Next Page",
              sx: { color: theme === "dark" ? "#e0e0e0" : "#171C3F", fontWeight: "bold" },
            }}
            backIconButtonProps={{
              "aria-label": "Previous Page",
              sx: { color: theme === "dark" ? "#e0e0e0" : "#171C3F", fontWeight: "bold" },
            }}
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 1,
              color: "#171C3F",
              fontWeight: "bolder",
              "& .MuiTablePagination-displayedRows": {
                color: "red",
                fontWeight: "bold",
              },
            }}
          />
        </TableContainer>
      )}
      {selectedJob && (
        <Box
          className={`details-container ${isMobile && !isTableVisible ? "active" : ""}`}
          sx={{
            width: isMobile ? "90%" : "60%",
            marginLeft: isMobile ? 0 : "20px",
          }}
        >
          {!isMobile && (
            <button className="close-button" onClick={() => setSelectedJob(null)}>
              &times;
            </button>
          )}
          {isMobile && (
            <button className="back-button" onClick={handleBackToTable}>
              &lt;
            </button>
          )}
          <Box component="header">
            <Typography variant="h6">{t("title_MD")}</Typography>
          </Box>
          <JobDetails selectedJob={selectedJob} />
          <Box mt={2} className="center-container">
            <Button
              className="view-job-btn"
              onClick={() => window.open(selectedJob.Url, "_blank")}
            >
              {t("title_VA")}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PlatformPage;
