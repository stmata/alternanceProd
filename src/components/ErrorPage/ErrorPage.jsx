import styles from './ErrorPage.module.css'; 
import { useTranslation } from 'react-i18next';



const ErrorPage = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.errorContainer}>
      <h1 className={styles.msgError}>{t('page_no_found')}</h1>
    </div>
  );
};

export default ErrorPage;
