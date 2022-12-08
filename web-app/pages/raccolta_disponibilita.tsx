import { store }  from '../logic/store'
import { Provider } from 'react-redux'
import PageRaccolta from '../components/raccolta';

export default function Raccolta() {
  return (
    <Provider store={store}>
      <PageRaccolta />
    </Provider>
  )
}
/**
 * <Grid item xs={8} md={6}>
                <Button variant="contained" onClick={(event) => setIsOpenModal(true)}>Aggiungi gruppo turni</Button>
                <Modal
                  open={isOpenModal}
                  onClose={() => setIsOpenModal(false)}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <GruppoTurni gruppo={undefined} id={Object.keys(stateSedi).length.toString()} callbackFn={callbackGruppoTurno}/>
                </Modal>
                <Button onClick={() => dispatch(handleSede('Formigine'))}>Avanti</Button>
          </Grid>
 */
