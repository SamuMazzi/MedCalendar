import Box from "@mui/material/Box"
import Image from 'next/image'
import { heightFooter } from "./footer"

interface PropsDecorationImage {
    path: string,
    width: number,
    position: "left" | "center" | "right"
}

export default function DecorationImage(props: PropsDecorationImage) {
    return (
        <Box
        //alignItems={props.position === "center" ? "center" : undefined}
        sx={{
                width: { sm: props.width / 2, md: props.width/1.8, lg: props.width / 1.3, xl: props.width },
                height: 'auto',
                pb: "50px"
        }}
        component="img"
        src={props.path} alt={props.path}
        style={{
            position: 'absolute',
            bottom: 0,
            right: props.position === "right" ? 0 : undefined,
            left: props.position === "left" ? 0 : props.position === "center" ? "50%" : undefined,
            transform: props.position === "center" ? "translateX(-50%)" : undefined
        }} display={{ xs: 'none', md: 'block' }} />
           
    )
}