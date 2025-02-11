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

    const doc = new Document({
      sections: [
        {
          children: cleanCoverLetterLines.map((line) => {
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
          whiteSpace: 'pre-wrap', // Preserve line breaks and whitespace
          wordBreak: 'break-word', // Break long words at appropriate points
        }}
      >
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
