import { useState, useEffect, useContext } from "react";
import {
  FaUser,
  FaArrowLeft,
  FaHourglassHalf,
  FaLock,
  FaSyncAlt,
} from "react-icons/fa";
import { CircularProgress } from '@mui/material';
import styles from "./LoginPage.module.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { useTranslation } from 'react-i18next';

const useTypewriterEffect = (text, duration) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    const totalChars = text.length;
    const timePerChar = duration / totalChars;
    let index = 0;
    const intervalId = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index === totalChars) clearInterval(intervalId);
    }, timePerChar);

    return () => clearInterval(intervalId);
  }, [text, duration]);
  return displayedText;
};

const LoginForm = () => {
  const { setEmail, isAuthenticated, setIsAuthenticated, setUserId } =
    useContext(AppContext);
  const [code, setCode] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [wrongCode, setWrongCode] = useState(false);
  const navigate = useNavigate();
  const [isSkemaDomain, setIsSkemaDomain] = useState(true);

  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const { t } = useTranslation();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    return email.endsWith("@skema.edu");
  };

  /*const isValidEmail_func = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };*/

  // Clear email and code when the component mounts (e.g., after logout)
  useEffect(() => {
    setEmailInput("");
    setCode("");
  }, []);

  useEffect(() => {
    let timer;
    if (isCodeSent && !isConfirmed && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    }
    if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [isCodeSent, countdown, isConfirmed]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/PlatformPage");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 480);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayedText = useTypewriterEffect(t('welcome_message'), 15000);

  const sendVerificationCode = async (email) => {
    setIsLoading(true);
    try {
      const controller = new AbortController(); 
      const timeoutId = setTimeout(() => {
        controller.abort();
        setIsLoading(false); 
        setError("Request timed out. Please try again.");
      }, 20000);
      const response = await fetch(`${baseUrl}/auth/send-verification-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (!data.status) {
        let errorMessage = data.detail || "An error occurred. Please try again.";
        const errorPrefixes = ["400: ", "500: "];
        for (const prefix of errorPrefixes) {
          if (errorMessage.startsWith(prefix)) {
              errorMessage = errorMessage.replace(prefix, "");
              break; 
          }
        }
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
      
      if (data.user_role) {
        setUserRole(data.user_role);
      }
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      setError("Failed to send verification code. Please try again.");
      return false;
    }
  };

  const verifyCode = async (email, code) => {
    setIsLoading(true);
    try {
      const controller = new AbortController(); 
      const timeoutId = setTimeout(() => {
        controller.abort();
        setIsLoading(false); 
        setError("Request timed out. Please try again.");
      }, 20000);
      const response = await fetch(`${baseUrl}/auth/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, user_role: userRole }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.statut === true && data.user_id) {
        // Store user_id in sessionStorage instead of email
        setUserId(data.user_id);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      console.error("Error verifying code:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(emailInput)) {
      setIsSkemaDomain(false);
      setError("Please use SKEMA email!");
      return;
    }

    if (!isCodeSent) {
      const codeSent = await sendVerificationCode(emailInput);
      if (codeSent) {
        setIsCodeSent(true);
        setCountdown(300);
        setCanResend(false);
      }
    } else {
      const isValidCode = await verifyCode(emailInput, code);
      if (isValidCode) {
        setIsAuthenticated(true);
        setIsConfirmed(true);
        setWrongCode(false);

        setEmail(emailInput);
        // Naviguer vers la page platform
        navigate("/PlatformPage");
      } else {
        setWrongCode(true);
        setError("Wrong code. Please try again.");
      }
    }
  };

  const handleResendCode = async () => {
    const codeSent = await sendVerificationCode(emailInput);
    if (codeSent) {
      setCountdown(300);
      setCanResend(false);
      setIsConfirmed(false);
      setWrongCode(false);
    }
  };

  const handleReset = () => {
    setEmailInput("");
    setCode("");
    setIsCodeSent(false);
    setCountdown(300);
    setCanResend(false);
    setIsConfirmed(false);
    setWrongCode(false);
    setError("");
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginFormBox}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>{t('login')} :</h2>
        </div>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {/* Email input visible if code is NOT sent */}
          {!isCodeSent && (
            <div className={styles.inputGroup}>
              <input
                type="email"
                id="email"
                onFocus={() => setError('')}
                className={styles.inputField}
                placeholder={t('input_mail')}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value.toLowerCase())} // Convert to lowercase
                required
              />
              <FaUser className={styles.inputIcon} size={20} />
            </div>
          )}

          {/* Code input visible if code IS sent */}
          {isCodeSent && (
            <div className={styles.inputContainer}>
              <div className={styles.iconAndEmail}>
                <FaArrowLeft
                  onClick={handleReset}
                  className={styles.outsideIcon}
                  size={20}
                />
                <span className={styles.emailText}>{emailInput.toLowerCase()}</span>
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  id="code"
                  className={styles.inputField}
                  placeholder={t('input_code')}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <FaLock className={styles.inputIcon} size={20} />
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitBtn}>
          {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isCodeSent ? (
              t('btn_confirm')
            ) : (
              t('login')
            )}
          </button>
        </form>
        {!isCodeSent && !isSkemaDomain && (
          <div className={styles.errorText}>{error}</div>
        )}
        {isCodeSent && wrongCode && (
          <div className={styles.errorText}>{t('error_code')}</div>
        )}

        {/* Timer for code resend */}
        {isCodeSent && !isConfirmed && (
          <div className={styles.actionGroup} style={{ marginTop: "1rem" }}>
            {canResend ? (
              <button
                onClick={handleResendCode}
                className={styles.resendCodeBtn}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <>
                    {t('resend')}
                    <FaSyncAlt
                      className={styles.resendIcon}
                      size={14}
                      style={{ marginLeft: "5px" }}
                    />
                  </>
                )}
              </button>
            ) : (
              <div className={styles.timerContainer}>
                <FaHourglassHalf className={styles.timeIcon} size={20} />
                <p className={styles.countdownText}>
                  {countdown} {t('time')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.animatedText}>{displayedText}</div>
    </div>
  );
};

export default LoginForm;
