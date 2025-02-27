import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import './AlertDialogSlide.css'


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * A reusable alert dialog component with a slide transition.
 * 
 * @param {boolean} open - Controls whether the dialog is open or closed.
 * @param {function} onClose - Callback function to handle dialog close.
 * @param {string} title - The title of the dialog.
 * @param {string} message - The message to display in the dialog.
 * @param {string} confirmText - The text for the confirm button (default: "OK").
 * @param {string} cancelText - The text for the cancel button (default: "Cancel").
 * @param {function} onConfirm - Callback function to handle confirm action.
 */
const AlertDialogSlide = ({
  open,
  onClose,
  title,
  message,
  confirmText = "OK",
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialogSlide;