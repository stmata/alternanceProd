import { useState, useEffect } from 'react';
import { Box, IconButton, useMediaQuery } from '@mui/material';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import Markdown from 'markdown-to-jsx';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useTranslation } from 'react-i18next';
import AlertDialogSlide from '../utils/AlertDialogSlide/AlertDialogSlide';

const CoverLetter = ({ coverLetter, theme }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const { t } = useTranslation();
  const [formattedWatermark, setFormattedWatermark] = useState("");
  
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:960px)');
  
  const isDarkMode = theme === "dark";
  const watermarkColor = isDarkMode 
    ? 'rgba(255, 255, 255, 0.25)'  
    : 'rgba(80, 80, 80, 0.3)'; 
    
  useEffect(() => {
    const watermarkText = t('txt_draft_cover_letter');
    
    if (watermarkText.length > 30) {
      const midPoint = Math.floor(watermarkText.length / 2);
      
      let breakPoint = watermarkText.indexOf(' ', midPoint - 10);
      if (breakPoint === -1 || breakPoint > midPoint + 10) {
        breakPoint = midPoint;
      }
      
      const firstPart = watermarkText.substring(0, breakPoint);
      const secondPart = watermarkText.substring(breakPoint + 1);
      
      setFormattedWatermark(`${firstPart}\n${secondPart}`);
    } else {
      setFormattedWatermark(watermarkText);
    }
  }, [t]);

  const showAlertDialog = (title, message) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogConfirm = () => {
    setDialogOpen(false);
  };

  const removeMarkdownAndFormat = (text) => {
    return text
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/(~~)(.*?)\1/g, '$2')
      .replace(/!?\[.*?\]\(.*?\)/g, '')
      .replace(/`/g, '')
      .replace(/#+\s/g, '')
      .replace(/>\s/g, '')
      .replace(/-|\*|\+\s/g, '')
      .replace(/\n\n/g, '\n')
      .split('\n')
      .filter((line) => line.trim().length > 0);
  };

  const downloadCoverLetterWord = () => {
    if (!coverLetter || coverLetter === 'N/A') {
      showAlertDialog(
        t("alert_title_error"), 
        t("cover_letter_download_error") 
      );
      return;
    }
  
    const cleanCoverLetterLines = removeMarkdownAndFormat(coverLetter);
  
    const watermarkParagraph = new Paragraph({
      children: [
        new TextRun({
          text: t('txt_draft_cover_letter'),
          color: 'FF0000', 
          size: 28, 
          font: 'Times New Roman',
          bold: true,
        }),
      ],
      alignment: 'center', 
      spacing: {
        before: 0,
        after: 0,
      },
      indent: {
        left: 5000, 
      },
      rotate: -45, 
    });
  
    const doc = new Document({
      sections: [
        {
          children: [
            watermarkParagraph, 
            ...cleanCoverLetterLines.map((line) => {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    font: 'Times New Roman',
                    size: 26,
                  }),
                ],
                spacing: {
                  before: 200,
                  after: 200,
                },
              });
            }),
          ],
        },
      ],
    });
  
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `Cover_Letter.docx`);
    });
  };

  // Tailles de police responsives en fonction de la taille de l'écran
  const getFontSize = () => {
    if (isMobile) return '25px';
    if (isTablet) return '30px';
    return '60px';
  };

  return (
    <Box className="cover-letter-container" sx={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
    }}>
      {/* Watermark message IA - avec adaptation responsive améliorée */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(-45deg)',
        fontSize: getFontSize(),
        fontWeight: 'bold',
        color: watermarkColor,
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none',
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.3,
        padding: 2,
        // Assurer que le filigrane couvre toute la zone
        //transformOrigin: 'center center',
        //minHeight: '200%',
        //minWidth: '200%'
      }}>
        {formattedWatermark}
      </Box>

      {/* Download Button with Icon */}
      <Box display="flex" justifyContent="flex-end" mb={2} sx={{ position: 'relative', zIndex: 1 }}>
        <IconButton onClick={downloadCoverLetterWord} size={isMobile ? 'small' : 'medium'}>
          <FileDownloadIcon sx={{ color: '#171C3F' }} />
        </IconButton>
      </Box>

      {/* Render Markdown with proper block-level handling */}
      <Box sx={{
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word',
        position: 'relative',
        zIndex: 1,
        color: isDarkMode ? '#ffffff' : '#000000'
      }}>
        <Markdown
          options={{
            overrides: {
              pre: {
                component: 'div',
              },
            },
          }}
        >
          {coverLetter || t('error_no_cover_letter')}
        </Markdown>
      </Box>

      <AlertDialogSlide
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        title={dialogTitle}
        message={dialogMessage}
        confirmText={t("alert_button_ok")}
      />
    </Box>
  );
};

export default CoverLetter;