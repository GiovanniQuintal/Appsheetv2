import React, { useRef, useState, useEffect } from 'react';
import jspreadsheet from 'jspreadsheet-ce'; 
import jSuites from 'jsuites'; 
import { Button, Modal, Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';

import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css'; 
import './ProyectosPage.css'; 

// === TRUCO DE LA VARIABLE CSS (--progreso) ===
const generarBarraProgreso = (valor) => {
    let p = parseInt(valor) || 0;
    p = p > 100 ? 100 : p;
    p = p < 0 ? 0 : p;
    
    const claseTexto = p > 60 ? 'barra-texto-blanco' : 'barra-texto-oscuro';

    // Mantenemos data-value para poder leer el número fácilmente al guardar
    return `
        <div data-value="${p}" style="width: 100%; background-color: #e6e9ef; border-radius: 10px; height: 20px; position: relative; overflow: hidden; margin-top: 2px;">
            <div class="barra-relleno-azul" style="--progreso: ${p}%; border-radius: 10px; height: 100%; transition: width 0.5s ease;"></div>
            <span class="${claseTexto}" style="position: absolute; top: 0; left: 0; width: 100%; text-align: center; font-size: 12px; font-weight: 600; line-height: 20px; pointer-events: none;">${p}%</span>
        </div>
    `;
};

const SubproyectosPage = ({ cambiarVista }) => {
    const jRef = useRef(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5114/api/Subproyectos/GetSubproyectos')
            .then(response => response.json())
            .then(data => {
                const dataDeBD = data.map(item => [
                    item.idSubproyecto,          // 0
                    item.idProyecto,             // 1 (FK)
                    item.proyecto,               // 2
                    item.nombreSubproyecto,      // 3
                    item.prioridad,              // 4
                    item.bom,                    // 5
                    item.revision,               // 6
                    item.status,                 // 7
                    item.mfG_INT,                // 8
                    item.mfG_EXT,                // 9
                    item.buy,                    // 10
                    generarBarraProgreso(item.avanceGeneral), // 11 ← Barra Segura
                    item.observaciones           // 12
                ]);

                if (!jRef.current) {
                    jRef.current = jspreadsheet(document.getElementById('spreadsheet'), {
                        tableOverflow: true, 
                        tableHeight: '450px',
                        worksheets: [{
                            data: dataDeBD,
                            defaultRowHeight: 32,
                            columns: [
                                { type: 'text', title: 'IdSubproyecto', width: 100, readOnly: true },
                                { type: 'text', title: 'IdProyecto', width: 100 }, 
                                { type: 'text', title: 'Proyecto', width: 150, readOnly: true },
                                { type: 'text', title: 'Subproyecto', width: 200 },
                                { type: 'dropdown', title: 'Prioridad', width: 100, source: ['Alta', 'Media', 'Baja'] },
                                { type: 'text', title: 'BOM', width: 100 },
                                { type: 'text', title: 'Revisión', width: 80 },
                                { type: 'dropdown', title: 'Status', width: 100, source: ['Activo', 'Pausado', 'Terminado'] },
                                { type: 'numeric', title: 'MFG INT', width: 80 },
                                { type: 'numeric', title: 'MFG EXT', width: 80 },
                                { type: 'numeric', title: 'BUY', width: 80 },
                                { type: 'html', title: 'Avance %', width: 150, readOnly: true, stripHTML: false }, // Col 11
                                { type: 'text', title: 'Observaciones', width: 250 },
                            ],
                            allowInsertRow: true,
                            allowDeleteRow: true,
                        }],

                        onbeforechange: (worksheet, cell, x, y, value) => {
                            if (x == 11) return false; // Bloquea la barra de avance
                            const oldValue = worksheet.options.data[y][x];
                            const textoViejo = (oldValue === null || oldValue === undefined) ? "" : oldValue;
                            const textoNuevo = (value === null || value === undefined) ? "" : value;

                            if (textoViejo != textoNuevo) {
                                const confirmed = window.confirm(`¿Estás seguro de guardar el cambio en la celda?\nDe: ${textoViejo} \nA: ${textoNuevo}`);
                                if (!confirmed) return oldValue;
                            }
                            return value; 
                        },

                        onchange: (worksheet, cell, x, y, value) => {
                            const rowData = worksheet.getRowData(y);
                            const idSubproyecto = rowData[0];
                            if (!idSubproyecto) return;

                            let avanceNumerico = 0;
                            const match = String(rowData[11]).match(/data-value="(\d+)"/);
                            if (match) avanceNumerico = parseInt(match[1]);

                            const payload = {
                                idSubproyecto: idSubproyecto,
                                idProyecto: rowData[1],
                                proyecto: rowData[2],
                                nombreSubproyecto: rowData[3],
                                prioridad: rowData[4],
                                bom: rowData[5],
                                revision: rowData[6],
                                status: rowData[7],
                                mfG_INT: parseInt(rowData[8]) || 0,
                                mfG_EXT: parseInt(rowData[9]) || 0,
                                buy: parseInt(rowData[10]) || 0,
                                avanceGeneral: avanceNumerico,
                                observaciones: rowData[12] || ""
                            };

                            fetch(`http://localhost:5114/api/Subproyectos/ActualizarSubproyecto/${idSubproyecto}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            }).then(response => {
                                if (!response.ok) throw new Error("Error en servidor");
                            }).catch(err => console.error(err));
                        },
                        onload: () => {
                            document.querySelectorAll('#spreadsheet tbody tr').forEach(fila => {
                                fila.style.height = '32px';
                                fila.style.maxHeight = '32px';
                            });
                        }
                    });
                }
            })
            .catch(error => console.error("Error al cargar:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    const NuevoModal = () => {
        const [validated, setValidated] = useState(false);
        const formRef = useRef();

        const handleSubmit = (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (form.checkValidity() === false) {
                event.stopPropagation();
                setValidated(true);
                return;
            } 
            
            const formData = new FormData(formRef.current);
            const data = Object.fromEntries(formData.entries());

            const payload = {
                idSubproyecto: data.idSubproyecto,
                idProyecto: data.idProyecto,
                proyecto: data.proyecto,
                nombreSubproyecto: data.subproyecto,
                prioridad: data.prioridad,
                bom: data.bom,
                revision: data.revision,
                status: data.status,
                mfG_INT: parseInt(data.mfgInt) || 0,
                mfG_EXT: parseInt(data.mfgExt) || 0,
                buy: parseInt(data.buy) || 0,
                avanceGeneral: parseInt(data.avanceGeneral) || 0,
                observaciones: data.observaciones || ""
            };

            fetch('http://localhost:5114/api/Subproyectos/CrearSubproyecto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(savedData => {
                const newRow = [
                    savedData.idSubproyecto, savedData.idProyecto, savedData.proyecto, 
                    savedData.nombreSubproyecto, savedData.prioridad, savedData.bom, 
                    savedData.revision, savedData.status, savedData.mfG_INT, 
                    savedData.mfG_EXT, savedData.buy, 
                    generarBarraProgreso(savedData.avanceGeneral), 
                    savedData.observaciones
                ];
                if(jRef.current && jRef.current[0]) jRef.current[0].insertRow(newRow);
                handleCloseModal();
            }).catch(err => console.error(err));
        };

        return (
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title-custom">Nuevo <span className="text-success">Subproyecto</span></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form ref={formRef} noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col}><Form.Label>IdSubproyecto</Form.Label><Form.Control required name="idSubproyecto" /></Form.Group>
                            <Form.Group as={Col}><Form.Label>IdProyecto (FK)</Form.Label><Form.Control required name="idProyecto" /></Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col}><Form.Label>Subproyecto</Form.Label><Form.Control required name="subproyecto" /></Form.Group>
                        </Row>
                        {/* Agrega los demás campos según necesites */}
                        <div className="d-flex justify-content-end mt-3">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancelar</Button>
                            <Button variant="success" type="submit">Guardar</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    };

    return (
        <div className="wrapper">
            <header className="header-container mb-4">
                <div className="header-left">
                    <h1 className="header-title">Gestión de <span className="text-success">Subproyectos</span></h1>
                    <div className="d-flex align-items-center mt-2">
                        <Button variant="primary" size="sm" onClick={handleShowModal}>+ Nuevo Subproyecto</Button>
                        <InputGroup className="ms-2 search-input">
                            <InputGroup.Text><i className="fa fa-search"></i></InputGroup.Text>
                            <FormControl placeholder="Buscar..." />
                        </InputGroup>
                    </div>
                </div>
                {/* MENÚ DE NAVEGACIÓN */}
                <div className="header-right">
                    <div className="top-tabs mb-2">
                        <span onClick={() => cambiarVista('proyectos')}>Proyectos</span>
                        <span className="active-tab">Subproyectos</span>
                        <span onClick={() => cambiarVista('boms')}>BOMs</span>
                        <span onClick={() => cambiarVista('gantt')}>Gantt</span>
                    </div>
                </div>
            </header>
            <main className="main-content">
                <div id="spreadsheet" className="spreadsheet-container"></div>
            </main>
            <NuevoModal />
        </div>
    );
};

export default SubproyectosPage;