import { mockFirebase } from 'firestore-jest-mock';
import { mockCollection, mockDoc } from 'firestore-jest-mock/mocks/firestore'
import { Timestamp } from '@firebase/firestore'

mockFirebase({
    database: {
        distretti: [
            {
                id: 'Sassuolo',
                lastTimeModifyDoctors: Timestamp.fromDate(new Date.UTC(2023, 0, 23, 13, 23)),
                _collections: {
                    info: [
                        {
                            id: 'info_medici',
                            id_med: 'info_med'
                        },
                        {
                            id: 'info_sedi',
                            sedi: {
                                Formigine: {
                                    medici_per_turno: 2
                                },
                                Sassuolo: {
                                    medici_per_turno: 2
                                }
                            },
                            turni: {
                                '20-8': "1,2,3,4,5,6,7",
                                '14-20': "6,7",
                                '8-14': "6,7"
                            }
                        },
                        {
                            id: 'list_medici',
                            list: 'list'
                        },
                    ]
                }
            }
        ]
    },
});

describe('My test', () => {
    const firebase = require('firebase');
    const db = firebase.firestore();
    
    it('first test', () => {
        return db
            .collection('users')
            .doc('abc456')
            .collection('notes')
            .get()
            .then(noteDocs => {
                // Assert that a collection or document ID was referenced
                expect(mockCollection).toHaveBeenNthCalledWith(1, 'users');
                expect(mockDoc).toHaveBeenCalledWith('abc456');
                expect(mockCollection).toHaveBeenNthCalledWith(2, 'notes');

                // Write other assertions here
        });
        // expect().toBe()
    })
    it.todo('second test')
})