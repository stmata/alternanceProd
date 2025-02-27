import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { CircularProgress } from '@mui/material';
import AlertDialogSlide from '../AlertDialogSlide/AlertDialogSlide';
import './ContactDialog.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * A contact dialog component that allows users to send messages.
 * 
 * @param {boolean} open - Controls whether the dialog is open or closed.
 * @param {function} onClose - Callback function to handle dialog close.
 * @param {string} title - The title of the dialog (default: "Contactez-nous").
 * @param {string} message - The introductory message (default: "Envoyez-nous votre message et nous vous répondrons dans les meilleurs délais.").
 * @param {string} sendText - The text for the send button (default: "Envoyer").
 * @param {string} cancelText - The text for the cancel button (default: "Annuler").
 * @param {string} messageLabel - The label for the message input field (default: "Votre message").
 * @param {string} email_user - The email address of the user sending the message.
 */
const ContactDialog = ({
  open,
  onClose,
  title = "Contactez-nous",
  message = "Envoyez-nous votre message et nous vous répondrons dans les meilleurs délais.",
  sendText = "Envoyer",
  cancelText = "Annuler",
  messageLabel = "Votre message",
  email_user
}) => {
  const [userMessage, setUserMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState('');
  const [alertMessage, setAlertMessage] = React.useState('');
  const [isSuccess, setIsSuccess] = React.useState(true);
  const baseUrl = window._env_?.VITE_APP_BASE_URL || import.meta.env.VITE_APP_BASE_URL;

  const handleClose = () => {
    if (!loading) {
      setUserMessage('');
      onClose();
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      // Préparer les données à envoyer
      const data = {
        user_email: email_user,
        message_text: userMessage
      };
      
      // Envoyer la requête au backend
      const response = await fetch(`${baseUrl}/auth/send-contact-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        setAlertTitle(t("txtContactSuccessTitle"));
        setAlertMessage(t("txtContactSuccessMessage"));
      } else {
        setIsSuccess(false);
        setAlertTitle(t("txtContactErrorTitle"));
        setAlertMessage(t("txtContactErrorMessage"));
      }
    } catch (error) {
      // Gérer les erreurs de réseau ou autres
      //console.error('Erreur:', error);
      setIsSuccess(false);
      setAlertTitle(t("txtContactNetworkErrorTitle"));
      setAlertMessage(t("txtContactNetworkErrorMessage"));
    } finally {
      setLoading(false);
      // Fermer la boîte de dialogue de contact
      setUserMessage('');
      onClose();
      // Ouvrir l'alerte
      setAlertOpen(true);
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="contact-dialog-description"
        className="contact-dialog"
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="contact-dialog-description">
            {message}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="message"
            name="message"
            label={messageLabel}
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>{cancelText}</Button>
          <Button 
            onClick={handleSend}
            disabled={!userMessage.trim() || loading}
            variant="contained"
            color="primary"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : sendText}
          </Button>
        </DialogActions>
      </Dialog>

      <AlertDialogSlide
        open={alertOpen}
        onClose={handleAlertClose}
        title={alertTitle}
        message={alertMessage}
        confirmText="OK"
        onConfirm={handleAlertClose}
      />
    </>
  );
};

export default ContactDialog;