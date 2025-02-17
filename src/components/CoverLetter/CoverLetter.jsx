import { Box, IconButton } from '@mui/material';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver'; // To download the file
import Markdown from 'markdown-to-jsx'; // For rendering markdown
import FileDownloadIcon from '@mui/icons-material/FileDownload'; // Icon for download
import { useTranslation } from 'react-i18next';


const CoverLetter = ({ coverLetter }) => {

  // Function to clean markdown text and format for .docx file download
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
  const { t } = useTranslation();

  // Function to download the cover letter as a .docx file
  const downloadCoverLetterWord = () => {
    if (!coverLetter || coverLetter === 'N/A') {
      alert('No cover letter available to download.');
      return;
    }
  
    const cleanCoverLetterLines = removeMarkdownAndFormat(coverLetter);
  
    const watermarkParagraph = new Paragraph({
      children: [
        new TextRun({
          text: 'DRAFT',
          color: 'D3D3D3', 
          size: 48, 
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

  return (
    <Box className="cover-letter-container" sx={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      {/* Download Button with Icon */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <IconButton onClick={downloadCoverLetterWord} >
            <FileDownloadIcon sx={{ color: '#171C3F' }} />
        </IconButton>
      </Box>

      {/* Render Markdown with proper block-level handling */}
      <Box
        sx={{
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word', 
        }}
      >
        <Box sx={{ color: 'rgba(255, 0, 0, 0.8)', fontWeight: 'bold', textAlign: 'center', fontSize: "14px" }}>
        {t('txt_msg_cover_letter')}
        </Box>

        <Markdown
          options={{
            overrides: {
              pre: {
                component: 'div', // Render <pre> as a <div>
              },
            },
          }}
        >
          {coverLetter || t('error_no_cover_letter')}
      </Markdown>

      </Box>
    </Box>
  );
};

export default CoverLetter;
