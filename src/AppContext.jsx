import { createContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import IndexDBHelper from './services/indexeDB';

const SECRET_KEY = 'P@ssw0rd!4#MyApp&456';

// Créer un contexte global
export const AppContext = createContext();

const DEFAULT_VALUES = {
  platform: 'merged',
  region: 'ile_de_france',
  searchTerm: '',
  fileSummary: '',
  textSummary: '',
  smartPlatform: '',
  smartRegion: '',
  savedPrompt: '',
  fileName: '',
  email: '',
  etudeLevel: 'Bac+3',
  language: 'fr',
  new_data_added: false,
  hasCvResults: false,
  hasPromptResults: false,
  isAuthenticated: false,
  firstVisitPlatform: true,
  firstVisitRegion: true,
  isFirstVisitSmartMatching: true,
  theme: 'light'
};

export const AppProvider = ({ children }) => {
  const resetStates = () => {
    setPlatform(DEFAULT_VALUES.platform);
    setRegion(DEFAULT_VALUES.region);
    setSearchTerm(DEFAULT_VALUES.searchTerm);
    setSmartPlatform(DEFAULT_VALUES.smartPlatform);
    setSmartRegion(DEFAULT_VALUES.smartRegion);
    setsavedPrompt(DEFAULT_VALUES.savedPrompt);
    setfileName(DEFAULT_VALUES.fileName);
    setEtudeLevel(DEFAULT_VALUES.etudeLevel);
    setNewDataAdded(DEFAULT_VALUES.new_data_added);
    setLanguage(DEFAULT_VALUES.language);
    setHasCvResults(DEFAULT_VALUES.hasCvResults);
    setIsAuthenticated(DEFAULT_VALUES.isAuthenticated);
    setFirstVisitPlatform(DEFAULT_VALUES.firstVisitPlatform);
    setFirstVisitRegion(DEFAULT_VALUES.firstVisitRegion);
    setIsFirstVisitSmartMatching(DEFAULT_VALUES.isFirstVisitSmartMatching);
    setHasPromptResults(DEFAULT_VALUES.hasPromptResults);
    setTheme(DEFAULT_VALUES.theme);
    sessionStorage.setItem('user_id', '');
    sessionStorage.setItem('userEmail', '');
    sessionStorage.setItem('fileSummary', '');
    sessionStorage.setItem('textSummary', '');
    sessionStorage.removeItem('uploadedFileName');
    sessionStorage.removeItem('savedPrompt');
    sessionStorage.removeItem('cvStoredResults');
    sessionStorage.removeItem('promptStoredResults');
    sessionStorage.removeItem('isFileSummarized');
    sessionStorage.removeItem('isTextSummarized');
  };

  const encryptUserID = (userID) => {
    return CryptoJS.AES.encrypt(userID, SECRET_KEY).toString();
  };
  const decryptUserID = (encryptedUserID) => {
    const bytes = CryptoJS.AES.decrypt(encryptedUserID, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const [userId, setUserId] = useState(() => {
      const encryptedUserID = sessionStorage.getItem('user_id');
      if (encryptedUserID) {
          return decryptUserID(encryptedUserID);
      } else {
          return '';
      }
  });
  
  const [platform, setPlatform] = useState(sessionStorage.getItem('platform') || DEFAULT_VALUES.platform);
  const [region, setRegion] = useState(sessionStorage.getItem('region') || DEFAULT_VALUES.region);
  const [dbHelper, setDbHelper] = useState(null);
  const [searchTerm, setSearchTerm] = useState(DEFAULT_VALUES.searchTerm);
  const [fileSummary, setFileSummary] = useState(sessionStorage.getItem('fileSummary') || DEFAULT_VALUES.fileSummary);
  const [textSummary, setTextSummary] = useState(sessionStorage.getItem('textSummary') || DEFAULT_VALUES.textSummary);
  const [smartPlatform, setSmartPlatform] = useState(sessionStorage.getItem('smartPlatform') || DEFAULT_VALUES.smartPlatform);
  const [smartRegion, setSmartRegion] = useState(sessionStorage.getItem('smartRegion') || DEFAULT_VALUES.smartRegion);
  const [savedPrompt, setsavedPrompt] = useState(sessionStorage.getItem('savedPrompt') || DEFAULT_VALUES.savedPrompt);
  const [fileName, setfileName] = useState(sessionStorage.getItem('fileName') || DEFAULT_VALUES.fileName);
  const [email, setEmail] = useState(sessionStorage.getItem('userEmail') || DEFAULT_VALUES.email);
  const [etudeLevel, setEtudeLevel] = useState(sessionStorage.getItem('etudeLevel') || DEFAULT_VALUES.etudeLevel);
  const [new_data_added, setNewDataAdded] = useState(
    sessionStorage.getItem('new_data_added') === 'true' || DEFAULT_VALUES.new_data_added
  );
  const [language, setLanguage] = useState(sessionStorage.getItem('language') || DEFAULT_VALUES.language);  useEffect(() => {
    sessionStorage.setItem('language', language);
  }, [language]);
  const [hasCvResults, setHasCvResults] = useState(
    sessionStorage.getItem('hasCvResults') === 'true' || DEFAULT_VALUES.hasCvResults
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true' || DEFAULT_VALUES.isAuthenticated
  );
  const [firstVisitPlatform, setFirstVisitPlatform] = useState(
    sessionStorage.getItem('firstVisitPlatform') === 'false' ? false : DEFAULT_VALUES.firstVisitPlatform
  );
  const [firstVisitRegion, setFirstVisitRegion] = useState(
    sessionStorage.getItem('firstVisitRegion') === 'false' ? false : DEFAULT_VALUES.firstVisitRegion
  );

  const [isFirstVisitSmartMatching, setIsFirstVisitSmartMatching] = useState(
    sessionStorage.getItem('isFirstVisitSmartMatching') === 'false' ? false : DEFAULT_VALUES.isFirstVisitSmartMatching
  );


  const [hasPromptResults, setHasPromptResults] = useState(
    sessionStorage.getItem('hasPromptResults') === 'true' || DEFAULT_VALUES.hasPromptResults
  );
  const [theme, setTheme] = useState(() => {
    const savedTheme = sessionStorage.getItem('theme');
    if (savedTheme) return savedTheme;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return darkModeQuery.matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.documentElement.style.backgroundColor = '#242424';
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.style.backgroundColor = "#ffffff";
    }

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      if (!sessionStorage.getItem('theme')) {
        setTheme(newTheme);
      }
    };

    darkModeQuery.addEventListener('change', handleThemeChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleThemeChange);
    };
  }, [theme]);

  useEffect(() => {
    sessionStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const initDB = async () => {
      const helper = new IndexDBHelper("JobDB");
      await helper.init();
      setDbHelper(helper);
    };
    initDB();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('new_data_added', new_data_added ? 'true' : 'false'); // Sauvegarder new_data_added dans sessionStorage
  }, [new_data_added]);

  useEffect(() => {
    if (email) {
      sessionStorage.setItem('userEmail', email);
    }
  }, [email]);
  
  useEffect(() => {
      sessionStorage.setItem('user_id', encryptUserID(userId));
  }, [userId]);

  useEffect(() => {
    if (etudeLevel) {
      sessionStorage.setItem('etudeLevel', etudeLevel);
    }
  }, [etudeLevel]);
  
  useEffect(() => {
    if (isFirstVisitSmartMatching) {
      sessionStorage.setItem('isFirstVisitSmartMatching', isFirstVisitSmartMatching ? 'true' : 'false');
    }
  }, [isFirstVisitSmartMatching]);

  useEffect(() => {
    sessionStorage.setItem('hasCvResults', hasCvResults ? 'true' : 'false');
  }, [hasCvResults]);
  useEffect(() => {
    sessionStorage.setItem('hasPromptResults', hasPromptResults ? 'true' : 'false');
  }, [hasPromptResults]);

  useEffect(() => {
    sessionStorage.setItem('hasCvResults', hasCvResults ? 'true' : 'false');
  }, [hasCvResults]);

  useEffect(() => {
    sessionStorage.setItem('firstVisitPlatform', firstVisitPlatform ? 'true' : 'false');
  }, [firstVisitPlatform]);

  useEffect(() => {
    sessionStorage.setItem('firstVisitRegion', firstVisitRegion ? 'true' : 'false');
  }, [firstVisitRegion]);

  // Synchroniser les valeurs avec sessionStorage
  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    sessionStorage.setItem('smartPlatform', smartPlatform);
    sessionStorage.setItem('smartRegion', smartRegion);
    
  }, [smartPlatform, smartRegion]);

  // Gestion des changements manuels dans le sessionStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newPlatform = sessionStorage.getItem('platform');
      const newRegion = sessionStorage.getItem('region');

      if (newPlatform !== platform) setPlatform(newPlatform);
      if (newRegion !== region) setRegion(newRegion);
    };
  
    window.addEventListener('storage', handleStorageChange);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [platform, region]);  


  // Mettre à jour le sessionStorage à chaque changement
  useEffect(() => {
    sessionStorage.setItem('platform', platform);
  }, [platform]);

  useEffect(() => {
    sessionStorage.setItem('region', region);
  }, [region]);

  useEffect(() => {
    if (fileSummary) {
      sessionStorage.setItem('fileSummary', fileSummary);
    }
  }, [fileSummary]);

  useEffect(() => {
    if (textSummary) {
      sessionStorage.setItem('textSummary', textSummary);
    }
  }, [textSummary]);

  useEffect(() => {
    if (fileName) {
      sessionStorage.setItem('uploadedFileName', fileName); // Save file name to sessionStorage
    }
  }, [fileName]);

  useEffect(() => {
    if (savedPrompt) {
      sessionStorage.setItem('savedPrompt', savedPrompt); // Save prompt to sessionStorage
    }
  }, [savedPrompt]);

  return (
    <AppContext.Provider value={{
      theme, setTheme,
      language, setLanguage,
      new_data_added, setNewDataAdded, 
      email, setEmail, 
      userId, setUserId, 
      fileName, setfileName, 
      savedPrompt, setsavedPrompt, 
      hasPromptResults, setHasPromptResults, 
      hasCvResults, setHasCvResults, 
      isAuthenticated, setIsAuthenticated, 
      platform, setPlatform, 
      region, setRegion, 
      searchTerm, setSearchTerm, 
      fileSummary, setFileSummary, 
      textSummary, setTextSummary, 
      smartPlatform, setSmartPlatform, 
      smartRegion, setSmartRegion, 
      firstVisitPlatform, setFirstVisitPlatform, 
      firstVisitRegion, setFirstVisitRegion, 
      etudeLevel, setEtudeLevel, 
      isFirstVisitSmartMatching, setIsFirstVisitSmartMatching, 
      dbHelper, setDbHelper,
      resetStates 
      }}>
      {children}
    </AppContext.Provider>
  );
};
