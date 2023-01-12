import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

interface PropsFormTextField {
    value: string,
    placeholder: string,
    onChangeFn: (arg0: string) => void,
    helperText: string,
    password?: boolean
}

export function FormTextField(props: PropsFormTextField) {
    return (
        <FormControl>
            <TextField
                value={props.value}
                label=""
                placeholder={props.placeholder}
                onChange={(event) => props.onChangeFn(event.target.value)}
                type={props.password ? "password" : undefined}
                variant='outlined'
                error={props.helperText !== ""}
                style={{ width: "230px" }}
            />
            <FormHelperText error>{props.helperText}</FormHelperText>
        </FormControl>
    )
}

interface PropsFormButtonSubmit {
    loading?: boolean,
    onClick: Function
}

export function FormButtonSubmit(props: PropsFormButtonSubmit) {
    return (
        <Button
            onClick={() => props.onClick()}
            disabled={props.loading}
            variant="contained"
            data-cy="button_login"
        >
            <Typography style={{ fontWeight: "bold", fontSize: 16 }}>
                Accedi
            </Typography>
        </Button>

    )
}