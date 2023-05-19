import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getLocalActualDistretto } from './local_utilities';
import useUser from './hooks/use_user';
import { Routes } from './Routes';

interface PropsRouteGuard {
    children: any
}

export function RouteGuard(props: PropsRouteGuard) {    
    const [user, _, logout] = useUser()
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
    }, [user]);

    function authCheck(url: string) {
        const normal_user = user.uid.length > 0
        const admin_user = user.admin
        // redirect to login page if accessing a private page and not logged in 
        const publicPaths = [Routes.Login, Routes.Register];
        const path = url.split('?')[0];
        const distr = getLocalActualDistretto()  //TODO Forse si potrà sostituire con distretto in "useUser" ma è meglio testare
        if (distr === '' && !publicPaths.some((el) => path.includes(el))) {
            logout()
            setAuthorized(false);
            router.push({
                pathname: Routes.Login,
                query: { returnUrl: router.asPath }
            })
        } else if (!normal_user && !publicPaths.some((el) => path.includes(el))) {
            setAuthorized(false);
            router.push({
                pathname: Routes.Login,
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