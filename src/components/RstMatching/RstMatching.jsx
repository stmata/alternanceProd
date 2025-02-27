import { useState, useEffect, useContext } from "react";
import { Box, Typography, Button, TablePagination } from "@mui/material";
import {
  Star,
  StarHalf,
  StarBorder,
  // FavoriteBorder,
  // Favorite,
} from "@mui/icons-material";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./RstMatching.css";
import { AppContext } from "../../AppContext";
import CoverLetter from "../CoverLetter/CoverLetter";
import { useTranslation } from "react-i18next";
import JobDetails from "../JobDetails/JobDetails";

const RstMatching = () => {
  const { i18n } = useTranslation(); // ajout de i18n pour accéder à la langue
  const currentLanguage = i18n.language;
  const { platform, region, theme } =
    useContext(AppContext);
  const [prevPlatform, setPrevPlatform] = useState(
    sessionStorage.getItem("platform")
  );
  const [prevRegion, setPrevRegion] = useState(
    sessionStorage.getItem("region")
  );
  const [result, setResult] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const resultType = queryParams.get("type");
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [showMatchingSkills, setShowMatchingSkills] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const navigate = useNavigate(); // Use navigate to programmatically navigate
  const { t } = useTranslation();
  const { state } = location;
  const predictJobs = state?.predictJobs || [];

  // Handle window resize for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
      if (window.innerWidth > 900) {
        setIsTableVisible(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Load results when region or platform is available
  useEffect(() => {
    setIsLoading(true);
    let storedResults = null;
  
    if (region && platform) {
      if (resultType === "cv") {
        storedResults = sessionStorage.getItem("cvStoredResults");
      } else if (resultType === "prompt") {
        storedResults = sessionStorage.getItem("promptStoredResults");
      } else if (predictJobs.length > 0) {
        storedResults = predictJobs; // predictJobs est déjà un tableau d'objets, pas besoin de JSON.parse
      }
  
      if (typeof storedResults === "string") {
        try {
          setResult(JSON.parse(storedResults)); // Essayer de parser uniquement si c'est une chaîne JSON
        } catch (error) {
          //console.error("JSON parsing error:", error);
          setResult([]);
        }
      } else if (Array.isArray(storedResults)) {
        // Si storedResults est déjà un tableau, l'utiliser directement
        setResult(storedResults);
      } else {
        setResult([]);
      }
    }
    setIsLoading(false);
  }, [resultType, region, platform]);
  

  // Detect changes in platform or region
  useEffect(() => {
    if ((platform && platform !== prevPlatform) ||
        (region && region !== prevRegion)) {
      setPrevPlatform(platform);
      setPrevRegion(region);
      
      sessionStorage.setItem("platform", platform);
      sessionStorage.setItem("region", region);
      
      sessionStorage.removeItem("cvStoredResults");
      sessionStorage.removeItem("promptStoredResults");
      
      navigate("/SmartMatching");
    }
  }, [platform, region, prevPlatform, prevRegion, navigate]);

  const handleLetterCoverClick = (job) => {
    setSelectedCoverLetter(job);
    setSelectedJobDetails(null);
    if (isMobile) {
      setIsTableVisible(false);
    }
  };

  const handleJobDetailsClick = (job) => {
    setSelectedJobDetails(job);
    setSelectedCoverLetter(null);
    if (isMobile) {
      setIsTableVisible(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const renderStars = (similarityValue, index) => {
    const totalStars = 5;
    const starRating = similarityValue * totalStars;
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating - fullStars >= 0.5;
    const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <Box
        className="prefix-star-container"
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Conteneur des étoiles */}
        <Box
          sx={{ display: "flex", cursor: "pointer" }}
          onClick={() => handleToggleMatchingSkills(index)} // Clic sur les étoiles uniquement
        >
          {Array.from({ length: fullStars }, (_, i) => (
            <Star
              key={`full-${i}`}
              sx={{ color: "#FFD700", fontSize: "20px" }}
            />
          ))}
          {hasHalfStar && (
            <StarHalf sx={{ color: "#FFD700", fontSize: "20px" }} />
          )}
          {Array.from({ length: emptyStars }, (_, i) => (
            <StarBorder
              key={`empty-${i}`}
              sx={{ color: "#E0E0E0", fontSize: "20px" }}
            />
          ))}
        </Box>

        {/* Conteneur du cœur (Like) */}
        {/* <Box
          sx={{ cursor: "pointer" }} // Indique que le cœur est cliquable
          onClick={(e) => {
            e.stopPropagation(); // Empêche le clic de se propager aux étoiles
            handleLikeClick(job, index); // Clic uniquement sur le cœur
          }}
        >
          {likedRows[index] ? (
            <Favorite sx={{ color: "red", fontSize: "20px" }} />
          ) : (
            <FavoriteBorder sx={{ color: "#FFD700", fontSize: "20px" }} />
          )}
        </Box> */}
      </Box>
    );
  };

  const formatMissingSkills = (skills) => {
    return skills
      .split(/\n-\s+/) 
      .map(skill => skill.replace(/^- /, "").trim()) 
      .filter(skill => skill !== "");
  };
  

  const handleBackToTable = () => {
    setIsTableVisible(true);
    setSelectedCoverLetter(null);
    setSelectedJobDetails(null);
  };

  const handleToggleMatchingSkills = (index) => {
    setShowMatchingSkills((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const paginatedResults = result.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <Box
      sx={{ width: "100%", margin: "20px auto", padding: "20px" }}
      className="prefix-container3"
    >
      <Box className="prefix-divGlobal">
        <Typography
          variant="h4"
          style={{
            fontWeight: "bold",
            marginBottom: "15px",
            textAlign: "center",
          }}
          className="predict_title"
        >
          {t("predict_title")}:
        </Typography>

        {isLoading ? (
          <p>{t("title_LM")}</p>
        ) : paginatedResults.length > 0 ? (
          <Box display="flex" width="100%">
            {/* Job Table Container */}
            <Box
              sx={{ width: (selectedCoverLetter || selectedJobDetails) ? "60%" : "100%" }}
              className={`table-container ${!isTableVisible ? "hide" : ""}`}
            >
              {paginatedResults.map((job, index) => {
                const similarityValue = (job?.["Similarity (%)"] ?? 50) / 100;
                return (
                  <Box
                    key={index}
                    className="prefix-job-result-row"
                    sx={{
                      borderColor: `rgba(34, 197, 94, ${similarityValue})`,
                      flexDirection: isMobile || selectedCoverLetter || selectedJobDetails ? "column" : "row",
                    }}
                  >
                    <Box className="prefix-job-result-block">
                      {renderStars(similarityValue, index, job)}
                      <Typography
                        variant="h6"
                        className="prefix-job-title-icon"
                      >
                        {job.Title || t("!title")}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        className="prefix-job-company-icon"
                      >
                        {job.Company || t("!company")}
                      </Typography>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "10px",
                          marginTop: "10px",
                        }}
                      >
                        <Button
                          className="prefix-button"
                          variant="contained"
                          onClick={() => handleJobDetailsClick(job)}
                          style={{ marginTop: "10px" }}
                        >
                         {t("btn_view_Job_details")}
                        </Button>
                        <Button
                          className="prefix-button"
                          variant="contained"
                          onClick={() => handleLetterCoverClick(job)}
                          style={{ marginTop: "10px" }}
                        >
                          {t("btn_view_CL")}
                        </Button>
                        <Button
                          className="prefix-button"
                          variant="contained"
                          onClick={() => window.open(job.Url, "_blank")}
                          style={{ marginTop: "10px", minWidth: "90px" }}
                        >
                          {t("btn_apply")}
                        </Button>
                      </div>
                    </Box>

                    <div className="prefix-divider2"></div>

                    <Box className="prefix-job-result-block">
                      {showMatchingSkills[index] &&
                        (currentLanguage === "fr"
                          ? job.matching_skills_fr
                          : job.matching_skills_en) && (
                          <Box sx={{ marginTop: "10px" }}>
                            <Typography
                              variant="body2"
                              className="prefix-body2"
                            >
                              {t("title_MS")}
                            </Typography>
                            <ul className="matching_skills">
                              {(currentLanguage === "fr"
                                ? job.matching_skills_fr
                                : job.matching_skills_en
                              ).trim() !== "" ? (
                                (currentLanguage === "fr"
                                  ? job.matching_skills_fr
                                  : job.matching_skills_en
                                )
                                  .split("-")
                                  .reduce((acc, skill, idx) => {
                                    const cleanSkill = skill.trim();
                                    if (cleanSkill === "") return acc;
                                    acc.push(
                                      <li key={idx}>
                                        <Typography variant="body2">
                                          {cleanSkill}
                                        </Typography>
                                      </li>
                                    );
                                    return acc;
                                  }, [])
                              ) : (
                                <li>
                                  <Typography variant="body2">
                                    {t("!skills")}
                                  </Typography>
                                </li>
                              )}
                            </ul>
                          </Box>
                        )}
                      <Typography variant="body1" className="prefix-body1">
                        {t("title_!skills")}
                      </Typography>
                      <ul>
                        {currentLanguage === "fr" ? (
                          formatMissingSkills(job.missing_skills_fr).map((skill, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">
                                {skill}
                              </Typography>
                            </li>
                          ))
                        ) : job.missing_skills_en ? (
                          (currentLanguage === "fr"
                            ? job.missing_skills_fr
                            : job.missing_skills_en
                          )
                            .split("-")
                            .map((skill, idx) => {
                              const cleanSkill = skill.trim();
                              return cleanSkill ? (
                                <li key={idx}>
                                  <Typography variant="body2">
                                    {cleanSkill}
                                  </Typography>
                                </li>
                              ) : null;
                            })
                        ) : (
                          <Typography variant="body2" className="nacolor">
                            N/A
                          </Typography>
                        )}
                      </ul>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Cover Letter Container */}
            {selectedCoverLetter && (
              <Box
                className={`details-container ${
                  isMobile && !isTableVisible ? "active" : ""
                }`}
                sx={{
                  width: isMobile ? "100%" : "60%",
                  marginLeft: isMobile ? 0 : "20px",
                }}
                        >
                {/* Close button for desktop */}
                {!isMobile && (
                  <button
                    className="close-button"
                    onClick={() => setSelectedCoverLetter(null)}
                  >
                    &times;
                  </button>
                )}

                {/* Back button for mobile */}
                {isMobile && (
                  <button className="back-button" onClick={handleBackToTable}>
                    &lt;
                  </button>
                )}

                <Typography variant="h6">{t("title_CL")}</Typography>

                <CoverLetter
                  theme={theme}
                  coverLetter={
                    currentLanguage === "fr"
                      ? selectedCoverLetter?.cover_letter_fr || t("error_no_cover_letter")
                      : selectedCoverLetter?.cover_letter_en || t("error_no_cover_letter")
                  }
                />
              </Box>
            )}
            {/* Job details */}
            {selectedJobDetails && (
              <Box
                className={`details-container ${isMobile && !isTableVisible ? "active" : ""}`}
                sx={{
                  width: isMobile ? "100%" : "60%",
                  marginLeft: isMobile ? 0 : "20px",
                }}
              >
                {!isMobile && (
                  <button
                    className="close-button"
                    onClick={() => setSelectedJobDetails(null)}
                  >
                    &times;
                  </button>
                )}

                {isMobile && (
                  <button className="back-button" onClick={handleBackToTable}>
                    &lt;
                  </button>
                )}

                <Typography variant="h6">{t("title_JobD")}</Typography>

                <JobDetails
                  selectedJob={
                    currentLanguage === "fr"
                      ? selectedJobDetails?.Summary_fr || t("error_no_cover_letter")
                      : selectedJobDetails?.Summary || t("error_no_cover_letter")
                  }
                  isPlatformPage={false}
                />
              </Box>
            )}

          </Box>
        ) : (
          <p>{t("error_!MS")}</p>
        )}

        <TablePagination
          component="div"
          count={result.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
          labelRowsPerPage={null}
          showFirstButton={false}
          showLastButton={false}
          nextIconButtonProps={{
            "aria-label": "Next Page",
            sx: { color: "#171C3F", fontWeight: "bold" },
          }}
          backIconButtonProps={{
            "aria-label": "Previous Page",
            sx: { color: "#171C3F", fontWeight: "bold" },
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

        <Box mt={4} sx={{ display: "flex", justifyContent: "center" }}>
          <Link to="/SmartMatching">
            <Button variant="contained" className="prefix-button2">
              {t("btn_B2M")}
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default RstMatching;
