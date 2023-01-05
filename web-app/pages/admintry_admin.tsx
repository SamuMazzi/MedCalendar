import Head from 'next/head'
import UploadDatiMedico from '../components/upload_dati_medico_admin';

export default function PageRaccolta() {

    return (
        <>
            <Head>
                <title>Upload dati</title>
            </Head>
            <UploadDatiMedico />
        </>
    )
}