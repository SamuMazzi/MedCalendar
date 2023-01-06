import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector }  from './redux/store'
import { getFromStorage } from './local_utilities';

interface PropsRouteGuard {
    children: any
}

export function RouteGuard(props: PropsRouteGuard) {    
    const authState = useAppSelector((state) => state.auth);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // on initial load - run auth check 
        authCheck(router.asPath);

        // on route change start - hide page content by setting authorized to false  
        const hideContent = () => setAuthorized(false);
        router.events.on('routeChangeStart', hideContent);

        // on route change complete - run auth check 
        router.events.on('routeChangeComplete', authCheck)

        // unsubscribe from events in useEffect return function
        return () => {
            router.events.off('routeChangeStart', hideContent);
            router.events.off('routeChangeComplete', authCheck);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authState]);

    function authCheck(url: string) {
        const normal_user = authState.uid.length > 0
        const admin_user = authState.admin
        // redirect to login page if accessing a private page and not logged in 
        const publicPaths = ['/login'];
        const path = url.split('?')[0];
        //const { distretto } = router.query;
        /*
        const query = url.split('?')[1];
        */
        if (!normal_user && !publicPaths.some((el) => path.includes(el))) {
            setAuthorized(false);
            router.push({
                pathname: '/login',
                query: { returnUrl: router.asPath }
            })
            //* condizione sui distretti deve ancora essere testata
        } else if (!admin_user && path.includes('_admin')) { //* (distretto && authState.distretti.includes(distretto)) 
            setAuthorized(false);
            router.back()
        } else {
            setAuthorized(true);
        }
        return;
    }

    return (authorized && props.children);
}