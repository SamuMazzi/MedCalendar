import Box from "@mui/material/Box"
import Image from 'next/image'
import useWindowSize from "../../logic/hooks/use_window_size"

interface PropsDecorationImage {
    path: string,
    width: number,
    height: number
    position: "left" | "center" | "right",
    priority?: boolean
}

const getResponsiveValues = (value: number) => {
   return { sm: value / 2, md: value/1.8, lg: value / 1.3, xl: value }
}

export default function DecorationImage(props: PropsDecorationImage) {
    const size = useWindowSize()

    return (
        size.width !== undefined && size.width > 600 ?  //* 600px è la screen width per "sm"
        <Box
            //alignItems={props.position === "center" ? "center" : undefined}
            sx={{
                width: getResponsiveValues(props.width),
                height: getResponsiveValues(props.height),
                pb: "50px"
            }}
            //component={Image}
            style={{
                position: 'absolute',
                bottom: 0,
                right: props.position === "right" ? 0 : undefined,
                left: props.position === "left" ? 0 : props.position === "center" ? "50%" : undefined,
                transform: props.position === "center" ? "translateX(-50%)" : undefined
            }} 
            display={{ xs: 'none', md: 'block' }} 
        >
            <div style={{position: 'relative', width: '100%', height: '100%'}}>
            <Image 
                src={props.path} 
                alt={props.path}
                priority={props.priority}
                //width={props.width}
                //height={props.width/1.5}
                fill
                sizes='100vw'
                />
            </div>                
        </Box> 
        : <></>   
    )
}

/**
 * import React, { useState } from 'react';
import Image from 'next/image';

const ImageWithFallback = (props) => {
    const { src, fallbackSrc, ...rest } = props;
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <Image
            {...rest}
            src={imgSrc}
            onError={() => {
                setImgSrc(fallbackSrc);
            }}
        />
    );
};

export default ImageWithFallback;
 */