import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface PropsAlertDialog {
    open: boolean
    onClose: Function
    onConfirm: Function
    title?: string
    description?: string
}

export default function ConfirmAlertDialog(props: PropsAlertDialog) {
  const _handleConfirm = () => {
    props.onConfirm()
    props.onClose()
  }

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={() => props.onClose()}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle>
          {props.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.onClose()}>Annulla</Button>
          <Button onClick={_handleConfirm} autoFocus>
            Confermo
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}