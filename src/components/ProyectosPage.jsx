import React, { useRef, useState, useEffect } from 'react';
import jspreadsheet from 'jspreadsheet-ce'; 
import jSuites from 'jsuites'; 
import { Button, Modal, Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';

import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css'; 
import './ProyectosPage.css';

const generarBarraProgreso = (valor) => {
    let p = parseInt(valor) || 0;
    p = p > 100 ? 100 : p;
    p = p < 0 ? 0 : p;

    const colorTexto = p > 50 ? '#ffffff' : '#333333';

    return `<div style="width:100%;height:14px;border-radius:7px;position:relative;background:linear-gradient(to right,#17A2B8 ${p}%,#e6e9ef ${p}%);"><span style="position:absolute;top:0;left:0;width:100%;text-align:center;font-size:10px;font-weight:600;line-height:14px;pointer-events:none;color:${colorTexto};">${p}%</span></div>`;

};

// RECIBIMOS LA FUNCIÓN cambiarVista DESDE APP.JS
const ProyectosPage = ({ cambiarVista }) => {
    const jRef = useRef(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5114/api/Proyectos/GetProyectos')
            .then(response => response.json())
            .then(data => {
                const dataDeBD = data.map(item => [
                    item.idProyecto,                                                          // 0
                    item.prioridad,                                                           // 1
                    item.nombreProyecto || item.proyecto,                                     // 2
                    item.referencia,                                                          // 3
                    item.pozo,                                                                // 4
                    item.cliente,                                                             // 5
                    item.fechaRequerida ? item.fechaRequerida.split('T')[0] : '',             // 6
                    item.fechaEstimadaEntrega ? item.fechaEstimadaEntrega.split('T')[0] : '', // 7
                    generarBarraProgreso(item.avanceGeneral),                                 // 8 ← barra
                    item.costo,                                                               // 9
                    item.comentarios                                                          // 10
                ]);

                const opcionesCalendario = {
                    format: 'YYYY-MM-DD',
                    time: false,
                    resetButton: false,
                    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                    monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                    weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                    weekdays_short: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                    weekdays_letter: ['D', 'L', 'M', 'M', 'J', 'V', 'S']
                };

                if (!jRef.current) {
                    jRef.current = jspreadsheet(document.getElementById('spreadsheet'), {
                        
                        tableOverflow: true, 
                        tableHeight: '450px',
                        
                        worksheets: [{
                            data: dataDeBD,
                            defaultRowHeight: 32, // ← altura base desde jspreadsheet
                            columns: [
                                { type: 'text',     title: 'IdProyecto',                width: 100, readOnly: true },
                                { type: 'dropdown', title: 'Prioridad',                 width: 100, source: ['Alta', 'Media', 'Baja'] },
                                { type: 'text',     title: 'Proyecto',                  width: 250 },
                                { type: 'text',     title: 'REFERENCIA',                width: 150 },
                                { type: 'text',     title: 'Pozo',                      width: 100 },
                                { type: 'text',     title: 'Cliente',                   width: 150 },
                                { type: 'calendar', title: 'Fecha Requerida',           width: 150, options: opcionesCalendario },
                                { type: 'calendar', title: 'Fecha Estimada de Entrega', width: 200, options: opcionesCalendario },
                                { type: 'html',     title: 'Avance %',                  width: 180, readOnly: true, stripHTML: false}, // 8
                                { type: 'numeric',  title: 'Costo',                     width: 150, mask: '$#,##0.00' }, // 9
                                { type: 'text',     title: 'Comentarios',               width: 300 }, // 10
                            ],
                            allowInsertRow: true,
                            allowDeleteRow: true,
                        }],

                        onbeforechange: (worksheet, cell, x, y, value) => {
                            if (x == 8) return false;

                            const oldValue = worksheet.options.data[y][x];
                            const textoViejo = (oldValue === null || oldValue === undefined) ? "" : oldValue;
                            const textoNuevo = (value === null || value === undefined) ? "" : value;

                            if (textoViejo != textoNuevo) {
                                const confirmed = window.confirm(`¿Estás seguro de guardar el cambio en la celda?\nDe: ${textoViejo} \nA: ${textoNuevo}`);
                                if (!confirmed) {
                                    return oldValue;
                                }
                            }
                            return value; 
                        },

                        onchange: (worksheet, cell, x, y, value) => {
                            const rowData = worksheet.getRowData(y);
                            const idProyecto = rowData[0];

                            if (!idProyecto) return;

                            const payload = {
                                idProyecto: idProyecto,
                                prioridad: rowData[1],
                                nombreProyecto: rowData[2],
                                referencia: rowData[3],
                                pozo: rowData[4] || "",
                                cliente: rowData[5],
                                fechaRequerida: rowData[6],
                                fechaEstimadaEntrega: rowData[7],
                                // rowData[8] es la barra HTML, no se envía al backend
                                costo: parseFloat(String(rowData[9]).replace(/[$,]/g, '')) || 0,
                                comentarios: rowData[10] || ""
                            };

                            fetch(`http://localhost:5114/api/Proyectos/ActualizarProyecto/${idProyecto}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            })
                            .then(response => {
                                if (!response.ok) throw new Error("Error en el servidor");
                                console.log(`Proyecto ${idProyecto} actualizado en la BD.`);
                            })
                            .catch(error => {
                                console.error("Error al actualizar la base de datos:", error);
                            });
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
            .catch(error => console.error("Error al cargar los datos:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    const NuevoProyectoModal = () => {
        const [validated, setValidated] = useState(false);
        const formRef = useRef();

        const handleSubmit = (event) => {
            const form = event.currentTarget;
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
                setValidated(true);
                return;
            } 
            
            event.preventDefault();
            const formData = new FormData(formRef.current);
            const newProject = Object.fromEntries(formData.entries());

            const payload = {
                idProyecto: newProject.idProyecto,
                prioridad: newProject.prioridad,
                nombreProyecto: newProject.proyecto,
                referencia: newProject.referencia,
                pozo: newProject.pozo || "",
                cliente: newProject.cliente,
                fechaRequerida: newProject.fechaRequerida,
                fechaEstimadaEntrega: newProject.fechaEntrega,
                avanceGeneral: parseInt(newProject.avanceGeneral || 0),
                costo: parseFloat(newProject.costo || 0),
                comentarios: newProject.comentarios || ""
            };

            fetch('http://localhost:5114/api/Proyectos/CrearProyecto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) throw new Error("Error al guardar en el servidor");
                return response.json();
            })
            .then(savedData => {
                const newRowData = [
                    savedData.idProyecto,                           // 0
                    savedData.prioridad,                            // 1
                    savedData.nombreProyecto || savedData.proyecto, // 2
                    savedData.referencia,                           // 3
                    savedData.pozo,                                 // 4
                    savedData.cliente,                              // 5
                    savedData.fechaRequerida.split('T')[0],         // 6
                    savedData.fechaEstimadaEntrega.split('T')[0],   // 7
                    generarBarraProgreso(savedData.avanceGeneral),  // 8 ← barra
                    savedData.costo,                                // 9
                    savedData.comentarios                           // 10
                ];
                
                if(jRef.current && jRef.current[0]) {
                    jRef.current[0].insertRow(newRowData);
                }
                
                handleCloseModal();
            })
            .catch(error => {
                console.error("Hubo un problema guardando el proyecto:", error);
                alert("Hubo un error al guardar. Revisa la consola.");
            });
        };

        return (
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title-custom">Nuevo <span className="text-success">Proyecto</span></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form ref={formRef} noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="idProyecto">
                                <Form.Label>IdProyecto *</Form.Label>
                                <Form.Control required type="text" name="idProyecto" placeholder="Ingresa ID del proyecto (ej: P005)" />
                                <Form.Control.Feedback type="invalid">Campo requerido.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="prioridad">
                                <Form.Label>Prioridad *</Form.Label>
                                <Form.Select required name="prioridad">
                                    <option value="">Selecciona prioridad...</option>
                                    <option value="Alta">Alta</option>
                                    <option value="Media">Media</option>
                                    <option value="Baja">Baja</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Campo requerido.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Form.Group className="mb-3" controlId="proyecto">
                            <Form.Label>Proyecto *</Form.Label>
                            <Form.Control required type="text" name="proyecto" placeholder="Nombre completo del proyecto" />
                            <Form.Control.Feedback type="invalid">Campo requerido.</Form.Control.Feedback>
                        </Form.Group>

                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="referencia">
                                <Form.Label>REFERENCIA *</Form.Label>
                                <Form.Control required type="text" name="referencia" placeholder="Referencia interna (ej: REF-E5)" />
                                <Form.Control.Feedback type="invalid">Campo requerido.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="pozo">
                                <Form.Label>Pozo</Form.Label>
                                <Form.Control type="text" name="pozo" placeholder="Nombre del Pozo (opcional)" />
                            </Form.Group>
                            <Form.Group as={Col} controlId="cliente">
                                <Form.Label>Cliente *</Form.Label>
                                <Form.Control required type="text" name="cliente" placeholder="Empresa Cliente" />
                                <Form.Control.Feedback type="invalid">Campo requerido.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="fechaRequerida">
                                <Form.Label>Fecha Requerida *</Form.Label>
                                <Form.Control required type="date" name="fechaRequerida" />
                                <Form.Control.Feedback type="invalid">Campo requerido.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="fechaEntrega">
                                <Form.Label>Fecha Estimada de Entrega *</Form.Label>
                                <Form.Control required type="date" name="fechaEntrega" />
                                <Form.Control.Feedback type="invalid">Campo requerido.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="avanceGeneral">
                                <Form.Label>Avance General</Form.Label>
                                <InputGroup>
                                    <FormControl type="number" name="avanceGeneral" placeholder="0 - 100" min="0" max="100" />
                                    <InputGroup.Text>%</InputGroup.Text>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group as={Col} controlId="costo">
                                <Form.Label>Costo *</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>$</InputGroup.Text>
                                    <FormControl required type="number" step="0.01" name="costo" placeholder="0.00" />
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">Campo requerido.</Form.Control.Feedback>
                                <Form.Text className="text-muted">Presupuesto en pesos mexicanos ($ MXN).</Form.Text>
                            </Form.Group>
                        </Row>

                        <Form.Group className="mb-3" controlId="comentarios">
                            <Form.Label>Comentarios</Form.Label>
                            <Form.Control as="textarea" name="comentarios" rows={3} placeholder="Breve resumen o notas sobre el proyecto" />
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancelar</Button>
                            <Button variant="success" type="submit">Guardar Proyecto</Button>
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
                    <h1 className="header-title">Gestión de <span className="text-success">Proyectos</span></h1>
                    <div className="d-flex align-items-center mt-2">
                        <Button variant="primary" size="sm" onClick={handleShowModal}>+ Nuevo Item</Button>
                        <InputGroup className="ms-2 search-input">
                            <InputGroup.Text id="basic-addon1"><i className="fa fa-search"></i></InputGroup.Text>
                            <FormControl placeholder="Buscar..." aria-label="Buscar" aria-describedby="basic-addon1" />
                        </InputGroup>
                        <div className="ms-2 person-filter">
                            <i className="fa fa-user-circle"></i> Persona
                        </div>
                    </div>
                </div>
                {/* === AQUÍ ESTÁ EL MENÚ DE NAVEGACIÓN === */}
                <div className="header-right">
                    <div className="top-tabs mb-2">
                        <span className="active-tab">Proyectos</span>
                        <span onClick={() => cambiarVista('subproyectos')}>Subproyectos</span>
                        <span onClick={() => cambiarVista('boms')}>BOMs</span>
                        <span onClick={() => cambiarVista('gantt')}>Gantt</span>
                        <span onClick={() => cambiarVista('netsuite')}>API</span>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <h3>React Gantt Chart - Tabla de Proyectos</h3>
                <p className="text-muted mb-3">Utilizando Jspreadsheet para simulación de Excel.</p>
                <div id="spreadsheet" className="spreadsheet-container"></div>
            </main>

            <NuevoProyectoModal />
        </div>
    );
};

export default ProyectosPage;