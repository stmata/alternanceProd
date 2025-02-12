import { useEffect, useState, useContext } from "react";
import TablePagination from "@mui/material/TablePagination";
import BusinessIcon from "@mui/icons-material/Business"; // Company icon
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Location icon
import EventIcon from "@mui/icons-material/Event"; // Publication date icon
import FavoriteIcon from "@mui/icons-material/Favorite"; // Liked date icon
import DescriptionIcon from "@mui/icons-material/Description"; // Summary icon
import CircularProgress from "@mui/material/CircularProgress"; // Spinner
import DeleteIcon from "@mui/icons-material/Delete"; // Delete icon
import IconButton from "@mui/material/IconButton"; // IconButton for clickable icons
import "./ListOfLikes.css";
import { useTranslation } from "react-i18next";
import { AppContext } from "../../AppContext";

const ListOfLikes = () => {
  const {userId, theme} = useContext(AppContext);
  const [likedPosts, setLikedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // State for loading
  const [page, setPage] = useState(0); // Pagination: current page
  const rowsPerPage = 2; // Rows per page is fixed at 2
  const baseUrl = window._env_?.VITE_APP_BASE_URL || import.meta.env.VITE_APP_BASE_URL;
  const { t, i18n } = useTranslation();
  // Function to render list items from text
  const renderList = (text) => {
    const items = text.split("-").filter((item) => item.trim() !== "");
    return items.map((item, idx) => (
      <li key={idx} className="job-list-item">
        {item.trim()}
      </li>
    ));
  };
  
  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const response = await fetch(`${baseUrl}/history/get-liked-posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setLikedPosts(data.liked_posts || []);
        } else {
          console.error("Failed to fetch liked posts");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchLikedPosts();
  }, [baseUrl, userId]);

  // Handle removing a liked post
  const handleRemoveLike = async (postToRemove) => {
    try {
      const response = await fetch(`${baseUrl}/history/remove-liked-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          job_post_url: postToRemove.Url,
        }),
      });

      if (response.ok) {
        // Update the state to remove the post from the list
        setLikedPosts((prevPosts) =>
          prevPosts.filter((post) => post.Url !== postToRemove.Url)
        );
        console.log("Successfully removed liked post");
      } else {
        console.error("Failed to remove liked post");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Slicing the data for the current page
  const currentPosts = likedPosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (isLoading) {
    // While loading, display the spinner
    return (
      <div className="spinner-container">
        <CircularProgress sx={{ color: theme === "dark" ? "#e0e0e0" : "#171C3F" }} />
      </div>
    );
  }

  // After loading, render the component
  return (
    <div className="prefix-container4">
      {likedPosts.length > 0 ? (
        <>
          {/* Title is displayed only if there are liked posts */}
          <h2 className="prefix-h2">{t("title_LJP")}</h2>
          {currentPosts.map((post, index) => {
            const language = i18n.language;
            const jobDescription =
              language === "fr" ? post.Summary_fr : post.Summary || "N/A";
            console.log(post);
            const jobTitleLabel = t("job_title");
            const primaryResponsibilitiesLabel = t("primary_responsibilities");
            const keySkillsLabel = t("key_skills");
            const mainObjectivesLabel = t("main_objectives");
            const niveau_experiencesLabel = t("niveau_experiences");

            const jobTitle =
              jobDescription.match(
                new RegExp(
                  `\\*\\*${jobTitleLabel}:\\*\\*([\\s\\S]*?)(\\*\\*|$)`
                )
              )?.[1] || t("no_more_details");
            const primaryResponsibilities =
              jobDescription.match(
                new RegExp(
                  `\\*\\*${primaryResponsibilitiesLabel}:\\*\\*([\\s\\S]*?)(\\*\\*|$)`
                )
              )?.[1] || t("no_more_details");
            const keySkills =
              jobDescription.match(
                new RegExp(
                  `\\*\\*${keySkillsLabel}:\\*\\*([\\s\\S]*?)(\\*\\*|$)`
                )
              )?.[1] || t("no_more_details");
            const mainObjectives =
              jobDescription.match(
                new RegExp(
                  `\\*\\*${mainObjectivesLabel}:\\*\\*([\\s\\S]*?)(\\*\\*|$)`
                )
              )?.[1] || t("no_more_details");
            
              const niveau_experiences =
              jobDescription.match(
                new RegExp(`\\*\\*${niveau_experiencesLabel}:\\*\\*([\\s\\S]*?)(\\*\\*|$)`)
              )?.[1] || t("no_more_details");

            return (
              <div key={index} className="job-details-container">
                {/* Delete icon positioned on the right */}
                <IconButton
                  aria-label="remove like"
                  onClick={() => handleRemoveLike(post)}
                  sx={{ color: "#171C3F", float: "right" }}
                >
                  <DeleteIcon />
                </IconButton>
                <div className="job-title-like-container">
                  <h3 className="job-title">{post.Title}</h3>
                  <a
                    href={post.Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="prefix-MuiButton-contained"
                  >
                    {t("title_VJ")}
                  </a>
                </div>
                <p className="job-section">
                  <BusinessIcon sx={{ color: "#171C3F" }} /> {post.Company}
                </p>
                <p className="job-section">
                  <LocationOnIcon sx={{ color: "#171C3F" }} /> {post.Location}
                </p>
                <p className="job-section">
                  <EventIcon sx={{ color: "#171C3F" }} />{" "}
                  {post["Publication Date"]}
                </p>
                <p className="job-section">
                  <FavoriteIcon sx={{ color: "#171C3F" }} /> {post.added_date}
                </p>

                <div className="job-section">
                  <DescriptionIcon sx={{ color: "#171C3F" }} /> {t("title_PR")}
                  <ul>{renderList(primaryResponsibilities)}</ul>
                </div>
                <div className="job-section">
                  <DescriptionIcon sx={{ color: "#171C3F" }} /> {t("title_KRS")}
                  <ul>{renderList(keySkills)}</ul>
                </div>
                <div className="job-section">
                  <DescriptionIcon sx={{ color: "#171C3F" }} /> {t("title_MO")}
                  <ul>{renderList(mainObjectives)}</ul>
                </div>
                <div className="job-section">
                  <DescriptionIcon sx={{ color: "#171C3F" }} /> {t("title_LEVELEXP")}
                  <ul>{renderList(niveau_experiences)}</ul>
                </div>
              </div>
            );
          })}
          {/* Pagination is displayed only if there are liked posts */}
          <TablePagination
            component="div"
            count={likedPosts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]} // Disable rows per page dropdown
            labelRowsPerPage={null} // Hide "Rows per page" label
            showFirstButton={false} // Hide first page button
            showLastButton={false} // Hide last page button
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
        </>
      ) : (
        // Message displayed when there are no liked posts
        <p
          className="nolikedPosts"
          dangerouslySetInnerHTML={{ __html: t("error_!LJ") }}
        ></p>
      )}
    </div>
  );
};

export default ListOfLikes;
