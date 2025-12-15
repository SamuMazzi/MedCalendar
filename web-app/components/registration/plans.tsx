import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useAppDispatch } from '../../logic/redux/store'
import { PricingPlan, setPricingPlan } from '../../logic/redux/configuration_district_slice'
import { Button } from "primereact/button";

interface PropsPageStepper {
    nextPage: () => void
}

interface PropsSinglePlan {
    title: string
    description: string
    price?: number
    features: string[]
    callback: () => void
    text_btn?: string
}

const SinglePlan = (props: PropsSinglePlan) => {
    return (
        <div className="p-3 text-white">
            <div className="shadow-xl bg-b-plans p-3 h-full flex flex-1 flex-col justify-between" style={{ borderRadius: '10px' }}>
                <div>
                    <div className="text-900 text-center font-bold text-xl mb-2">{props.title}</div>
                    <div className="text-600 text-center">{props.description}</div>
                    {
                        props.price &&
                        <>
                            <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                            <div className="align-items-center">
                                <span className="font-bold text-2xl text-900">{props.price} €</span>
                                <span className="ml-2 font-medium text-600">al mese</span>
                            </div>
                        </>
                    }
                    <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                    <ul className="list-none p-0 m-0">
                        {
                            props.features.map((feature, index) => (
                                <li key={index} className="align-items-center mb-3">
                                    <CheckRoundedIcon />
                                    <span className='ml-2'>{feature}</span>
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <div>
                    <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300 mt-auto" />
                    <Button label={props.text_btn ?? "Compra adesso!"} onClick={props.callback} className="p-3 w-full mt-auto" />
                </div>
            </div>
        </div>
    )
}

export const PagePlans = (props: PropsPageStepper) => {
    const dispatch = useAppDispatch()

    const handleSelectPiano = (plan: PricingPlan) => {
        dispatch(setPricingPlan(plan))
        props.nextPage()
    }

    return(  
        <div className="surface-0 mx-8 mt-4">
            <div className="text-900 font-bold text-6xl mb-4 text-center">Pricing Plans</div>
            <div className="text-700 text-xl mb-6 text-center line-height-3">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos.</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SinglePlan 
                    title="Guardia medica"
                    description="Plan description"
                    price={9}
                    features={[
                        "Configura liberamente la struttura dei turni",
                        "Raccogli le disponibilità dai medici",
                        "Lascia che il nostro servizio crei i turni",
                        "Applica tutte le modifiche che vuoi",
                        "Ottieni le info su un Excel",
                        "Massimo 90 medici",
                        "Massimo 7 sedi",
                        "Massimo 4 configurazioni regolari",
                    ]}
                    callback={() => handleSelectPiano("GM_Base")}
                />

                <SinglePlan 
                    title="Premium"
                    description="Plan description"
                    price={29}
                    features={[
                        "Arcu vitae elementum",
                        "Dui faucibus in ornare",
                        "Morbi tincidunt augue",
                        "Arcu vitae elementum",
                        "Dui faucibus in ornare",
                    ]}
                    callback={() => handleSelectPiano("GM_Base")}
                />
                
                <SinglePlan 
                    title="Personalizzato"
                    description="Hai esigenze diverse?"
                    features={[
                    ]}
                    callback={() => handleSelectPiano("Contattaci")}
                    text_btn='Contattaci'
                />
            </div>
        </div>    
    )
}