import { useState, useEffect, useContext } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { FaFileAlt, FaRegFileAlt } from "react-icons/fa"; // For file and text
import { MdLocationOn } from "react-icons/md"; // For region icon
import { useNavigate } from "react-router-dom"; // Added useNavigate for redirection
import indeedLogo from "../../assets/indeed.png"; // Import as src image
import linkedinLogo from "../../assets/linkedin.png";
import skemaleon from "../../assets/lesard.png";
import apecLogo from "../../assets/apec.png";
import helloworkLogo from "../../assets/hellowork.svg";
import helloworkLogoDark from "../../assets/helloworkDark.svg";
import jungleLogo from "../../assets/jungle.png";
import "./LastRequest.css"; // Custom styles for dots and layout
import { AppContext } from "../../AppContext"; // Importing context
import CircularProgress from '@mui/material/CircularProgress'; // Import spinner

const LastRequest = () => {
  const [requests, setRequests] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // State for loading
  const navigate = useNavigate(); // For programmatic navigation
  const baseUrl = window._env_?.VITE_APP_BASE_URL || import.meta.env.VITE_APP_BASE_URL;


  const {
    new_data_added, setNewDataAdded, userId, theme
  } = useContext(AppContext);

  const handleLastRequestClick = (request) => {
    // Redirect to /historyRslts and pass predict_jobs in state
    navigate('/rslts00', { state: { predictJobs: request.predict_jobs } });
  };

  // Function to fetch the last requests
  const fetchLastRequests = async () => {
    if (!userId) {
      console.error("No user email found in session storage.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true); // Start loading
      const response = await fetch(
        `${baseUrl}/history/get-prediction-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      const data = await response.json();
      console.log(data);

      if (data.prediction_results && Array.isArray(data.prediction_results)) {
        // If more than 10 requests, limit to 10
        setRequests(
          data.prediction_results.length > 10
            ? data.prediction_results.slice(-10).reverse() // Take the last 10 and reverse
            : data.prediction_results.reverse()
        );
      } else {
        console.error(
          "Expected an array for prediction_results, but received:",
          data
        );
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching last requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // useEffect to load data when the component mounts
  useEffect(() => {
    fetchLastRequests();
  }, []);

  // useEffect to listen for changes in new_data_added
  useEffect(() => {
    if (new_data_added) {
      fetchLastRequests();
      setNewDataAdded(false); // Reset new_data_added to false
    }
  }, [new_data_added]);

  const goNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % requests.length);
  };

  const goPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? requests.length - 1 : prevIndex - 1
    );
  };

  // Function to get the platform image based on the request platform
  const getPlatformImage = (platform) => {

    switch (platform.toLowerCase()) {
      case "indeed":
        return indeedLogo;
      case "linkedin":
        return linkedinLogo;
      case "jungle":
        return jungleLogo;
      case "apec":
        return apecLogo;
      case "merged":
        return skemaleon;
      case "hellowork":
        return theme === "dark"  ? helloworkLogoDark : helloworkLogo; 
      default:
        return null;
    }
  };

  if (isLoading) {
    // While loading, display the spinner
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="flex-start" // Aligns spinner to the top vertically
        width="100%"
        mt={4} // Adds top margin to push spinner down
      >
          <CircularProgress sx={{ color: theme === "dark" ? "#e0e0e0" : "#171C3F" }} />
          </Box>
    );
  }

  // If there are no requests, return null (render nothing)
  if (requests.length === 0) {
    return null;
  }

  // Render the component if there are requests
  return (
    <Box
      className="carousel-container"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box className="carousel" display="flex" justifyContent="center">
        {requests.map((request, index) => {
          const isActive = index === currentIndex;

          return (
            isActive && (
              <Box
                key={index}
                className={`carousel-item ${isActive ? "active" : ""}`}
                onClick={() => handleLastRequestClick(request)}
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                {/* Left Side: Platform Image */}
                <Box width="40%">
                  <img
                    src={getPlatformImage(request.platform)}
                    alt={request.platform}
                    className="platform-logo"
                  />
                </Box>

                {/* Right Side: Request Information */}
                <Box width="60%" className="right-info">
                  <Typography className="date-time">
                    {request.added_date}
                  </Typography>

                  <Box
                    className="file-promptt"
                    display="flex"
                    alignItems="center"
                  >
                    {request.filename ? (
                      <>
                        <FaFileAlt className="file-icon" />
                        <Typography variant="body1" className="file-prompt">
                          {request.filename}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <FaRegFileAlt className="prompt-icon" />
                        <Typography variant="body1" className="file-prompt">
                          {request.textSummary}
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" className='file-promptt'>
                    <MdLocationOn className="region-icon" />
                    <Typography variant="body1" className="file-prompt">
                      {request.city_for_filter}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )
          );
        })}
      </Box>

      <Box
        className="carousel-pagination"
        display="flex"
        alignItems="center"
        mt={2}
      >
        <IconButton onClick={goPrev}>
          <ArrowBackIos />
        </IconButton>

        {requests.map((_, index) => (
          <Box
            key={index}
            className={`carousel-dot ${
              index === currentIndex ? "active" : ""
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}

        <IconButton onClick={goNext}>
          <ArrowForwardIos />
        </IconButton>
      </Box>
    </Box>
  );
};

export default LastRequest;
