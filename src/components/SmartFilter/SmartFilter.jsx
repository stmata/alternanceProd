import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../AppContext';
import './SmartFilter.css';
import CircularProgress from '@mui/material/CircularProgress';
import { InsertDriveFile } from '@mui/icons-material';
import LastRequest from '../LastRequest/LastRequest';
import { useTranslation } from 'react-i18next';

const SmartFilter = () => {
  const {
    setNewDataAdded,
    setFileSummary,
    setTextSummary,
    hasCvResults,
    setHasCvResults,
    hasPromptResults,
    setHasPromptResults,
    platform,
    region,
    etudeLevel,
    userId,
  } = useContext(AppContext);

  const [selectedFile, setSelectedFile] = useState(null);
  const [promptText, setPromptText] = useState('');
  const [isFileSummarized, setIsFileSummarized] = useState(false);
  const [isTextSummarized, setIsTextSummarized] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [fileName, setFileName] = useState(null);
  const { t } = useTranslation();
  const baseUrl = window._env_?.VITE_APP_BASE_URL || import.meta.env.VITE_APP_BASE_URL;

  // Load stored data from sessionStorage
  useEffect(() => {
    //const savedFile = sessionStorage.getItem('uploadedFileName');
    const savedPrompt = sessionStorage.getItem('savedPrompt');
    const cvStoredResults = sessionStorage.getItem('cvStoredResults');
    const promptStoredResults = sessionStorage.getItem('promptStoredResults');
    const fileSummarized = sessionStorage.getItem('isFileSummarized');
    const textSummarized = sessionStorage.getItem('isTextSummarized');

    if (savedPrompt) {
      setPromptText(savedPrompt);
    }

    if (cvStoredResults) {
      setHasCvResults(true);
    }

    if (promptStoredResults) {
      setHasPromptResults(true);
    }

    if (fileSummarized === 'true') {
      setIsFileSummarized(true);
    }

    if (textSummarized === 'true') {
      setIsTextSummarized(true);
    }
  }, []);

  // Reset states when platform or region change
  useEffect(() => {
    if (platform && region) {
      if (isFileSummarized) {
        sessionStorage.removeItem('cvStoredResults');
        setHasCvResults(false);
      }
      if (isTextSummarized) {
        sessionStorage.removeItem('promptStoredResults');
        setHasPromptResults(false);
      }
    }
  }, [platform, region]);

  // Normalize strings for requests
  const normalizeString = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/-/g, '_');
  };

  // Handle prediction after summarization
  const handlePredict = async (summary, type) => {
    if (!platform || !region || !summary) {
      //console.error('Missing data for prediction.');
      return;
    }

    try {
      if (type === 'cv') {
        setIsLoadingFile(true);
      } else if (type === 'prompt') {
        setIsLoadingText(true);
      }

      const requestBody = {
        platform: normalizeString(platform),
        region: "france",
        summarized_text: summary,
        type_summary: type,
        user_id: userId,
        filename: type === 'cv' ? fileName : promptText,
        education_level: etudeLevel,
        city_for_filter: normalizeString(region)
      };

      const response = await fetch(`${baseUrl}/analytics/predict-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setNewDataAdded(true);
        
        if (type === 'cv') {
          sessionStorage.setItem('cvStoredResults', JSON.stringify(data.top_similar_jobs));
          setHasCvResults(true);
          // Reset CV states
          setSelectedFile(null);
          setFileName(null);
          setIsFileSummarized(false);
          sessionStorage.removeItem('uploadedFileName');
          sessionStorage.removeItem('isFileSummarized');
        } else if (type === 'prompt') {
          sessionStorage.setItem('promptStoredResults', JSON.stringify(data.top_similar_jobs));
          setHasPromptResults(true);
          // Reset prompt states
          setPromptText('');
          setIsTextSummarized(false);
          sessionStorage.removeItem('savedPrompt');
          sessionStorage.removeItem('isTextSummarized');
        }
      } else {
        throw new Error('Échec de la récupération de la prédiction.');
      }
    } catch (error) {
      //console.error('Erreur lors de la récupération de la prédiction:', error);
    } finally {
      if (type === 'cv') {
        setIsLoadingFile(false);
      } else if (type === 'prompt') {
        setIsLoadingText(false);
      }
    }
  };

  // Handle CV file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setIsFileSummarized(false);
      setHasCvResults(false);
      sessionStorage.removeItem('cvStoredResults');
      sessionStorage.setItem('uploadedFileName', file.name);
    }
  };

  // Handle start matching for CV
  const handleStartMatching = async () => {
    if (selectedFile && !isFileSummarized) {
      setIsLoadingFile(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const response = await fetch(`${baseUrl}/summarize/file`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          sessionStorage.setItem('fileSummary', data.summary);
          setFileSummary(data.summary);
          setIsFileSummarized(true);
          sessionStorage.setItem('isFileSummarized', 'true');
          await handlePredict(data.summary, 'cv');
        } else {
          throw new Error('Failed to summarize the file.');
        }
      } catch (error) {
        //console.error('Error summarizing file:', error);
        alert('Failed to summarize the file.');
      } finally {
        setIsLoadingFile(false);
      }
    } else if (isFileSummarized) {
      const savedFileSummary = sessionStorage.getItem('fileSummary');
      await handlePredict(savedFileSummary, 'cv');
    }
  };

  // Handle start matching for prompt
  const handleStartPrompt = async () => {
    if (promptText.trim() && !isTextSummarized) {
      setIsLoadingText(true);
      try {
        const response = await fetch(`${baseUrl}/summarize/text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: promptText,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          sessionStorage.setItem('textSummary', data.summary);
          setTextSummary(data.summary);
          setIsTextSummarized(true);
          sessionStorage.setItem('isTextSummarized', 'true');
          sessionStorage.setItem('savedPrompt', promptText);
          await handlePredict(data.summary, 'prompt');
        } else {
          throw new Error('Failed to summarize the text.');
        }
      } catch (error) {
        //console.error('Error summarizing text:', error);
        alert('Failed to summarize the text.');
      } finally {
        setIsLoadingText(false);
      }
    } else if (isTextSummarized) {
      const savedTextSummary = sessionStorage.getItem('textSummary');
      await handlePredict(savedTextSummary, 'prompt');
    }
  };

  // Handle prompt text change
  const handlePromptChange = (e) => {
    const value = e.target.value;
    setPromptText(value);
    setIsTextSummarized(false);
    setHasPromptResults(false);
    sessionStorage.removeItem('promptStoredResults');
    sessionStorage.setItem('savedPrompt', value);
  };

  return (
    <div>
      <div className="smart-filter-container2">
        <div className="filter-section">
          <h2>{t("title_CV")}</h2>
          <p dangerouslySetInnerHTML={{ __html: t('description_CV') }}></p>

          <div className="file-upload-form">
            <h2 className="file-upload-title">{t("input_file")}</h2>
            <div className="file-upload-box">
              <input
                type="file"
                id="file"
                className="file-input"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <label htmlFor="file" className="file-label">
                <InsertDriveFile className="upload-icon" />
                {fileName ? fileName : t("btn_UpCV")}
              </label>
              {fileName && <p className="file-size">{fileName}</p>}
            </div>
          </div>

          {hasCvResults ? (
            <Link to="/rslts00?type=cv" className="link-button">
              <button
                className={isLoadingFile ? 'disabled-button' : 'button-active'}
                disabled={isLoadingFile || !platform || !region}
              >
                {isLoadingFile ? (
                  <span>
                    {t("btn_processing")} <CircularProgress size={20} sx={{ color: "#fff", marginLeft: 1 }} />
                  </span>
                ) : (
                  t("btn_viewRslts")
                )}
              </button>
            </Link>
          ) : (
            <button
              className={
                (!selectedFile || isLoadingFile || !platform || !region)
                  ? 'disabled-button'
                  : 'button-active'
              }
              disabled={!selectedFile || isLoadingFile || !platform || !region}
              onClick={handleStartMatching}
            >
              {isLoadingFile ? (
                <span>
                  {t("btn_processing")} <CircularProgress size={20} sx={{ color: "#fff", marginLeft: 1 }} />
                </span>
              ) : (
                t("btn_StartM")
              )}
            </button>
          )}
        </div>

        <div className="divider"></div>

        <div className="filter-section">
          <h2>{t("title_prompt")}</h2>
          <p dangerouslySetInnerHTML={{ __html: t('description_prompt') }}></p>
          <textarea
            value={promptText}
            onChange={handlePromptChange}
            placeholder={t("input_prompt")}
          />

          {hasPromptResults ? (
            <Link to="/rslts00?type=prompt" className="link-button2">
              <button
                className={isLoadingText ? 'disabled-button' : 'button-active'}
                disabled={isLoadingText || !platform || !region}
              >
                {isLoadingText ? (
                  <span>
                    {t("btn_processing")} <CircularProgress size={20} sx={{ color: "#fff", marginLeft: 1 }} />
                  </span>
                ) : (
                  t("btn_viewRsltsPr")
                )}
              </button>
            </Link>
          ) : (
            <button
              className={
                (!promptText.trim() || isLoadingText || !platform || !region)
                  ? 'disabled-button'
                  : 'button-active'
              }
              disabled={!promptText.trim() || isLoadingText || !platform || !region}
              onClick={handleStartPrompt}
            >
              {isLoadingText ? (
                <span>
                  {t("btn_processing")} <CircularProgress size={20} sx={{ color: "#fff", marginLeft: 1 }} />
                </span>
              ) : (
                t("btn_StartM")
              )}
            </button>
          )}
        </div>
      </div>
      <LastRequest />
    </div>
  );
};

export default SmartFilter;